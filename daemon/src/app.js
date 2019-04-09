const amqp = require('amqplib/callback_api');
const app = require('express')();
const logger = require('./helpers/logger')();
const start = new Date();

logger.info('Starting the zentry daemon.');

const ConfigurationException = require('./configuration/exceptions/configuration.exception');

const MetricsController = require('./features/metrics/metrics.controller');
const ServerController = require('./server/server.controller');

async function initialize() {
  initMetrics(3333);

  const serverController = new ServerController();
  const dockerController = require('./docker/docker.controller');
  const brokerController = require('./features/broker/broker.controller');

  await dockerController.init();
  await serverController.init();
  await brokerController.init({
    hostname: 'localhost',
    queue: 'lab',
  });

  const server = await serverController.createServer('hub');
}

function initMetrics(port) {
  const server = app.listen(port, () => {
    console.log(`Metrics app listening on port ${port}!`);
  });

  MetricsController.injectMetricsRoute(app);
  MetricsController.startCollection();
}

initialize()
  .then(() => {
    logger.info(
      'Daemon initialized! (%dms)',
      new Date().getTime() - start.getTime()
    );
  })
  .catch(err => {
    if (err instanceof ConfigurationException) {
      logger.error(`Configuration error: ${err.message}`, { err });
      return;
    }

    if (
      (err.errno === 'ENOENT' || err.errno === 'ETIMEDOUT') &&
      err.syscall === 'connect'
    ) {
      logger.error('Error connecting to docker!', { err });
      return;
    }

    logger.error('Error initilizing slave daemon!', { err });
    process.exit(1);
  });
