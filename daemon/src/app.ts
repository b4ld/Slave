import { parseConfig } from './configuration/configuration.controller';
import { newLogger } from './logger/Logger';

const logger = newLogger();

const start = new Date();

logger.info('Starting the zentry daemon.');

logger.info('Loading the configuration...');
const config = parseConfig();
console.log('Configuration loaded!', config);

logger.info(
    'Daemon initialized! (%dms)',
    new Date().getTime() - start.getTime()
);
