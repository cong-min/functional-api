import path from 'path';
import fs from 'fs';

const isCustomConfig = !!process.env.FUNCTIONAL_API_CONFIG;
const configFilename = process.env.FUNCTIONAL_API_CONFIG || 'functional-api.config.ts';
const configPath = path.resolve(process.cwd(), configFilename);
const isExists = fs.existsSync(configPath);

let config: FunctionalAPI.Config = {};

if (isCustomConfig && !isExists) {
  console.error('Config not exists:', configPath);
  process.exit(-1);
}

if (isExists) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    config = require(configPath).default || {};
    console.log('Loaded config:', configFilename);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
}

config = {
  port: process.env.FUNCTIONAL_API_PORT || config.port || 20209,
  src: path.resolve(process.cwd(), process.env.FUNCTIONAL_API_SRC || config.src || './'),
  middlewares: config.middlewares || [],
  context: config.context,
  application: config.application,
};

export default config;
