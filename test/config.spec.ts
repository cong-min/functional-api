import anyTest, { TestInterface } from 'ava';
import execa from 'execa';
import { expect } from 'chai';
import path from 'path';
import got from 'got';
import { cli } from './utils';
import config from './fixtures/fa.config';

// Typing t.context
const test = anyTest as TestInterface<{
  runner: execa.ExecaChildProcess,
  prefixUrl: string,
}>;

const testPath = path.resolve(__dirname, 'fixtures');

test.before.cb(t => {
  const runner = cli(['--config', './fa.config.ts'], testPath, () => t.end());
  t.context.runner = runner;
  t.context.prefixUrl = `http://127.0.0.1:${config.port}`;
});

test.after.always(t => {
	t.context.runner.kill();
});

test.serial('config port', async t => {
  await got('.', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
});

test.serial('config src', async t => {
  const res = await got('.', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('Hello Functional');
});

test.serial('config middlewares', async t => {
  const origin = 'http://127.0.0.1';
  const res = await got('.', {
    headers: { origin },
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.headers['access-control-allow-origin']).to.equal(origin);
});

test.serial('config inject context', async t => {
  const res = await got('ctx', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('context injected');
});
