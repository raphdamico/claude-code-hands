#!/usr/bin/env node

// Claude Hands Hook - Sends file operations to local relay server
// Requires: Node.js 18+ (for built-in fetch)

import config from './claude-hands-config.mjs';

const RELAY_URL = `http://localhost:${config.relay.httpPort}/event`;

// Build tool -> tracker lookup from config
const toolMap = new Map();
for (const tracker of config.trackers) {
  for (const tool of tracker.tools) {
    toolMap.set(tool, tracker);
  }
}

const FRONTEND_EXTENSIONS = new Set(config.fileExtensions);

function getExtension(filePath) {
  const dot = filePath.lastIndexOf('.');
  return dot !== -1 ? filePath.slice(dot) : '';
}

function getFileLabel(filePath) {
  const ext = getExtension(filePath);
  return config.fileLabels[ext] || 'file';
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

  // Only process tools in our tracker registry
  const tracker = toolMap.get(toolName);
  if (!tracker) {
    return;
  }

  const operation = tracker.operation;

  // Extract file path based on tool
  let filePath;
  switch (toolName) {
    case 'Read':
    case 'Edit':
    case 'Write':
      filePath = input.tool_input?.file_path; break;
    case 'Glob':
    case 'Grep':
      filePath = input.tool_input?.pattern; break;
    default:
      filePath = input.tool_input?.file_path || input.tool_input?.pattern; break;
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
    visual: tracker.visual,
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
