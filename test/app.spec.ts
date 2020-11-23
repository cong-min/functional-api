import anyTest, { TestInterface } from 'ava';
import execa from 'execa';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import getPort from 'get-port';
import got from 'got';
import qs from 'qs';
import FormData from 'form-data';
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

test('base request', async t => {
  const res = await got('functions', {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('Hello Functional');
});

test('GET request with query string', async t => {
  let query = { a: 'A', b: 'B', c: 'C' } as any;
  let res = await got(`functions/params?${qs.stringify(query)}`, {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify(query));

  query = { a: 1, b: [true], c: { d: 'ok' } };
  res = await got(`functions/params?${qs.stringify(query)}`, {
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('{"a":"1","b[0]":"true","c[d]":"ok"}');
});

test('POST request with json body', async t => {
  const body = { a: 1, b: [true], c: { d: 'ok' } };
  const res = await got.post('functions/params', {
    json: body,
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify(body));
});

test('POST request with json body and query string', async t => {
  const body = { a: 'A1', b: 'B1' };
  const query = { b: 'B2', c: 'C2' };
  const res = await got.post(`functions/params?${qs.stringify(query)}`, {
    json: body,
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify({ ...query, ...body }));
});

test('POST request with string body', async t => {
  let body = 'test string';
  let res = await got.post('functions/params', {
    body,
    headers: { 'content-type': 'text/plain' },
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify(body));

  body = '';
  res = await got.post('functions/params', {
    body,
    headers: { 'content-type': 'text/plain' },
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify(body));
});

test('POST request with form body', async t => {
  const body = { b: 'B1', c: false };
  const res = await got.post('functions/form?a=A1', {
    form: body,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify({ a: 'string', b: 'string', c: 'string' }));
});

test('POST request with multipart/form-data body', async t => {
  const body = new FormData();
  body.append('b', 'B1');
  body.append('c', fs.createReadStream(path.join(testPath, './functions/form.ts')), 'form.ts');
  const res = await got.post('functions/form?a=A1', {
    body,
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify({ a: 'string', b: 'string', c: 'file' }));
});

test('POST request with string body and query string', async t => {
  const query = { a: 'A1', b: 'B1' };
  const body = 'test string';
  const res = await got.post(`functions/params?${qs.stringify(query)}`, {
    body,
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal(JSON.stringify(query));
});

test('OPTIONS request', async t => {
  const res = await got('functions', {
    method: 'OPTIONS',
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.equal('');
});

test('parse body error', async t => {
  const body = 'test string';
  const res = await got.post('functions/params', {
    body,
    headers: { 'content-type': 'application/json' },
    prefixUrl: t.context.prefixUrl,
    throwHttpErrors: false
  });
  expect(res.statusCode).to.equal(400);
  expect(res.body).to.include('invalid JSON');
});
