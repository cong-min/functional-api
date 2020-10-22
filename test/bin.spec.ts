import test from 'ava';
import { expect } from 'chai';
import path from 'path';
import getPort from 'get-port';
import { cli } from './utils';

const testPath = path.resolve(__dirname, 'fixtures');

test.serial('uses without flags and config', async t => {
  const { stdout, stderr } = await cli([], __dirname);
  expect(stderr).to.be.empty;
  expect(stdout).to.include('development environment');
  expect(stdout).to.include('ts-node-dev');
  expect(stdout).to.include('Functions src: ./');
  expect(stdout).to.include('127.0.0.1:20209');
});

test.serial('uses config file', async t => {
  const { stdout, stderr } = await cli([], testPath);
  expect(stderr).to.be.empty;
  expect(stdout).to.include('development environment');
  expect(stdout).to.include('ts-node-dev');
  expect(stdout).to.include('Loaded config: ./functional-api.config.ts');
  expect(stdout).to.include('127.0.0.1:20209');
});

test.serial('uses config flags and custom config', async t => {
  const { stdout, stderr } = await cli(['--config', './fa.config.ts'], testPath);
  expect(stderr).to.be.empty;
  expect(stdout).to.include('development environment');
  expect(stdout).to.include('ts-node-dev');
  expect(stdout).to.include('Loaded config: ./fa.config.ts');
  expect(stdout).to.include('127.0.0.1:20210');
});

test.serial('uses error config file', async t => {
  const { stdout, stderr } = await cli(['--config', './error.config.ts'], testPath);
  expect(stderr).to.include('Unable to compile TypeScript');
  expect(stdout).to.not.include('127.0.0.1');
});

test.serial('uses empty config file', async t => {
  const { stdout, stderr } = await cli(['--config', './empty.config.ts'], testPath);
  expect(stdout).to.include('Loaded config: ./empty.config.ts');
});

test.serial('uses not exist config file', async t => {
  const { stdout, stderr } = await cli(['--config', 'not-exist-config'], testPath);
  expect(stderr).to.include('Config not exists');
  expect(stdout).to.not.include('127.0.0.1');
});

test.serial('uses port flags', async t => {
  const port = await getPort();
  const { stdout, stderr } = await cli(['--port', port], testPath);
  expect(stderr).to.be.empty;
  expect(stdout).to.include(`127.0.0.1:${port}`);
});

test.serial('uses src flags', async t => {
  const { stdout, stderr } = await cli(['--src', './functions'], testPath);
  expect(stderr).to.be.empty;
  expect(stdout).to.include('Functions src: ./functions');
  expect(stdout).to.include(`127.0.0.1:20209`);
});

test.serial('uses production flags', async t => {
  const { stdout, stderr } = await cli(['--production'], testPath);
  expect(stderr).to.be.empty;
  expect(stdout).to.include('production environment');
  expect(stdout).to.not.include('ts-node-dev');
  expect(stdout).to.include('127.0.0.1:20209');
});

test.serial('uses unknown flags', async t => {
  const { stderr } = await cli(['--unknown'], testPath);
  expect(stderr).to.include(`unknown option '--unknown'`);
});
