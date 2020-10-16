[English](./README.md) | **中文**

<h1 align="center">Functional API</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/functional-api"><img alt="npm" src="https://img.shields.io/npm/v/functional-api.svg?style=flat-square"></a>
  <a href="https://github.com/mcc108/functional-api"><img alt="minsize" src="https://img.shields.io/bundlephobia/min/functional-api?label=functional-api&style=flat-square"></a>
  <a href="https://codecov.io/gh/mcc108/functional-api"><img alt="coverage" src="https://img.shields.io/codecov/c/github/mcc108/functional-api?style=flat-square"></a>
</p>


<p align="center">
  基于 Koa 和 TypeScript 的<strong>函数式 API</strong> node.js 服务</a>
</p>

## 特性

- API 路由规则指向 function 函数，无需配置路由，函数即服务
- 支持 TypeScript 和 JavaScript，无需手动编译，启动脚本即直接运行应用
- 封装启动应用服务的入口文件，聚焦至业务代码

## 安装

```bash
$ npm i functional-api
```

## 快速开始

```js
// index.ts
export default async (params, ctx) => {
  return 'Hello Functional API';
};
```

```bash
# 启动服务
$ functional-api
```

## 文档

主要会从 `CLI 命令行`、`Config 配置`、`Router 路由`、`Functions 函数`、`Params 参数`、`Context 上下文` 等几个概念介绍框架：

### CLI 命令行

执行 `functional-api` 命令用于启动服务，通过 `functional-api --help` 可获取到命令行选项说明：

```bash
$ functional-api --help
Usage: functional-api [options]

Functional API Server

Options:
  -p, --port <port>      服务器端口号 (默认: 20209)
  -s, --src <directory>  函数的源文件夹路径 (默认: ./ 即当前路径)
  -c, --config <file>    额外的配置项 (默认: ./functional-api.config.ts 可不提供)
  --prod, --production   是否运行在生产环境
```

### Config 配置

可在启动路径下创建 `./functional-api.config.ts` 文件进行配置

```ts
const config: FA.Config = {
  port: 3000, // 端口, 默认为 20209
  src: './functions', // 函数源路径, 默认为 ./
  middlewares: [], // 按顺序全局加载中间件
  context(ctx) {}, // 操作 context 上下文, 可进行注入
  application(app) {}, // 操作 application 应用, 可进行注入
  /* 对内建中间件进行配置 */
  'koa-bodyparser': {}, // 参考 koa-bodyparser 文档 (此处默认开启了所有的 enableTypes)
  'koa-logger': {}, // 参考 koa-logger 文档
};

export default config;
```

### Router 路由

函数式框架的路由是固定的，具体规则如下：

```
/filepath:funcname?querystring
```

其中：
- `filepath` 表示在 `config.src` 下的函数文件相对路径（满足 `require.resolve` 规则）
- `funcname` 表示调用的函数名，默认值为 `default`
- `querystring` 为查询字符串

#### 例子：

调用默认导出函数：
- 访问 `/`，或访问 `/index` - 即调用 `index.ts` 文件默认导出的 `default` 函数
- 访问 `/project/list` - 即调用 `project/list.ts` 文件默认导出的 `default` 函数

调用其他导出函数：
- 访问 `/:main` - 即调用 `index.ts` 文件导出的 `main` 函数
- 访问 `/user:get` - 即调用 `user.ts` 文件导出的 `get` 函数
- 访问 `/user/:get` - 即调用 `user/index.ts` 文件导出的 `get` 函数

### Functions 函数

每个路由对应着一个函数，函数支持 `async function` 或 `common function`：

#### 函数参数

函数含有两个参数 `(params, ctx)`，将在后文进行详细描述
- `params` 即 Params 请求值
- `ctx` 即 Context 上下文

#### 函数返回值

函数执行的返回值将作为响应体进行返回，支持 `Object` `Array` `string` `Buffer` `Stream` `null` 等格式，同时它将会给响应头 `Content-Type` 定义对应的默认值。实际上，它是赋值给了 koa 中的 [ctx.response.body](https://koajs.com/#response-body)。

### Params 请求值

`params` 作为函数的第一个参数，表示本次请求携带的参数值，根据请求体的格式，其值分两种情况：

- 如果请求格式是 `json` 或 `form`，则 `params` 为请求体 `ctx.request.body` 与 URL 请求参数 `querystring` 解析合并后的对象；
- 如果请求格式是 `text`、`xml` 或其他格式，则 `params` 就为 `ctx.request.body` 请求体内容。

> `params` 参数主要是用于快速获取请求值的一种方式。如果要明确的获取请求体细节，可使用第二个参数上下文中的 `ctx.request`。

### Context 上下文

`ctx` 作为函数的第二个参数，表示本次请求的上下文。因为整个函数式框架是基于 koa 封装的上层框架，所以整个 Context 的概念来源于它，你可以利用上下文实现更多的能力：

- `ctx` [Koa Context](https://koajs.com/#context)
- `ctx.request` [Koa Request](https://koajs.com/#request)
- `ctx.response` [Koa Response](https://koajs.com/#response)

## 实践

### JavaScript

因为 node.js 不支持 ES Module，所以你需要使用 CommonJS 规范进行导出：

```js
exports.default = (params, ctx) => {
  return params;
};
/* 这个例子返回了请求参数值，表现如下：
- GET /index?x=1&y=2 将返回 { x: 1, y: 2 }
- POST /index?x=1&y=2 请求体 { y: 0, z: 3  }
  将返回 { x: 1, y: 0, z: 3 }
*/
```

### TypeScript

推荐在函数中实践 TypeScript，在此之前你需要给整个项目配置 `tsconfig.json`：

```json
{
  "extends": "functional-api/tsconfig",
  "include": ["**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

当然，不要忘记为项目安装 `typescript`。然后你就可以类似这样写函数，规范的定义函数的请求与响应数据格式：

```ts
export interface Req {
  id?: string,
}
export interface Res {
  code: number,
  message: string,
  data: { ... }
}

const main: FA.Function<Req, Res> = (params, ctx): Res => {
  console.log(params.id);
  return {
    code: 0,
    message: 'OK',
    data: { ... },
  };
};

export default main;
```

### 小例子

#### XML格式的响应

```ts
export default async (params, ctx) => {
  ctx.type = 'application/xml';
  return `<xml>${params}</xml>`
};
```


## 灵感来自

- [koa](https://github.com/koajs/koa)
- [ts-node](https://github.com/TypeStrong/ts-node)
- [@google-cloud/functions-framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs)
