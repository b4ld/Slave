const logger = require('./helpers/logger')();

const start = new Date();
logger.info('Starting the zentry daemon.');

const ConfigurationException = require('./configuration/exceptions/configuration.exception');

const dockerController = require('./docker/docker.controller');
const serverController = require('./server/server.controller');

async function initialize () {
  await dockerController.init();

  await serverController.init();
}

initialize()
  .then(() => logger.info('Daemon initialized! (%dms)', new Date().getTime() - start.getTime()))
  .catch(err => {
    if (err instanceof ConfigurationException) {
      logger.error(`Configuration error: ${err.message}`, { err });
      return;
    }

    if ((err.errno === 'ENOENT' || err.errno === 'ETIMEDOUT') && err.syscall === 'connect') {
      logger.error('Error connecting to docker!', { err });
      return;
    }
    
    logger.error('Error initilizing slave daemon!', { err });
    process.exit(1);
  });

module.exports = {
  dockerController,
  serverController
};
