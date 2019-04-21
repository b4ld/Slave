import { parseConfig } from './configuration/configuration.controller';
import { newLogger } from './logger/Logger';
import util from 'util';

const logger = newLogger();

const start = new Date();

logger.info('Starting the zentry daemon.');

logger.info('Loading the configuration...');
const config = parseConfig();
console.log(
    'Configuration loaded!',
    util.inspect(config, false, null, true /* enable colors */)
);

logger.info(
    'Daemon initialized! (%dms)',
    new Date().getTime() - start.getTime()
);
