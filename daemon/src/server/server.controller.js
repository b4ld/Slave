const ServerModel = require('./server.model');
const Server = require('./server');
const InvalidServerException = require('./exceptions/invalid-server.exception');
const ServerStatus = require('./enums/server-status.enum');
const DockerEventEnum = require('../docker/docker-event.enum');

const dockerController = require('../docker/docker.controller');
const config = require('../helpers/configuration');
const logger = require('../helpers/logger')();

class ServerController {
  constructor () {
    /** 
     * All cached server instances.
     * A map with the container id as key
     * and the server as value.
     * 
     * @type {Object.<string, Server>} 
    */
    this.servers = {};
  }

  /**
   * Server controller initialization.
   * Initialize containers already running and
   * register listeners on the docker controller
   */
  async init () {
    logger.info('Checking for existing servers...');
    const containers = await dockerController.getContainers();
    for (const container of containers) {
      await this.initServer(container);
    }

    dockerController.on(DockerEventEnum.CONTAINER_START, containerId => {
      const server = this.servers[containerId];
      if (server && server.status === ServerStatus.OFFLINE) {
        server.logger.warn('Container started from outside the daemon.');
        server.updateStatus(ServerStatus.STARTING);
        server.attach()
          .then(() => server.logger.info('Attached to the container, waiting for it to fully start.'));
      }
    }).on(DockerEventEnum.CONTAINER_DEAD, containerId => {
      const server = this.servers[containerId];
      if (server) {
        server.updateStatus(ServerStatus.OFFLINE);
      }
    }).on(DockerEventEnum.CONTAINER_REMOVE, containerId => {
      logger.debug('The server %s was removed.', this.servers[containerId].name);
      delete this.servers[containerId];
    });
  }

  /**
   * Create a new server with the given configuration.
   * 
   * @param {ServerModel|string} serverModel The ServerModel or a valid server name
   * @returns {Promise<Server>} The server created
   */
  async createServer (serverModel) {
    if (typeof serverModel === 'string') {
      const foundServer = config.servers[serverModel];
      if (!foundServer) {
        throw new InvalidServerException(`The server ${serverModel} does not exist`);
      }

      serverModel = foundServer;
    }

    if (!(serverModel instanceof ServerModel)) {
      throw new InvalidServerException(`The server is not of type ServerModel. ${serverModel}`);
    }

    const newId = serverModel.properties.singleInstance ? undefined : this.getNextId(serverModel);

    logger.info('Creating a new "%s" container...', serverModel.name);
    const container = await dockerController.createContainer(serverModel, this.getAvaliablePort(), newId);

    const server = await this.initServer(container);

    return server;
  }

  /**
   * Initialize a new server with the given container
   * 
   * @param {import('../docker/container')} container The container the server is based on
   * @returns {Promise<Server>} The server initialized
   */
  async initServer (container) {
    const server = new Server(container);

    try {
      await server.init();
    } catch (err) {
      server.logger.error('Failed to initialize the server!', { stack: err.stack });
    }

    if (server.status === ServerStatus.OFFLINE) {
      if (server.config.properties.deleteOnStop) {
        server.logger.info('Deleting container...');
        server.remove()
          .then(() => server.logger.info('Container deleted!'))
          .catch(err => server.logger.error('Failed to delete the container!', { stack: err.stack }));
      } else if (server.config.properties.autoRestart) {
        server.start();
      }
    }

    this.registerServer(server);

    return server;
  }

  /**
   * Register a new server.
   * 
   * @param {Server} server The server instance to register
   */
  registerServer (server) {
    this.servers[server.container.id] = server;
  }

  /**
   * Get the next avaliable id for the container 
   * of the specified server model.
   * 
   * @param {ServerModel} serverModel
   * @returns {string} The next avaliable ID
   */
  getNextId (serverModel) {
    const usedIds = Object.values(this.servers)
      .filter(s => s.config.name === serverModel.name)
      .map(s => s.name.split('-')[1])
      .filter(id => id !== undefined && !isNaN(id))
      .map(id => parseInt(id))
      .sort()
      .reverse();

    const newestId = usedIds.length > 0 ? usedIds[0] : -1;

    return newestId + 1;
  }

  /**
   * Get the first avaliable port for the servers
   * 
   * @returns {string} An unused port
   */
  getAvaliablePort () {
    const portsInUSe = Object.values(this.servers).map(s => s.port);
    const portRange = config.portRange;
    let firstAvaliable = -1;

    for (let port = portRange.start; port < portRange.end; port++) {
      if (!portsInUSe.includes(port.toString())) {
        firstAvaliable = port;
        break;
      }
    }
    
    return firstAvaliable.toString();
  }
};

module.exports = new ServerController();
