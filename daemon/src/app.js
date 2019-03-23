const Logger = require('./config/logger');
const { DockerController } = require('./docker/dockerController');
const ConfigurationException = require('./config/ConfigurationException');

const config = require('./config/config');
const logger = Logger();
const dockerController = new DockerController();

async function initialize () {
  await config.load();

  await dockerController.init();
}

initialize()
  .catch(err => {
    if (err instanceof ConfigurationException) {
      logger.error(`Configuration error: ${err.message}`, { stack: err.stack });
      return;
    }

    if (err.errno === 'ENOENT' && err.syscall === 'connect') {
      logger.error('Error connecting to docker!', { stack: err.stack });
      return;
    }
    
    logger.error('Error initilizing slave daemon!', { stack: err.stack });
    process.exit(1);
  });
