import path from 'path';

const configPath = path.resolve(process.cwd(), process.env.FUNCTIONAL_API_CONFIG || 'functional-api.config.ts');

let config: FunctionalAPI.Config = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  config = require(configPath).default || {};
  console.log('Loaded config:', configPath);
} catch (err) {
  if (process.env.FUNCTIONAL_API_CONFIG !== 'functional-api.config.ts') { // no default file
    console.error(err);
  }
}

config = {
  port: config.port || process.env.FUNCTIONAL_API_PORT || 20209,
  src: path.resolve(process.cwd(), config.src || process.env.FUNCTIONAL_API_SRC || './'),
  inject: config.inject,
};

export default config;
