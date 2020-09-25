import path from 'path';

const configPath = process.env.FUNCTIONAL_API_CONFIG || 'functional-api.config.ts';

let config: FunctionalAPI.Config = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  config = require(path.resolve(process.cwd(), configPath)).default || {};
  console.log('Loaded config:', configPath);
} catch (err) {
  if (process.env.FUNCTIONAL_API_CONFIG !== 'functional-api.config.ts') { // custom no-default invalid file
    console.error(err);
  }
}

config = {
  port: process.env.FUNCTIONAL_API_PORT || config.port || 20209,
  src: path.resolve(process.cwd(), process.env.FUNCTIONAL_API_SRC || config.src || './'),
  inject: config.inject,
};

export default config;
