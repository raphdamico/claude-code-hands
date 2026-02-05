import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, mkdir, rm, readdir, copyFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { rotateBackups, createTimestampedBackup, isPlainObject } from '../lib/settings-utils.js';

async function makeTmpDir() {
  const dir = join(tmpdir(), `settings-utils-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe('isPlainObject', () => {
  it('returns correct results for various inputs', () => {
    assert.equal(isPlainObject({}), true);
    assert.equal(isPlainObject({ a: 1 }), true);
    assert.equal(isPlainObject([]), false);
    assert.equal(isPlainObject([1, 2]), false);
    assert.equal(isPlainObject(null), false);
    assert.equal(isPlainObject(undefined), false);
    assert.equal(isPlainObject('string'), false);
    assert.equal(isPlainObject(42), false);
    assert.equal(isPlainObject(true), false);
  });
});

describe('rotateBackups', () => {
  let tmpDir;
  let settingsPath;

  beforeEach(async () => {
    tmpDir = await makeTmpDir();
    settingsPath = join(tmpDir, 'settings.json');
    await writeFile(settingsPath, '{}');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('keeps only most recent N backups', async () => {
    // Create 7 backup files with sortable names
    for (let i = 0; i < 7; i++) {
      const ts = `2025-01-0${i + 1}T00-00-00-000Z`;
      await writeFile(join(tmpDir, `settings.json.backup.${ts}`), `backup ${i}`);
    }

    await rotateBackups(settingsPath, 3);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.')).sort();
    assert.equal(backups.length, 3);
    // Should keep the 3 most recent (05, 06, 07)
    assert.ok(backups[0].includes('05'));
    assert.ok(backups[1].includes('06'));
    assert.ok(backups[2].includes('07'));
  });

  it('does nothing when fewer than N backups exist', async () => {
    for (let i = 0; i < 2; i++) {
      const ts = `2025-01-0${i + 1}T00-00-00-000Z`;
      await writeFile(join(tmpDir, `settings.json.backup.${ts}`), `backup ${i}`);
    }

    await rotateBackups(settingsPath, 5);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 2);
  });
});

describe('createTimestampedBackup', () => {
  let tmpDir;
  let settingsPath;

  beforeEach(async () => {
    tmpDir = await makeTmpDir();
    settingsPath = join(tmpDir, 'settings.json');
    await writeFile(settingsPath, JSON.stringify({ original: true }));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates backup and rotates', async () => {
    await createTimestampedBackup(settingsPath, 5);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 1);

    // Backup content should match original
    const backupContent = JSON.parse(await readFile(join(tmpDir, backups[0]), 'utf8'));
    assert.equal(backupContent.original, true);
  });
});
