import cors from '@koa/cors';

const config = {
  port: 20210,
  src: './functions',
  middlewares: [
    cors(),
  ],
  context(ctx) { ctx.injected = 'context injected'; },
  application(app) { app.injected = 'application injected'; },
  /* configure the built-in middleware */
  'koa-bodyparser': {}, // refer to koa-bodyparser documentation (here all `enableTypes` are turned on by default)
  'koa-logger': {}, // refer to koa-logger documentation
};

export default config;
