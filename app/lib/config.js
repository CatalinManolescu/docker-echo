import { logger } from './logger';

const fs = require('fs');
const packageJson = require('../package.json');

const ENV_CONFIG_LOCATION_KEY = 'ECHO_CONFIG_LOCATION';

const DEFAULT_APP_PORT = 8123;

class ApplicationConfig {
  #configLocation = './config/app.conf';

  #applicationInfo = {};
  #config = {};

  constructor() {
    if (process.env[ENV_CONFIG_LOCATION_KEY]) {
      this.#configLocation = process.env[ENV_CONFIG_LOCATION_KEY];
    }

    this.#applicationInfo = {
      name: packageJson.name,
      version: packageJson.version
    };

    this._loadConfig();
  }

  _loadConfig() {
    logger.log('== Load application config ==');
    this.#config = this._loadJsonFile(this.#configLocation, true);

    const defaultServerConfig = {port: process.env.APP_PORT ? process.env.APP_PORT : DEFAULT_APP_PORT};
    const serverConfig = {...defaultServerConfig, ...this.#config['server']};
    this.#config['server'] = serverConfig;
  }

  _loadJsonFile(file, printContent) {
    logger.debug(`loading config file ${file}`);
    const fileContent = fs.readFileSync(file, "utf8");

    if (printContent) {
      logger.debug(`parse config data: \n${fileContent}`);
    }

    return JSON.parse(fileContent);
  }

  get application() {
    return {...this.#applicationInfo};
  }

  get server() {
    return {...this.#config['server']};
  }

  get options() {
    return {...this.#config['app']};
  }
}

export const applicationConfig = new ApplicationConfig();
