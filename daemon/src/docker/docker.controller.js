const Docker = require('dockerode');
const Container = require('./container');
const logger = require('../helpers/logger')('Docker');
const ServerStatus = require('../server/enums/server-status.enum');

const config = require('../helpers/configuration');
const client = new Docker();

/**
 * @property {Object.<string, Container>} containers - Containers cache
 */
class DockerController {
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

    logger.info('Updating images...');
    await this.ensureImagesLoaded();
    logger.info('All images are updated!');

    this.registerListener().catch(err =>
      logger.error('Failed to register docker event listener!', {
        stack: err.stack
      })
    );
  }

  /**
   * Get all zentry containers currently running
   * 
   * @returns {Container[]}
   */
  async getContainers () {
    const containers = [];
    const list = await client.listContainers({ all: true });
    for (const container of list) {
      if (this.isZentryServer(container)) {
        const dc = client.getContainer(container.Id);

        const c = new Container(dc);
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
          c.updateStatus(ServerStatus.OFFLINE);
        } else if (msg.Action === 'start') {
          if (c.status === ServerStatus.OFFLINE) {
            c.logger.warn('Container started from outside the daemon.');
            c.updateStatus(ServerStatus.STARTING);
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
    const c = new Container(container);
    return c;
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

module.exports = new DockerController();
