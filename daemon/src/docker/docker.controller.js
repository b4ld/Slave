const Docker = require('dockerode');
const logger = require('../config/logger')();
const Server = require('../server/server');
const ContainerStatus = require('./container-status.enum');

const config = require('../config/configuration');
const client = new Docker();

module.exports.client = client;
/**
 * @property {Object.<string, Container>} containers - Containers cache
 */
module.exports.DockerController = class DockerController {
  constructor () {
    /** @type {Object.<string, Container>} */
    this.containers = {};
  }

  /**
   * Initialize the docker controller.
   * Ensures images are updated and check for
   * existing zentry containers.
   */
  async init () {
    // Ensure connection established
    logger.info('Connecting to Docker...');
    await client.listContainers();

    logger.info('Donwloading required images...');
    await this.ensureImagesLoaded();
    logger.info('All images required are loaded localy!');

    logger.info('Checking for existing containers...');
    const containers = await client.listContainers({ all: true });
    for (const container of containers) {
      if (this.isZentryServer(container)) {
        logger.info('Found a zentry container! %s', container.Names);
        this.initContainer(container);
      }
    }

    this.registerListener().catch(err =>
      logger.error('Failed to register docker event listener!', {
        stack: err.stack
      })
    );
  }

  /**
   * Listen for docker events
   */
  async registerListener () {
    const eventStream = await client.getEvents({
      Filters: {
        type: 'container'
      }
    });

    eventStream.on('data', msg => {
      msg = JSON.parse(msg);
      if (!msg || !msg.Type || msg.Type !== 'container' || !msg.Action) {
        return;
      }

      const c = this.containers[msg.id];
      if (c) {
        if (msg.Action === 'die') {
          c.updateStatus(ContainerStatus.OFFLINE);
        } else if (msg.Action === 'start') {
          if (c.status === ContainerStatus.OFFLINE) {
            c.logger.warn('Container started from outside the daemon.');
            c.updateStatus(ContainerStatus.STARTING);
            c.attach()
              .then(() => c.logger.info('Attached to the container, waiting for it to fully start.'));
          }
        }
      }
    });
  }

  /**
   * Ensure that all the images required for the
   * containers are present localy.
   * @private
   */
  async ensureImagesLoaded () {
    const images = config.getImages();

    for (const image of images) {
      await client.pull(image.name, {});

      // await client.pull(image.image, { authconfig: image.auth });
    }
  }

  /**
   * Initialize a zentry server container
   *
   * @param {Docker.ContainerInfo} containerInfo
   */
  initContainer (containerInfo) {
    const container = client.getContainer(containerInfo.Id);

    const c = new Server(container);

    this.containers[c.container.id] = c;
  }

  /**
   * Check if the container is a zentry server
   *
   * @param {Docker.ContainerInfo} containerInfo
   * @returns {boolean}
   */
  isZentryServer (containerInfo) {
    for (const name of containerInfo.Names) {
      if (name.startsWith('/zentry-server-')) {
        return true;
      }
    }

    return false;
  }
};
