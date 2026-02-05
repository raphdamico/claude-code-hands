import { readdir, writeFile, rename, copyFile, unlink } from 'fs/promises';
import { dirname, basename } from 'path';

/**
 * Write JSON atomically: write to a temp file then rename into place.
 * rename() is atomic on POSIX when src and dst are on the same filesystem.
 */
export async function atomicWriteJson(filePath, data) {
  const tmpPath = filePath + '.tmp';
  const json = JSON.stringify(data, null, 2) + '\n';
  await writeFile(tmpPath, json);
  await rename(tmpPath, filePath);
}

export function isPlainObject(val) {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function validateSettingsObject(settings, settingsPath) {
  if (!isPlainObject(settings)) {
    throw new Error(
      `${settingsPath} has an invalid top-level value (expected a JSON object, got ${Array.isArray(settings) ? 'array' : typeof settings}).\n` +
      `Please fix the file manually so it contains a JSON object (e.g. {}).`
    );
  }
}

/**
 * Keep only the most recent `keepCount` backup files for the given settings path.
 * Backup files match the pattern `<basename>.backup.*`.
 */
export async function rotateBackups(settingsPath, keepCount = 5) {
  const dir = dirname(settingsPath);
  const base = basename(settingsPath);
  const prefix = base + '.backup.';

  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return; // dir doesn't exist, nothing to rotate
  }

  const backups = entries
    .filter(f => f.startsWith(prefix))
    .sort(); // ISO-ish timestamps sort lexicographically

  if (backups.length <= keepCount) return;

  const toDelete = backups.slice(0, backups.length - keepCount);
  for (const file of toDelete) {
    try {
      await unlink(`${dir}/${file}`);
    } catch {
      // best-effort cleanup
    }
  }
}

/**
 * Create a timestamped backup of settingsPath, then rotate old backups.
 */
export async function createTimestampedBackup(settingsPath, keepCount = 5) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = settingsPath + `.backup.${timestamp}`;
  await copyFile(settingsPath, backupPath);
  await rotateBackups(settingsPath, keepCount);
}
