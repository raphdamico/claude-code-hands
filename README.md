# Claude Vue Viz

Visualizes which Vue components Claude Code is "thinking about" directly in the browser, using animated indicators (eyes for reading, hands for editing).

## Architecture

```
Claude Code Hooks  →  Local Relay Server  →  Chrome Extension  →  Vue App DOM
     (bash)              (WebSocket)           (content script)    (highlights)
```

## Quick Start

### Prerequisites

- Node.js 18+
- `jq` (install via `brew install jq` or your package manager)
- Chrome browser

### 1. Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked** → select the `chrome-extension/` folder from this repo

### 2. Set up the CLI

```bash
npx claude-vue-viz setup
```

This installs the hook script and configures your Claude settings automatically.

### 3. Start the relay server

```bash
npx claude-vue-viz start
```

You should see:
```
╔════════════════════════════════════════════════╗
║       Claude Vue Viz - Relay Server            ║
╠════════════════════════════════════════════════╣
║  HTTP endpoint: http://localhost:9527/event   ║
║  WebSocket:     ws://localhost:9528             ║
╚════════════════════════════════════════════════╝
```

### 4. Use it!

Open your Vue dev server in Chrome and use Claude Code on your `.vue` files:

```
claude "Read the Header.vue component"
claude "Add a new nav link to Header.vue"
```

You'll see:
- **Eyes (👀)** appear on the component when Claude reads a `.vue` file
- **Hands (✍️)** appear when Claude edits a `.vue` file
- Pulsing blue/amber glow around the component

### Check status

```bash
npx claude-vue-viz status
```

## Components

| Directory | Purpose |
|-----------|---------|
| `chrome-extension/` | Chrome extension with Vue scanner and visual overlays |
| `relay-server/` | Node.js server that bridges hooks to Chrome extension |
| `hooks/` | Reference copy of the Claude Code hook script |
| `demo-vue-app/` | Sample Vue 3 app for testing |
| `bin/`, `lib/` | CLI and setup tooling for the npm package |

## Visual Design

| Operation | Indicator | Color |
|-----------|-----------|-------|
| Read | Cartoon eyes | Blue (#3B82F6) |
| Edit/Write | Cute hands | Amber (#D97706) |

## Development

To work on the project itself:

```bash
# Start the relay server in dev mode (auto-reload)
cd relay-server && npm install && npm run dev

# Start the demo Vue app
cd demo-vue-app && npm install && npm run dev
```

## Technical Notes

- **Vue 2 & 3 support**: Scans both `__vue__` and `__vueParentComponent`
- **Dev mode only**: The `__file` property is stripped in production builds
- **Path matching**: Fuzzy matches filenames and src-relative paths
- **Auto-cleanup**: Stale operations auto-clear after 30 seconds
- **Port conflicts**: The relay uses ports 9527 (HTTP) and 9528 (WebSocket)
