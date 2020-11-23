import type Koa from 'koa';
import type koaBody from 'koa-body';
import type logger from 'koa-logger';

declare module FunctionalAPI {
  export type App = Koa;

  export type Context = Koa.Context;

  export type Params = object | string;

  export type Config = {
    port?: number | string,
    src?: string,
    middlewares?: Koa.Middleware[],
    context?: (ctx?: Context) => void,
    application?: (app?: App) => void,
    // built-in lib config
    'koa-body'?: koaBody.IKoaBodyOptions,
    'koa-logger'?: Parameters<typeof logger>[0],
  };

  export type Function<Req extends Params = object, Res = any>
    = (params: Req, ctx?: Context) => PromiseLike<Res> | Res;
}

export = FunctionalAPI;
export as namespace FunctionalAPI;
export as namespace FA;
