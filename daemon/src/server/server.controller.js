const ServerModel = require('./server.model');
const Server = require('./server');
const InvalidServerException = require('./exceptions/invalid-server.exception');
const ServerStatus = require('./enums/server-status.enum');

const dockerController = require('../docker/docker.controller');
const config = require('../helpers/configuration');
const logger = require('../helpers/logger')();

class ServerController {
  /**
   * 
   * @param {import('../docker/docker.controller').DockerController} dockerController 
   */
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

  async init () {
    logger.info('Checking for existing containers...');
    const containers = await dockerController.getContainers();
    for (const container of containers) {
      await this.initServer(container);
    }
  }

  /**
   * Create a new server with the given configuration.
   * 
   * @param {ServerModel|string} serverModel The ServerModel or a valid server name
   * @returns {Server} The server created
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
   * 
   * @param {import('../docker/container')} container 
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

  getAvaliablePort () {
    return '25567';
  }
};

module.exports = new ServerController();
