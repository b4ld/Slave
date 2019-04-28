import { init as initializeEnvironment } from './environment/environment-manager';
import { newLogger } from './logger/Logger';

const start = new Date();
const logger = newLogger();

logger.info('Starting the zentry daemon...');

async function initialize() {
    await initializeEnvironment();
}

initialize().then(() => {
    logger.info(
        'Daemon initialized! (%dms)',
        new Date().getTime() - start.getTime()
    );
});
