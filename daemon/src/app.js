const logger = require('./helpers/logger')();

const start = new Date();
logger.info('Starting the zentry daemon...');

const { DockerController } = require('./docker/docker.controller');
const ServerController = require('./server/server.controller');
const ConfigurationException = require('./configuration/exceptions/configuration.exception');

const dockerController = new DockerController();
const serverController = new ServerController(dockerController);

async function initialize () {
  await dockerController.init();

  await serverController.init();
}

initialize()
  .then(() => logger.info('Daemon initialized! (%dms)', new Date().getTime() - start.getTime()))
  .catch(err => {
    if (err instanceof ConfigurationException) {
      logger.error(`Configuration error: ${err.message}`, { stack: err.stack });
      return;
    }

    if ((err.errno === 'ENOENT' || err.errno === 'ETIMEDOUT') && err.syscall === 'connect') {
      logger.error('Error connecting to docker!', { stack: err.stack });
      return;
    }
    
    logger.error('Error initilizing slave daemon!', { stack: err.stack });
    process.exit(1);
  });

module.exports = {
  dockerController,
  serverController
};
