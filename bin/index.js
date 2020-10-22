#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const execa = require('execa');
const npmRunPath = require('npm-run-path');
const { version } = require('../package.json');

const cwd = path.join(__dirname, '..');
const app = path.join(cwd, 'src/app.ts');
let tsconfig = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsconfig)) tsconfig = path.join(cwd, 'tsconfig.json');

program
  .version(version, '-v, --version')
  .description('Functional API Server')
  .option('-p, --port <port>', 'server port number (default: 20209)')
  .option('-s, --src <directory>', 'functions source directory path (default: ./)')
  .option('-c, --config <file>', 'extend config file path (default: ./functional-api.config.ts)')
  .option('--prod, --production', 'serve in production environment');

program.parse(process.argv);

// envs
process.env.FUNCTIONAL_API_PORT = program.port || '';
process.env.FUNCTIONAL_API_SRC = program.src || '';
process.env.FUNCTIONAL_API_CONFIG = program.config || '';
process.env.NODE_ENV = program.production ? 'production' : 'development';

console.log(`${process.env.NODE_ENV} environment`);

let subprocess;
if (process.env.NODE_ENV !== 'production') { // ts-node-dev
  subprocess = execa('ts-node-dev', [
    `--project=${tsconfig}`,
    `--dir=${cwd}`,
    app,
  ], {
    env: npmRunPath.env({ cwd }),
    stdio: 'inherit',
  });
} else { // ts-node
  subprocess = execa('ts-node', [
    `--project=${tsconfig}`,
    `--dir=${cwd}`,
    app,
  ], {
    env: npmRunPath.env({ cwd }),
    stdio: 'inherit',
  });
}
