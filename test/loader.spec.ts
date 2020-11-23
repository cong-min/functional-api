import anyTest, { TestInterface } from 'ava';
import execa from 'execa';
import { expect } from 'chai';
import path from 'path';
import getPort from 'get-port';
import got from 'got';
import { cli } from './utils';

// Typing t.context
const test = anyTest as TestInterface<{
  runner: execa.ExecaChildProcess,
  prefixUrl: string,
}>;

const testPath = path.resolve(__dirname, 'fixtures');

test.before.cb(t => {
  getPort().then(port => {
    const runner = cli(['--port', port], testPath, () => t.end());
    t.context.runner = runner;
    t.context.prefixUrl = `http://127.0.0.1:${port}`;
  });
});

test.after.always(t => {
	t.context.runner.kill();
});

test('call provided exported function', async t => {
  let res = await got('functions/multi:default', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('default function');

  res = await got('functions/multi:main', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('main function');

  res = await got('functions/multi:test.func', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('test.func function');

  res = await got('functions/multi:test.test.func', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('test.test.func function');
});

test('function not found', async t => {
  const res = await got('.', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function not found: '/'`);
});

test('function target is not defined', async t => {
  let res = await got('functions/empty', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function '/functions/empty' default() is not defined`);

  res = await got('./functions/empty:main', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function '/functions/empty' main() is not defined`);

  res = await got('./functions/multi:str', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function '/functions/multi' str() is not defined`);

  res = await got('functions/multi:.main..func', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function '/functions/multi' .main..func() is not defined`);
});

test('invalid route', async t => {
  const res = await got('test/../../xx@oo:main/st', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(404);
  expect(res.body).to.equal(`function not found: '/xx@oo'`);
});
