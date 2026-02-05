import { mkdir, copyFile, chmod } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { mergeHooksIntoSettings } from './settings-merge.js';

export async function setup(root) {
  const claudeDir = join(homedir(), '.claude');
  const hooksDir = join(claudeDir, 'hooks');
  const hookDest = join(hooksDir, 'claude-hands-hook.mjs');
  const configDest = join(hooksDir, 'claude-hands-config.mjs');
  const hookSrc = join(root, 'lib', 'hook-template.js');
  const configSrc = join(root, 'lib', 'config.js');
  const settingsPath = join(claudeDir, 'settings.json');

  console.log('Setting up Claude Hands...');
  console.log(`This will add hook entries to your Claude Code config at ${settingsPath}\n`);

  // 1. Create hooks directory
  await mkdir(hooksDir, { recursive: true });

  // 2. Copy config file
  await copyFile(configSrc, configDest);
  console.log(`  \u2713 Config installed \u2192 ${configDest}`);

  // 3. Copy hook script
  await copyFile(hookSrc, hookDest);
  await chmod(hookDest, 0o755);
  console.log(`  \u2713 Hook script installed \u2192 ${hookDest}`);

  // 4. Merge settings
  const result = await mergeHooksIntoSettings(settingsPath, hookDest);
  if (result.skipped) {
    console.log(`  \u2713 Settings already configured (no changes needed)`);
  } else {
    console.log(`  \u2713 Claude settings updated \u2192 ${settingsPath}`);
    console.log(`\n  Note: A backup of your previous settings was saved to`);
    console.log(`  ${claudeDir}/settings.json.backup.<timestamp>`);
    console.log(`  If anything looks wrong, copy the backup back over settings.json.`);
  }

  // Done
  console.log(`
Setup complete! Next steps:

  1. Load the Chrome extension:
     \u2022 Open chrome://extensions
     \u2022 Enable "Developer mode"
     \u2022 Click "Load unpacked" \u2192 select the chrome-extension/ folder

  2. Start the relay server:
     npx claude-hands start

  3. Open your Vue or React dev server in Chrome and use Claude Code on your component files!
`);
}
