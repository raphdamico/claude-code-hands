#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const command = process.argv[2];

switch (command) {
  case 'setup': {
    const { setup } = await import(join(root, 'lib', 'setup.js'));
    await setup(root);
    break;
  }
  case 'start': {
    const { start } = await import(join(root, 'lib', 'start.js'));
    start(root);
    break;
  }
  case 'status': {
    try {
      const res = await fetch('http://localhost:9527/status');
      const data = await res.json();
      console.log('Relay server is running');
      console.log(`  WebSocket clients: ${data.wsClients}`);
      console.log(`  Active operations: ${data.activeOperations}`);
    } catch {
      console.log('Relay server is not running');
      console.log('  Start it with: npx claude-vue-viz start');
      process.exitCode = 1;
    }
    break;
  }
  default:
    console.log(`
claude-vue-viz — See what Claude Code is doing to your Vue app

Commands:
  setup    Install hook script and configure Claude settings
  start    Launch the relay server
  status   Check if the relay server is running

Usage:
  npx claude-vue-viz setup
  npx claude-vue-viz start
`);
    if (command) process.exitCode = 1;
}
