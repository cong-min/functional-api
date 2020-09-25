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
if (!fs.existsSync(path)) tsconfig = path.join(cwd, 'tsconfig.json');

program
  .version(version, '-v, --version')
  .description('Functional API Server')
  .option('-p, --port <port>', 'server port number', '20209')
  .option('-s, --src <directory>', 'functions source directory path', './')
  .option('-c, --config <file>', 'extend config file path', 'functional-api.config.ts');

program.parse(process.argv);

// envs
process.env.FUNCTIONAL_API_PORT = program.port;
process.env.FUNCTIONAL_API_SRC = program.src;
process.env.FUNCTIONAL_API_CONFIG = program.config;

let subprocess;
if (process.env.NODE_ENV !== 'production') { // ts-node-dev
  subprocess = execa('ts-node-dev', [
    `--project=${tsconfig}`,
    app,
  ], {
    env: npmRunPath.env({ cwd }),
    stdio: 'inherit',
  });
} else { // ts-node
  subprocess = execa('ts-node', [
    `--project=${tsconfig}`,
    app,
  ], {
    env: npmRunPath.env({ cwd }),
    stdio: 'inherit',
  });
}
