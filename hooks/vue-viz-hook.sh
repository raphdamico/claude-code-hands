#!/bin/bash
# Claude Hands Hook - Sends file operations to local relay server
# Install: Copy to ~/.claude/hooks/ and configure in settings.json

RELAY_URL="http://localhost:9527/event"

# Read the JSON input from stdin
input=$(cat)

# Extract the tool name and determine operation type
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
session_id=$(echo "$input" | jq -r '.session_id // empty')

# Only process file-related tools
case "$tool_name" in
  Read|Edit|Write|Glob|Grep)
    ;;
  *)
    exit 0
    ;;
esac

# Extract file path and description based on tool type
description=""
case "$tool_name" in
  Read)
    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
    operation="read"
    ;;
  Edit)
    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
    operation="edit"
    ;;
  Write)
    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
    operation="write"
    ;;
  Glob)
    file_path=$(echo "$input" | jq -r '.tool_input.pattern // empty')
    operation="search"
    description="Finding files: ${file_path}"
    ;;
  Grep)
    file_path=$(echo "$input" | jq -r '.tool_input.pattern // empty')
    operation="search"
    description="Searching for: ${file_path}"
    ;;
esac

# Generate description based on file type and operation (for non-search tools)
if [ -z "$description" ] && [ -n "$file_path" ]; then
  filename=$(basename "$file_path")
  case "$file_path" in
    *.vue)
      file_label="component"
      ;;
    *.css|*.scss|*.less)
      file_label="styles"
      ;;
    *.js|*.ts|*.jsx|*.tsx)
      file_label="script"
      ;;
    *.html)
      file_label="template"
      ;;
    *.json)
      file_label="config"
      ;;
    *)
      file_label="file"
      ;;
  esac

  case "$operation" in
    read)
      description="Reading ${file_label}..."
      ;;
    edit)
      old_string_snippet=$(echo "$input" | jq -r '.tool_input.old_string // empty' | head -c 40 | tr '\n' ' ')
      if [ -n "$old_string_snippet" ]; then
        description="Editing: ${old_string_snippet}..."
      else
        description="Editing ${file_label}..."
      fi
      ;;
    write)
      description="Writing ${file_label}..."
      ;;
  esac
fi

# Skip if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Only process frontend files (or show search patterns)
if [[ "$operation" != "search" ]]; then
  case "$file_path" in
    *.vue|*.css|*.scss|*.less|*.js|*.ts|*.jsx|*.tsx|*.html|*.json)
      ;;
    *)
      exit 0
      ;;
  esac
fi

# Determine event type based on hook event
hook_event=$(echo "$input" | jq -r '.event // "PreToolUse"')
if [ "$hook_event" = "PostToolUse" ]; then
  event_type="FILE_OPERATION_END"
else
  event_type="FILE_OPERATION_START"
fi

# Build the payload
payload=$(jq -n \
  --arg type "$event_type" \
  --arg filePath "$file_path" \
  --arg operation "$operation" \
  --arg tool "$tool_name" \
  --arg sessionId "$session_id" \
  --arg description "$description" \
  '{
    type: $type,
    filePath: $filePath,
    operation: $operation,
    tool: $tool,
    sessionId: $sessionId,
    description: $description,
    timestamp: (now * 1000 | floor)
  }')

# Send to relay server (fire-and-forget, suppress errors)
curl -s -X POST "$RELAY_URL" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  --connect-timeout 1 \
  --max-time 2 \
  >/dev/null 2>&1 &

exit 0
