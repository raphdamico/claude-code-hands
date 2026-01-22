import { spawn } from 'child_process';
import { join } from 'path';

export function start(root) {
  const serverScript = join(root, 'relay-server', 'index.js');

  const child = spawn(process.execPath, [serverScript], {
    stdio: 'inherit',
    cwd: join(root, 'relay-server')
  });

  const shutdown = () => {
    child.kill('SIGTERM');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  child.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });
}
