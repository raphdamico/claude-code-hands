import { mkdir, copyFile, chmod } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { mergeHooksIntoSettings } from './settings-merge.js';

export async function setup(root) {
  const claudeDir = join(homedir(), '.claude');
  const hooksDir = join(claudeDir, 'hooks');
  const hookDest = join(hooksDir, 'vue-viz-hook.sh');
  const hookSrc = join(root, 'lib', 'hook-template.sh');

  console.log('Setting up Claude Vue Viz...\n');

  // 1. Create hooks directory
  await mkdir(hooksDir, { recursive: true });

  // 2. Copy hook script
  await copyFile(hookSrc, hookDest);
  await chmod(hookDest, 0o755);
  console.log(`  ✓ Hook script installed → ${hookDest}`);

  // 3. Merge settings
  const settingsPath = join(claudeDir, 'settings.json');
  const result = await mergeHooksIntoSettings(settingsPath, hookDest);
  if (result.skipped) {
    console.log(`  ✓ Settings already configured (no changes needed)`);
  } else {
    console.log(`  ✓ Claude settings updated → ${settingsPath}`);
  }

  // Done
  console.log(`
Setup complete! Next steps:

  1. Load the Chrome extension:
     • Open chrome://extensions
     • Enable "Developer mode"
     • Click "Load unpacked" → select the chrome-extension/ folder

  2. Start the relay server:
     npx claude-vue-viz start

  3. Open your Vue dev server in Chrome and use Claude Code on your .vue files!
`);
}
