**English** | [中文](./README.CN.md)

<h1 align="center">Functional API</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/functional-api"><img alt="npm" src="https://img.shields.io/npm/v/functional-api.svg?style=flat-square"></a>
  <a href="https://github.com/mcc108/functional-api"><img alt="minsize" src="https://img.shields.io/bundlephobia/min/functional-api?label=functional-api&style=flat-square"></a>
  <a href="https://codecov.io/gh/mcc108/functional-api"><img alt="coverage" src="https://img.shields.io/codecov/c/github/mcc108/functional-api?style=flat-square"></a>
</p>

<p align="center">
  <strong>Functional API</strong> server for node.js base on Koa and TypeScript.</a>
</p>

## Features

- API routing rules refer to functions, without configure routes, functions as a service.
- Support TypeScript and JavaScript, without manually compile, startup script is runing application directly.
- Packing application entry file for server startup, focus on business code.

## Installation

```bash
$ npm i functional-api
```

## Quick start

```js
// index.ts
export default async (params, ctx) => {
  return 'Hello Functional API';
};
```

```bash
# startup server
$ functional-api
```

## Documents

The following mainly introduces the framework from the concepts of `CLI`, `Config`, `Router`, `Functions`, `Params`, `Context`:

### CLI

Execute `functional-api` command to start the server, and `functional-api --help` to get the options info:

```bash
$ functional-api --help
Usage: functional-api [options]

Functional API Server

Options:
  -p, --port <port>      server port number (default: 20209)
  -s, --src <directory>  functions source directory path (default: ./ [the cwd path])
  -c, --config <file>    extend config file path (default: ./functional-api.config.ts [may not be provided])
  --prod, --production   whether to serve in production environment
```

### Config

You can create `./functional-api.config.ts` file under the startup path for configuration:

```ts
const config: FA.Config = {
  port: 3000, // server port number, default: 20209
  src: './functions', // unctions source directory path, default: ./
  middlewares: [], // middlewares, globally loaded in order
  context(ctx) {}, // context, can be injected
  application(app) {}, // application, can be injected
  /* configure the built-in middleware */
  'koa-body': {}, // refer to koa-body documentation (default enabled text, json, urlencoded, multipart)
  'koa-logger': {}, // refer to koa-logger documentation
};

export default config;
```

### Router

The routing of the functional framework is fixed, and the specific rules are as follows:

```
/filepath:funcname?querystring
```

- `filepath`: the relative path of the function file under `config.src` (satisfies the `require.resolve` rule)
- `funcname`: the name of the called function, the default value is `default`
- `querystring`: the url query string

#### Example:

Call the default export function:
- Request `/`, or request `/index` - load the `index.ts` file and call the default exported `default` function
- Request `/project/list` - load the `project/list.ts` file and call the default exported `default` function

Call other export functions:
- Request `/:main` - load the `index.ts` file and call the exported `main` function
- Request `/user:get` - load the `user.ts` file and call the exported `get` function
- Request `/user/:get` - load the `user/index.ts` file and call the exported `get` function

### Functions

Each route refer to a function, supports `async function` or `common function`:

#### Function parameters

The function contains two parameters `(params, ctx)`, they are described in detail below:
- `params`: request `Params` value
- `ctx`: `Context` object

#### Function return value

The return value of the function call is returned as the response body, supporting the `Object` `Array` `string` `Buffer` `Stream` `null` data format, and it will define the corresponding default value for the response header `Content-Type`. In fact, it is assigned to koa [ctx.response.body](https://koajs.com/#response-body).

### Params

As the first parameter of the function, `params` means the parameter value carried in this request. According to the format of the request body, its value has two cases:

- If the request format is `json` or `form`, then `params` is the parsed and merged object of the request body `ctx.request.body` and URL request parameter `querystring`;
- If the request format is `text`, `xml` or other formats, then `params` is the content of the request body `ctx.request.body`.

> The `params` parameter is mainly used to quickly obtain the requested value. If you want to get the details of the request body explicitly, you can use `ctx.request` in the context of the second parameter.

### Context

As the second parameter of the function, `ctx` means the context of this request. Since this functional framework is based on koa, the concept of Context comes from it. You can use context to achieve more capabilities:

- `ctx` [Koa Context](https://koajs.com/#context)
- `ctx.request` [Koa Request](https://koajs.com/#request)
- `ctx.response` [Koa Response](https://koajs.com/#response)

## Practices

### JavaScript

Since node.js does not support ES Module, you need to use the CommonJS to export:

```js
exports.default = (params, ctx) => {
  return params;
};
/* This example means to return the request parameter value, such as:
- GET /index?x=1&y=2 return { x: 1, y: 2 }
- POST /index?x=1&y=2 body { y: 0, z: 3  }
  return { x: 1, y: 0, z: 3 }
*/
```

### TypeScript

It is recommended to practice TypeScript in functions. Before, you need to configure `tsconfig.json` for the entire project:

```json
{
  "extends": "functional-api/tsconfig",
  "include": ["**/*", "*.*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

Of course, don't forget to install `typescript` for the project. Then you can write a function like the following, and define the request and response data format of the function:

```ts
export interface Req {
  id?: string,
}
export interface Res {
  code: number,
  message: string,
  data: { ... }
}

const main: FA.Function<Req, Res> = async (params, ctx): Promise<Res> => {
  console.log(params.id);
  return {
    code: 0,
    message: 'OK',
    data: { ... },
  };
};

export default main;
```

### Examples

#### XML format response

```ts
export default async (params, ctx) => {
  ctx.type = 'application/xml';
  return `<xml>${params}</xml>`
};
```


## Inspirations

- [koa](https://github.com/koajs/koa)
- [ts-node](https://github.com/TypeStrong/ts-node)
- [@google-cloud/functions-framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs)
