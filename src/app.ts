import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { getTargetFunction } from './loader';
import config from './config';

const app = new Koa();

app.use(logger());
app.use(bodyParser({
  onerror(err, ctx) {
    console.error(String(err));
    ctx.throw(400, err.message);
  },
}));

config.inject?.(app);

app.use(async (ctx, next) => {
  const { path, query, body } = ctx.request;
  const params = { ...query, ...body };
  try {
    const func = getTargetFunction(config.src, path);
    await next();
    ctx.response.body = await func(params, ctx);
  } catch (err) {
    console.error(String(err));
    ctx.throw(400, err.message);
  }
});

app.listen(config.port);

console.log(`Serving: http://127.0.0.1:${config.port}/\n`);

export default app;
