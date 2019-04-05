const Docker = require('dockerode');
const logger = require('../helpers/logger')();
const Server = require('../server/server');
const ContainerStatus = require('./container-status.enum');

const config = require('../helpers/configuration');
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

    this.registerListener().catch(err =>
      logger.error('Failed to register docker event listener!', {
        stack: err.stack
      })
    );
  }

  /**
   * Get all zentry containers currently running
   * 
   * @returns {Docker.Container[]}
   */
  async getContainers () {
    const containers = [];
    const list = await client.listContainers({ all: true });
    for (const container of list) {
      if (this.isZentryServer(container)) {
        const c = client.getContainer(container.Id);
        containers.push(c);
      }
    }

    return containers;
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
   * Create a new container with the given properties
   * 
   * @param {import('../server/server.model')} serverModel - The server model to create the container from
   * @param {string} port - Container port to expose
   * @param {string} identifier - Unique identifier to the server, ex and auto-increment number
   */
  async createContainer (serverModel, port, identifier) {
    const options = {
      Image: serverModel.image.name,
      AttachStdin: true,
      OpenStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      name: 'zentry-server-' + serverModel.name + (identifier !== undefined ? `-${identifier}` : ''),
      ExposedPorts: {
        '25565/tcp': {}
      },
      HostConfig: {
        Binds: serverModel.properties.volume,
        PortBindings: {
          '25565/tcp': [
            {
              HostIp: '0.0.0.0',
              HostPort: port
            }
          ]
        }
      },
      // Volumes: {
      //   '/data': { }
      // },
      Env: [
        'EULA=TRUE',
        'PAPER_DOWNLOAD_URL=https://heroslender.com/assets/PaperSpigot-1.8.8.jar',
        'TYPE=PAPER',
        'VERSION=1.8.8',
        'ENABLE_RCON=false'
      ]
    };

    const container = await client.createContainer(options);
    return container;
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
