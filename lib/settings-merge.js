import { readFile, writeFile, rename, copyFile } from 'fs/promises';
import { dirname, basename } from 'path';
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

/**
 * Write JSON atomically: write to a temp file then rename into place.
 * rename() is atomic on POSIX when src and dst are on the same filesystem.
 */
async function atomicWriteJson(filePath, data) {
  const tmpPath = filePath + '.tmp';
  const json = JSON.stringify(data, null, 2) + '\n';
  await writeFile(tmpPath, json);
  await rename(tmpPath, filePath);
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

  // Create timestamped backup before writing (only if file already existed)
  if (fileExisted) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = settingsPath + `.backup.${timestamp}`;
    await copyFile(settingsPath, backupPath);
  }

  // Atomic write: temp file then rename
  await atomicWriteJson(settingsPath, settings);
  return { skipped: false };
}
