import { readFile } from 'fs/promises';
import config from './config.js';
import { atomicWriteJson, validateSettingsObject, createTimestampedBackup } from './settings-utils.js';

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

function findEntryByHookPath(entries, hookPath) {
  if (!Array.isArray(entries)) return null;
  return entries.find(entry =>
    Array.isArray(entry.hooks) &&
    entry.hooks.some(h => h.command === hookPath)
  ) || null;
}

export async function mergeHooksIntoSettings(settingsPath, hookPath) {
  let settings;
  let fileExisted = false;

  try {
    const raw = await readFile(settingsPath, 'utf8');
    fileExisted = true;
    settings = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      settings = {};
    } else if (err instanceof SyntaxError) {
      throw new Error(
        `${settingsPath} contains invalid JSON and cannot be read.\n` +
        `Parse error: ${err.message}\n` +
        `Please fix the syntax error manually, or delete the file if you don't need your existing settings.`
      );
    } else {
      throw err;
    }
  }

  // Validate top-level is a plain object (Bug 2)
  validateSettingsObject(settings, settingsPath);

  // Validate hooks structure
  if (settings.hooks !== undefined && settings.hooks !== null) {
    if (typeof settings.hooks !== 'object' || Array.isArray(settings.hooks)) {
      throw new Error(
        `${settingsPath} has an invalid "hooks" value (expected an object, got ${Array.isArray(settings.hooks) ? 'array' : typeof settings.hooks}).\n` +
        `Please fix or remove the "hooks" key manually.`
      );
    }
  }

  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.PreToolUse)) settings.hooks.PreToolUse = [];
  if (!Array.isArray(settings.hooks.PostToolUse)) settings.hooks.PostToolUse = [];

  let changed = false;

  for (const key of ['PreToolUse', 'PostToolUse']) {
    const existing = findEntryByHookPath(settings.hooks[key], hookPath);
    if (!existing) {
      settings.hooks[key].push(buildHookEntry(hookPath));
      changed = true;
    } else if (existing.matcher !== MATCHER) {
      // Bug 1: update stale matcher
      existing.matcher = MATCHER;
      changed = true;
    }
  }

  if (!changed) {
    return { skipped: true };
  }

  // Create timestamped backup before writing (only if file already existed)
  if (fileExisted) {
    await createTimestampedBackup(settingsPath);
  }

  // Atomic write: temp file then rename
  await atomicWriteJson(settingsPath, settings);
  return { skipped: false };
}
