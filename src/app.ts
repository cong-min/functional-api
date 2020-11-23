import Koa from 'koa';
import logger from 'koa-logger';
import koaBody from 'koa-body';
import stripAnsi from 'strip-ansi';
import { getTargetFunction } from './loader';
import config from './config';

const app = new Koa();

// application
config.application?.(app);

// context
app.use(async (ctx, next) => {
  config.context?.(ctx);
  await next();
});
// built-in middlewares
app.use(logger(config['koa-logger']));
app.use(koaBody({
  text: true,
  json: true,
  urlencoded: true,
  multipart: true,
  onError(err, ctx) {
    console.error(err, ctx.request.body);
    const code = 400;
    const message = process.env.NODE_ENV !== 'production'
      ? stripAnsi(err.message) : 'Bad Request';
    ctx.throw(code, message);
  },
  ...config['koa-body'],
}));
// custom middlewares
config.middlewares.forEach((middleware) => {
  app.use(middleware);
});

// call function
app.use(async (ctx, next) => {
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    ctx.response.body = '';
  } else {
    const { path, query, body, files } = ctx.request;
    let params;
    if (ctx.is('multipart')) { // multipart/form-data
      params = { ...query, ...body, ...files };
    } else if (Object.prototype.toString.call(body) === '[object Object]') { // object
      params = { ...query, ...body };
    } else {
      params = body;
    }
    try {
      const func = getTargetFunction(config.src, path);
      ctx.response.body = await func(params, ctx);
    } catch (err) {
      console.error(err);
      const code = err.code || 500;
      const message = process.env.NODE_ENV !== 'production'
        ? stripAnsi(err.message || err) : 'Function Throws Error';
      ctx.throw(code, message);
    }
  }
  await next();
});

app.listen(config.port);

console.log(`Serving: http://127.0.0.1:${config.port}/\n`);

export default app;
