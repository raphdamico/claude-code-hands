import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, mkdir, rm, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { mergeHooksIntoSettings } from '../lib/settings-merge.js';

const HOOK_PATH = '/usr/local/bin/claude-hands-hook';

async function makeTmpDir() {
  const dir = join(tmpdir(), `settings-merge-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe('mergeHooksIntoSettings', () => {
  let tmpDir;
  let settingsPath;

  beforeEach(async () => {
    tmpDir = await makeTmpDir();
    settingsPath = join(tmpDir, 'settings.json');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('preserves existing settings after merge', async () => {
    const existing = {
      theme: 'dark',
      editor: { fontSize: 14, tabSize: 2 },
      plugins: ['a', 'b'],
    };
    await writeFile(settingsPath, JSON.stringify(existing, null, 2));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.equal(result.theme, 'dark');
    assert.deepEqual(result.editor, { fontSize: 14, tabSize: 2 });
    assert.deepEqual(result.plugins, ['a', 'b']);
    assert.ok(result.hooks);
    assert.ok(Array.isArray(result.hooks.PreToolUse));
    assert.ok(Array.isArray(result.hooks.PostToolUse));
  });

  it('is idempotent: running twice produces the same result', async () => {
    await writeFile(settingsPath, JSON.stringify({ foo: 'bar' }));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    const first = await readFile(settingsPath, 'utf8');

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    const second = await readFile(settingsPath, 'utf8');

    assert.equal(first, second);
  });

  it('throws descriptive error on invalid JSON and does NOT modify the file', async () => {
    const invalidJson = '{ "foo": bar }';
    await writeFile(settingsPath, invalidJson);

    await assert.rejects(
      () => mergeHooksIntoSettings(settingsPath, HOOK_PATH),
      (err) => {
        assert.ok(err.message.includes('invalid JSON'), `Expected "invalid JSON" in: ${err.message}`);
        assert.ok(err.message.includes('settings.json'), `Expected path in: ${err.message}`);
        assert.ok(err.message.includes('fix the syntax error'), `Expected fix advice in: ${err.message}`);
        return true;
      }
    );

    // File should be untouched
    const afterContent = await readFile(settingsPath, 'utf8');
    assert.equal(afterContent, invalidJson);
  });

  it('creates new settings file when none exists', async () => {
    const result = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    assert.equal(result.skipped, false);
    const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.ok(settings.hooks);
    assert.equal(settings.hooks.PreToolUse.length, 1);
    assert.equal(settings.hooks.PostToolUse.length, 1);
  });

  it('throws descriptive error for non-object hooks value (string)', async () => {
    await writeFile(settingsPath, JSON.stringify({ hooks: 'bad' }));

    await assert.rejects(
      () => mergeHooksIntoSettings(settingsPath, HOOK_PATH),
      (err) => {
        assert.ok(err.message.includes('invalid "hooks" value'), `Expected hooks error in: ${err.message}`);
        assert.ok(err.message.includes('string'), `Expected type info in: ${err.message}`);
        return true;
      }
    );
  });

  it('throws descriptive error for non-object hooks value (array)', async () => {
    await writeFile(settingsPath, JSON.stringify({ hooks: [1, 2, 3] }));

    await assert.rejects(
      () => mergeHooksIntoSettings(settingsPath, HOOK_PATH),
      (err) => {
        assert.ok(err.message.includes('invalid "hooks" value'), `Expected hooks error in: ${err.message}`);
        assert.ok(err.message.includes('array'), `Expected type info in: ${err.message}`);
        return true;
      }
    );
  });

  it('throws descriptive error for non-object hooks value (number)', async () => {
    await writeFile(settingsPath, JSON.stringify({ hooks: 42 }));

    await assert.rejects(
      () => mergeHooksIntoSettings(settingsPath, HOOK_PATH),
      (err) => {
        assert.ok(err.message.includes('invalid "hooks" value'), `Expected hooks error in: ${err.message}`);
        assert.ok(err.message.includes('number'), `Expected type info in: ${err.message}`);
        return true;
      }
    );
  });

  it('cleans up temp file on successful write (atomic write)', async () => {
    await writeFile(settingsPath, JSON.stringify({}));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const files = await readdir(tmpDir);
    const tmpFiles = files.filter(f => f.endsWith('.tmp'));
    assert.equal(tmpFiles.length, 0, `Expected no .tmp files, found: ${tmpFiles}`);
  });

  it('creates pre-write backup with timestamp when file exists', async () => {
    await writeFile(settingsPath, JSON.stringify({ existing: true }));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 1, `Expected 1 backup, found: ${backups}`);

    // Backup should contain the original content
    const backupContent = JSON.parse(await readFile(join(tmpDir, backups[0]), 'utf8'));
    assert.equal(backupContent.existing, true);
    assert.equal(backupContent.hooks, undefined);
  });

  it('does NOT create backup when file did not previously exist', async () => {
    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 0, `Expected no backups for new file, found: ${backups}`);
  });

  it('returns skipped:true when hooks already present', async () => {
    await writeFile(settingsPath, JSON.stringify({}));

    const first = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    assert.equal(first.skipped, false);

    const second = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    assert.equal(second.skipped, true);
  });

  it('accepts hooks:null and treats it as empty', async () => {
    await writeFile(settingsPath, JSON.stringify({ hooks: null }));

    const result = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    assert.equal(result.skipped, false);

    const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.ok(settings.hooks.PreToolUse.length > 0);
  });

  it('updates stale matcher on re-run', async () => {
    // Simulate an old install with a narrower matcher
    const oldSettings = {
      hooks: {
        PreToolUse: [{ matcher: 'Read|Edit', hooks: [{ type: 'command', command: HOOK_PATH }] }],
        PostToolUse: [{ matcher: 'Read|Edit', hooks: [{ type: 'command', command: HOOK_PATH }] }],
      }
    };
    await writeFile(settingsPath, JSON.stringify(oldSettings));

    const result = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    assert.equal(result.skipped, false);

    const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
    // Matcher should be updated, not duplicated
    assert.equal(settings.hooks.PreToolUse.length, 1);
    assert.equal(settings.hooks.PostToolUse.length, 1);
    // Matcher should contain all current tools
    assert.ok(settings.hooks.PreToolUse[0].matcher.includes('Read'));
    assert.ok(settings.hooks.PreToolUse[0].matcher.includes('Write'));
    assert.ok(settings.hooks.PreToolUse[0].matcher.includes('Glob'));
    assert.ok(settings.hooks.PreToolUse[0].matcher.includes('Grep'));
  });

  it('throws on top-level array', async () => {
    await writeFile(settingsPath, JSON.stringify([1, 2, 3]));

    await assert.rejects(
      () => mergeHooksIntoSettings(settingsPath, HOOK_PATH),
      (err) => {
        assert.ok(err.message.includes('invalid top-level'), `Expected "invalid top-level" in: ${err.message}`);
        assert.ok(err.message.includes('array'), `Expected "array" in: ${err.message}`);
        return true;
      }
    );
  });

  it('preserves other hooks when updating stale matcher', async () => {
    const oldSettings = {
      hooks: {
        PreToolUse: [
          { matcher: 'Bash', hooks: [{ type: 'command', command: '/other/hook' }] },
          { matcher: 'Read|Edit', hooks: [{ type: 'command', command: HOOK_PATH }] },
        ],
        PostToolUse: [
          { matcher: 'Read|Edit', hooks: [{ type: 'command', command: HOOK_PATH }] },
        ],
      }
    };
    await writeFile(settingsPath, JSON.stringify(oldSettings));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
    // Other tool's entry preserved
    assert.equal(settings.hooks.PreToolUse.length, 2);
    assert.equal(settings.hooks.PreToolUse[0].hooks[0].command, '/other/hook');
    assert.equal(settings.hooks.PreToolUse[0].matcher, 'Bash');
  });

  it('no backup on skip when matcher already current', async () => {
    await writeFile(settingsPath, JSON.stringify({}));

    // First run creates settings + backup
    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    const filesAfterFirst = await readdir(tmpDir);
    const backupsFirst = filesAfterFirst.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backupsFirst.length, 1);

    // Second run should skip — no new backup
    const result = await mergeHooksIntoSettings(settingsPath, HOOK_PATH);
    assert.equal(result.skipped, true);
    const filesAfterSecond = await readdir(tmpDir);
    const backupsSecond = filesAfterSecond.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backupsSecond.length, 1, 'Should still have only 1 backup after skip');
  });

  it('preserves existing hook entries from other tools', async () => {
    const existing = {
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: '/other/hook' }] }],
        PostToolUse: [],
      }
    };
    await writeFile(settingsPath, JSON.stringify(existing));

    await mergeHooksIntoSettings(settingsPath, HOOK_PATH);

    const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.equal(settings.hooks.PreToolUse.length, 2);
    assert.equal(settings.hooks.PreToolUse[0].hooks[0].command, '/other/hook');
  });
});
