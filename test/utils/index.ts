import path from 'path';
import execa from 'execa';
import { Writable } from 'stream';

const scriptPath = path.resolve(__dirname, '../../bin/index.js');

function cli(args, cwd, loaded: ((runner: execa.ExecaChildProcess) => void) | false = false) {
  const runner = execa(scriptPath, args, {
    cwd,
    reject: false,
    stdio: 'pipe',
  });
  runner.stdout.pipe(
    new Writable({
      write(chunk, encoding, callback) {
        const output = chunk.toString('utf8');
        if (output.toLowerCase().includes('error') || output.includes('Serving')) {
          if (loaded) loaded(runner);
          else runner.kill();
        }
        callback();
      },
    }),
  );
  return runner;
}

export {
 cli,
};
