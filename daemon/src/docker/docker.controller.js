const EventEmitter = require('events');

const Docker = require('dockerode');
const Container = require('./container');
const DockerEventEnum = require('./docker-event.enum');

const logger = require('../helpers/logger')('Docker');
const config = require('../helpers/configuration');
const client = new Docker();

class DockerController extends EventEmitter {
  /**
   * Initialize the docker controller.
   * Ensures images are updated and check for
   * existing zentry containers.
   */
  async init() {
    // Ensure connection established
    logger.info('Connecting to Docker...');
    await client.listContainers();

    logger.info('Updating images...');
    await this.ensureImagesLoaded();
    logger.info('All images are updated!');

    this.registerListener().catch(err =>
      logger.error('Failed to register docker event listener!', {
        stack: err.stack,
      })
    );
  }

  /**
   * Get all zentry containers currently running
<<<<<<< HEAD
   *
   * @returns {Container[]}
=======
   * 
   * @returns {Promise<Container[]>}
>>>>>>> 21f844f17f499fa95303b2d1d125c25076c9d1a0
   */
  async getContainers() {
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
  async registerListener() {
    const eventStream = await client.getEvents({
      Filters: {
        type: 'container',
      },
    });

    eventStream.on('data', msg => {
      msg = JSON.parse(msg);
      if (!msg || !msg.Type || msg.Type !== 'container' || !msg.Action) {
        return;
      }
      if (msg.Action === 'die') {
        this.emit(DockerEventEnum.CONTAINER_DEAD, msg.id);
      } else if (msg.Action === 'start') {
        this.emit(DockerEventEnum.CONTAINER_START, msg.id);
      } else if (msg.Action === 'destroy') {
        this.emit(DockerEventEnum.CONTAINER_REMOVE, msg.id);
      }
    });
  }

  /**
   * Ensure that all the images required for the
   * containers are present localy.
   * 
   * @private
   */
  async ensureImagesLoaded() {
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
   * @returns {Promise<Container>} The created container
   */
  async createContainer(serverModel, port, identifier) {
    const options = {
      Image: serverModel.image.name,
      AttachStdin: true,
      OpenStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      name:
        'zentry-server-' +
        serverModel.name +
        (identifier !== undefined ? `-${identifier}` : ''),
      ExposedPorts: {
        '25565/tcp': {},
      },
      HostConfig: {
        Binds: serverModel.properties.volume,
        PortBindings: {
          '25565/tcp': [
            {
              HostIp: '0.0.0.0',
              HostPort: port,
            },
          ],
        },
      },
      // Volumes: {
      //   '/data': { }
      // },
      Env: [
        'EULA=TRUE',
        'PAPER_DOWNLOAD_URL=https://heroslender.com/assets/PaperSpigot-1.8.8.jar',
        'TYPE=PAPER',
        'VERSION=1.8.8',
        'ENABLE_RCON=false',
      ],
    };

    const container = await client.createContainer(options);
    const c = new Container(container);

    //TODO: Add metric counter (incremental operation)
    return c;
  }

  /**
   * Check if the container is a zentry server
   *
   * @param {Docker.ContainerInfo} containerInfo
   * @returns {boolean}
   */
  isZentryServer(containerInfo) {
    for (const name of containerInfo.Names) {
      if (name.startsWith('/zentry-server-')) {
        return true;
      }
    }

    return false;
  }
}

module.exports = new DockerController();
