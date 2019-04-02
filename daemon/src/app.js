const Logger = require('./config/logger');
const { DockerController } = require('./docker/docker.controller');
const ConfigurationException = require('./config/configuration.exception');

const logger = Logger();
const dockerController = new DockerController();

async function initialize () {
  await dockerController.init();
}

initialize()
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
