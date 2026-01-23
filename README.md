# Claude Hands

See what Claude Code is doing to your app — live in the browser. When Claude reads a component, eyes appear on it. When it edits one, hands appear. You get a real-time visual sense of where Claude is "looking" and "touching" in your running app.

Supports **Vue** (2 & 3) and **React** (16+) in development mode.

## How It Works

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│ Claude Code │──────▶│ Relay Server │──────▶│ Chrome Extension│──────▶│  Your App    │
│   (hooks)   │ HTTP  │  (Node.js)   │  WS   │ (content script)│  DOM  │  (overlays)  │
└─────────────┘       └──────────────┘       └─────────────────┘       └──────────────┘
```

1. **Claude Code hooks** fire every time Claude uses a file tool (Read, Edit, Write, Glob, Grep). A small Node.js script receives the tool event on stdin and POSTs it to the relay server.

2. **Relay server** (localhost:9527) receives the HTTP events and broadcasts them over WebSocket (localhost:9528) to any connected browser tabs.

3. **Chrome extension** maintains a WebSocket connection to the relay. When it receives a file event, the content script scans the page's component tree (Vue or React) to find which DOM element corresponds to that file path.

4. **Visual overlay** — if a matching component is found, an animated emoji indicator and a pulsing highlight appear directly on the component in the page. Indicators auto-fade after 4 seconds.

### Path Matching

- **Vue** components in dev mode expose their source file path via `__file`.
- **React** components in dev mode expose source info via `_debugSource` on fiber nodes.

The extension normalizes both the hook's file path and the component's source path to a `src/`-relative path and fuzzy-matches them.

### What Gets Tracked

| Tool | Operation | Indicator | Color |
|------|-----------|-----------|-------|
| Read | read | 👁️ Eyes | Blue (#3B82F6) |
| Edit | edit | 🤚 Hands | Amber (#D97706) |
| Write | write | 🤚 Hands | Amber (#D97706) |
| Glob | search | 👁️ Eyes | Blue (#3B82F6) |
| Grep | search | 👁️ Eyes | Blue (#3B82F6) |

Non-frontend files (anything without a `.vue`, `.jsx`, `.tsx`, `.js`, `.ts`, `.css`, `.html`, or `.json` extension) are ignored.

## Quick Start

### Prerequisites

- Node.js 18+
- Chrome browser

### 1. Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked** → select the `chrome-extension/` folder from this repo

### 2. Set up the CLI

```bash
npx claude-hands setup
```

This does two things:
- Copies the hook script to `~/.claude/hooks/claude-hands-hook.js`
- Adds PreToolUse/PostToolUse entries to `~/.claude/settings.json`

### 3. Start the relay server

```bash
npx claude-hands start
```

### 4. Use it!

Open your Vue or React dev server in Chrome, then use Claude Code on your component files:

```
claude "Read the Header component"
claude "Add a new nav link to Header.vue"
```

### Check relay status

```bash
npx claude-hands status
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `chrome-extension/` | Manifest V3 extension: service worker, content scripts, popup UI |
| `relay-server/` | Node.js HTTP+WebSocket server that bridges hooks to the extension |
| `bin/`, `lib/` | CLI (`setup`, `start`, `status`) and hook script template |
| `hooks/` | Reference/development copy of the original bash hook |
| `demo-vue-app/` | Sample Vue 3 + Vite app for testing |
| `demo-react-app/` | Sample React + Vite app for testing |

## Development & Testing

### Testing with the Vue demo app

```bash
cd demo-vue-app && npm install && npm run dev
```

Open `http://localhost:5173` in Chrome (with the extension loaded and relay running). Use Claude Code to read/edit files in `demo-vue-app/src/components/` — overlays should appear on matching components.

### Testing with the React demo app

```bash
cd demo-react-app && npm install && npm run dev
```

Open the React dev server URL in Chrome. Use Claude Code to read/edit files in `demo-react-app/src/components/` (e.g. `Header.jsx`, `Card.jsx`, `Sidebar.jsx`). Overlays appear on the matching React components.

React's `_debugSource` — which the scanner relies on — is automatically enabled by Vite's `@vitejs/plugin-react` in development mode. No extra configuration needed.

### Running the relay server

```bash
# Standard
cd relay-server && npm install && npm start

# With auto-reload for development
cd relay-server && npm run dev
```

### Full test checklist

1. Load the Chrome extension (chrome://extensions → Load unpacked → `chrome-extension/`)
2. Start the relay server: `npx claude-hands start`
3. Start a demo app (Vue or React)
4. Open the app in Chrome — the extension popup should show "Connected"
5. Use Claude Code to read/edit component files — overlays should appear
6. Verify overlays auto-fade after ~4 seconds
7. Verify the popup shows active operations while they're in progress

## Technical Notes

- **Vue 2 & 3**: Scans `__vueParentComponent` (Vue 3) and `__vue__` (Vue 2) for `__file`
- **React 16+**: Scans `__reactFiber$` (React 17+) and `__reactInternalInstance$` (React 16) for `_debugSource.fileName`
- **Dev mode only**: Both Vue's `__file` and React's `_debugSource` are stripped in production builds — this only works with dev servers
- **React tooling**: `@vitejs/plugin-react` (or `react-scripts` / Next.js dev mode) automatically includes the babel plugin that adds `_debugSource`. If you're using a custom build setup, ensure `@babel/plugin-transform-react-jsx-source` is enabled.
- **Fire-and-forget**: The hook uses a 2-second timeout and silently fails if the relay isn't running — no impact on Claude Code performance
- **Auto-cleanup**: Stale operations are removed after 30 seconds
- **Ports**: 9527 (HTTP) and 9528 (WebSocket) — hardcoded for now
