import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, mkdir, rm, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstall } from '../lib/uninstall.js';

const HOOK_FILENAME = 'claude-hands-hook.mjs';
const CONFIG_FILENAME = 'claude-hands-config.mjs';

function makeClaudeHandsEntry(hookDir) {
  return {
    matcher: 'Read|Edit|Write|Glob|Grep',
    hooks: [{ type: 'command', command: join(hookDir, HOOK_FILENAME) }]
  };
}

async function makeTmpDir() {
  const dir = join(tmpdir(), `uninstall-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe('uninstall', () => {
  let tmpDir;
  let hooksDir;
  let settingsPath;

  beforeEach(async () => {
    tmpDir = await makeTmpDir();
    hooksDir = join(tmpDir, 'hooks');
    settingsPath = join(tmpDir, 'settings.json');
    await mkdir(hooksDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('removes claude-hands entries from both hook arrays', async () => {
    const hookPath = join(hooksDir, HOOK_FILENAME);
    const configPath = join(hooksDir, CONFIG_FILENAME);
    await writeFile(hookPath, 'hook content');
    await writeFile(configPath, 'config content');

    const settings = {
      hooks: {
        PreToolUse: [makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    // Empty arrays/objects should be cleaned up
    assert.equal(result.hooks, undefined);
  });

  it('preserves other tools hook entries', async () => {
    const otherEntry = { matcher: 'Bash', hooks: [{ type: 'command', command: '/other/hook' }] };
    const settings = {
      hooks: {
        PreToolUse: [otherEntry, makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.equal(result.hooks.PreToolUse.length, 1);
    assert.equal(result.hooks.PreToolUse[0].hooks[0].command, '/other/hook');
    // PostToolUse was emptied and cleaned up
    assert.equal(result.hooks.PostToolUse, undefined);
  });

  it('cleans up empty arrays (deletes keys)', async () => {
    const settings = {
      other: 'data',
      hooks: {
        PreToolUse: [makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
        SomeOtherHook: [{ matcher: 'x', hooks: [] }],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.equal(result.hooks.PreToolUse, undefined);
    assert.equal(result.hooks.PostToolUse, undefined);
    // SomeOtherHook should remain
    assert.ok(result.hooks.SomeOtherHook);
    assert.equal(result.other, 'data');
  });

  it('cleans up empty hooks object (deletes key)', async () => {
    const settings = {
      other: 'data',
      hooks: {
        PreToolUse: [makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.equal(result.hooks, undefined);
    assert.equal(result.other, 'data');
  });

  it('handles missing settings.json gracefully', async () => {
    // No settings.json — should not throw
    await uninstall(tmpDir);
    // Just verifying it doesn't throw
  });

  it('handles invalid JSON with descriptive error', async () => {
    await writeFile(settingsPath, '{ broken json');

    await assert.rejects(
      () => uninstall(tmpDir),
      (err) => {
        assert.ok(err.message.includes('invalid JSON'), `Expected "invalid JSON" in: ${err.message}`);
        return true;
      }
    );
  });

  it('warns on hooks-as-array, skips settings cleanup, still removes files', async () => {
    const hookPath = join(hooksDir, HOOK_FILENAME);
    await writeFile(hookPath, 'hook content');

    const settings = { hooks: [1, 2, 3] };
    await writeFile(settingsPath, JSON.stringify(settings));

    // Should not throw — just warn and skip
    await uninstall(tmpDir);

    // Hook file should still be removed
    const files = await readdir(hooksDir);
    assert.ok(!files.includes(HOOK_FILENAME));

    // Settings should be untouched (no write happened)
    const result = JSON.parse(await readFile(settingsPath, 'utf8'));
    assert.deepEqual(result.hooks, [1, 2, 3]);
  });

  it('throws on top-level array', async () => {
    await writeFile(settingsPath, JSON.stringify([1, 2, 3]));

    await assert.rejects(
      () => uninstall(tmpDir),
      (err) => {
        assert.ok(err.message.includes('invalid top-level'), `Expected "invalid top-level" in: ${err.message}`);
        return true;
      }
    );
  });

  it('idempotent: running twice does not throw', async () => {
    const hookPath = join(hooksDir, HOOK_FILENAME);
    const configPath = join(hooksDir, CONFIG_FILENAME);
    await writeFile(hookPath, 'hook content');
    await writeFile(configPath, 'config content');

    const settings = {
      hooks: {
        PreToolUse: [makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);
    // Second run — files already gone, settings already clean
    await uninstall(tmpDir);
  });

  it('creates backup before modifying', async () => {
    const settings = {
      hooks: {
        PreToolUse: [makeClaudeHandsEntry(hooksDir)],
        PostToolUse: [makeClaudeHandsEntry(hooksDir)],
      }
    };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 1);
  });

  it('no backup when nothing changed', async () => {
    // Settings with no claude-hands entries
    const settings = { other: 'data' };
    await writeFile(settingsPath, JSON.stringify(settings));

    await uninstall(tmpDir);

    const files = await readdir(tmpDir);
    const backups = files.filter(f => f.startsWith('settings.json.backup.'));
    assert.equal(backups.length, 0, 'No backup should be created when nothing changed');
  });
});
