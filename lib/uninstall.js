import { unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { atomicWriteJson, isPlainObject, validateSettingsObject, createTimestampedBackup } from './settings-utils.js';

const HOOK_FILENAME = 'claude-hands-hook.mjs';
const CONFIG_FILENAME = 'claude-hands-config.mjs';

async function removeFileQuietly(filePath) {
  try {
    await unlink(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

function isClaudeHandsEntry(entry) {
  return (
    Array.isArray(entry.hooks) &&
    entry.hooks.some(h => typeof h.command === 'string' && h.command.endsWith(HOOK_FILENAME))
  );
}

export async function uninstall(claudeDirOverride) {
  const claudeDir = claudeDirOverride || join(homedir(), '.claude');
  const hooksDir = join(claudeDir, 'hooks');
  const hookPath = join(hooksDir, HOOK_FILENAME);
  const configPath = join(hooksDir, CONFIG_FILENAME);
  const settingsPath = join(claudeDir, 'settings.json');

  console.log('Uninstalling Claude Hands...\n');

  // 1. Remove hook files
  const hookRemoved = await removeFileQuietly(hookPath);
  const configRemoved = await removeFileQuietly(configPath);

  if (hookRemoved) console.log(`  ✓ Removed ${hookPath}`);
  else console.log(`  – Hook script not found (already removed)`);

  if (configRemoved) console.log(`  ✓ Removed ${configPath}`);
  else console.log(`  – Config file not found (already removed)`);

  // 2. Clean up settings.json
  let settingsRaw;
  try {
    settingsRaw = await readFile(settingsPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`  – Settings file not found (nothing to clean up)`);
      console.log('\nDone.');
      return;
    }
    throw err;
  }

  let settings;
  try {
    settings = JSON.parse(settingsRaw);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `${settingsPath} contains invalid JSON and cannot be read.\n` +
        `Parse error: ${err.message}\n` +
        `Please fix the syntax error manually before uninstalling.`
      );
    }
    throw err;
  }

  // Bug 2: validate top-level is a plain object
  validateSettingsObject(settings, settingsPath);

  // Bug 3: validate hooks structure before iterating
  if (settings.hooks !== undefined && settings.hooks !== null && !isPlainObject(settings.hooks)) {
    console.warn(
      `  ⚠ settings.hooks is not a plain object (got ${Array.isArray(settings.hooks) ? 'array' : typeof settings.hooks}) — skipping settings cleanup.`
    );
    console.log('\nDone. The Chrome extension must be removed manually from chrome://extensions.');
    return;
  }

  let settingsChanged = false;

  if (settings.hooks && typeof settings.hooks === 'object') {
    for (const key of ['PreToolUse', 'PostToolUse']) {
      if (Array.isArray(settings.hooks[key])) {
        const before = settings.hooks[key].length;
        settings.hooks[key] = settings.hooks[key].filter(e => !isClaudeHandsEntry(e));
        const removed = before - settings.hooks[key].length;
        if (removed > 0) {
          console.log(`  ✓ Removed ${removed} hook entry from hooks.${key}`);
          settingsChanged = true;
        }
        // Delete empty array
        if (settings.hooks[key].length === 0) {
          delete settings.hooks[key];
        }
      }
    }
    // Delete empty hooks object
    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }
  }

  if (settingsChanged) {
    await createTimestampedBackup(settingsPath);
    await atomicWriteJson(settingsPath, settings);
    console.log(`  ✓ Settings updated → ${settingsPath}`);
    console.log(`\n  Note: A backup of your previous settings was saved to`);
    console.log(`  ${claudeDir}/settings.json.backup.<timestamp>`);
    console.log(`  If anything looks wrong, copy the backup back over settings.json.`);
  } else {
    console.log(`  – No hook entries found in settings (already clean)`);
  }

  console.log('\nDone. The Chrome extension must be removed manually from chrome://extensions.');
}
