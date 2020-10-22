import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
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
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text', 'xml'],
  onerror(err, ctx) {
    console.error(String(err), ctx.body);
    const message = process.env.NODE_ENV === 'production'
      ? 'body parse error' : stripAnsi(err.message);
    ctx.throw(400, message);
  },
  ...config['koa-bodyparser'],
}));
// custom middlewares
config.middlewares.forEach((middleware) => {
  app.use(middleware);
});

// call function
app.use(async (ctx, next) => {
  const { path, query, body } = ctx.request;
  const params = Object.prototype.toString.call(body) !== '[object Object]'
    ? body : { ...query, ...body };
  try {
    const func = getTargetFunction(config.src, path);
    ctx.response.body = await func(params, ctx);
  } catch (err) {
    console.error(String(err));
    const message = process.env.NODE_ENV === 'production'
      ? 'call function error' : stripAnsi(err.message);
    ctx.throw(400, message);
  }
  await next();
});

app.listen(config.port);

console.log(`Serving: http://127.0.0.1:${config.port}/\n`);

export default app;
