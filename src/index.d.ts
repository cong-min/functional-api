import Koa from 'koa';

declare module FunctionalAPI {
  export type App = Koa;

  export type Context = Koa.Context;

  export type Params = object;

  export type Config = {
    port?: number | string,
    src?: string,
    inject?: (app?: App) => void,
  };

  export type Function<Req extends Params = object, Res = any>
    = (params: Req, ctx?: Context) => PromiseLike<Res> | Res;
}

export = FunctionalAPI;
export as namespace FunctionalAPI;
export as namespace FA;
