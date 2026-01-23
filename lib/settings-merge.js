import { readFile, writeFile, rename } from 'fs/promises';
import config from './config.js';

// Derive matcher from tracker registry — all unique tool names
const MATCHER = [...new Set(config.trackers.flatMap(t => t.tools))].join('|');

function buildHookEntry(hookPath) {
  return {
    matcher: MATCHER,
    hooks: [
      {
        type: 'command',
        command: hookPath
      }
    ]
  };
}

function hasMatchingEntry(entries, hookPath) {
  if (!Array.isArray(entries)) return false;
  return entries.some(entry =>
    Array.isArray(entry.hooks) &&
    entry.hooks.some(h => h.command === hookPath)
  );
}

export async function mergeHooksIntoSettings(settingsPath, hookPath) {
  let settings;

  try {
    const raw = await readFile(settingsPath, 'utf8');
    settings = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      settings = {};
    } else if (err instanceof SyntaxError) {
      // Corrupted JSON — back up and start fresh
      const backup = settingsPath + '.backup';
      await rename(settingsPath, backup);
      console.log(`  ⚠ Backed up corrupted settings → ${backup}`);
      settings = {};
    } else {
      throw err;
    }
  }

  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.PreToolUse)) settings.hooks.PreToolUse = [];
  if (!Array.isArray(settings.hooks.PostToolUse)) settings.hooks.PostToolUse = [];

  const preExists = hasMatchingEntry(settings.hooks.PreToolUse, hookPath);
  const postExists = hasMatchingEntry(settings.hooks.PostToolUse, hookPath);

  if (preExists && postExists) {
    return { skipped: true };
  }

  if (!preExists) {
    settings.hooks.PreToolUse.push(buildHookEntry(hookPath));
  }
  if (!postExists) {
    settings.hooks.PostToolUse.push(buildHookEntry(hookPath));
  }

  await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  return { skipped: false };
}
