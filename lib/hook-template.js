#!/usr/bin/env node

// Claude Hands Hook - Sends file operations to local relay server
// Requires: Node.js 18+ (for built-in fetch)

const RELAY_URL = 'http://localhost:9527/event';

const FRONTEND_EXTENSIONS = new Set([
  '.vue', '.css', '.scss', '.less',
  '.js', '.ts', '.jsx', '.tsx',
  '.html', '.json'
]);

function getExtension(filePath) {
  const dot = filePath.lastIndexOf('.');
  return dot !== -1 ? filePath.slice(dot) : '';
}

function getFileLabel(filePath) {
  const ext = getExtension(filePath);
  switch (ext) {
    case '.vue': return 'component';
    case '.css': case '.scss': case '.less': return 'styles';
    case '.js': case '.ts': case '.jsx': case '.tsx': return 'script';
    case '.html': return 'template';
    case '.json': return 'config';
    default: return 'file';
  }
}

function buildDescription(operation, filePath, input) {
  if (operation === 'search') {
    const tool = input.tool_name;
    return tool === 'Glob'
      ? `Finding files: ${filePath}`
      : `Searching for: ${filePath}`;
  }

  const label = getFileLabel(filePath);

  if (operation === 'read') return `Reading ${label}...`;
  if (operation === 'write') return `Writing ${label}...`;
  if (operation === 'edit') {
    const snippet = (input.tool_input?.old_string || '').slice(0, 40).replace(/\n/g, ' ');
    return snippet ? `Editing: ${snippet}...` : `Editing ${label}...`;
  }
  return '';
}

async function main() {
  // Read JSON from stdin
  let raw = '';
  for await (const chunk of process.stdin) {
    raw += chunk;
  }

  const input = JSON.parse(raw);
  const toolName = input.tool_name;
  const sessionId = input.session_id || '';

  // Only process file-related tools
  if (!['Read', 'Edit', 'Write', 'Glob', 'Grep'].includes(toolName)) {
    return;
  }

  // Extract file path and operation
  let filePath, operation;
  switch (toolName) {
    case 'Read':
      filePath = input.tool_input?.file_path; operation = 'read'; break;
    case 'Edit':
      filePath = input.tool_input?.file_path; operation = 'edit'; break;
    case 'Write':
      filePath = input.tool_input?.file_path; operation = 'write'; break;
    case 'Glob':
      filePath = input.tool_input?.pattern; operation = 'search'; break;
    case 'Grep':
      filePath = input.tool_input?.pattern; operation = 'search'; break;
  }

  if (!filePath) return;

  // Only process frontend files (searches pass through)
  if (operation !== 'search' && !FRONTEND_EXTENSIONS.has(getExtension(filePath))) {
    return;
  }

  const eventType = input.event === 'PostToolUse'
    ? 'FILE_OPERATION_END'
    : 'FILE_OPERATION_START';

  const payload = {
    type: eventType,
    filePath,
    operation,
    tool: toolName,
    sessionId,
    description: buildDescription(operation, filePath, input),
    timestamp: Date.now()
  };

  // Fire-and-forget POST to relay server
  try {
    await fetch(RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
  } catch {
    // Relay not running — silently ignore
  }
}

main().catch(() => {});
