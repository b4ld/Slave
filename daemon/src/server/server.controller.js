
const ServerModel = require('./server.model');
const Server = require('./server');
const InvalidServerException = require('./exceptions/invalid-server.exception');

const config = require('../helpers/configuration');
const logger = require('../helpers/logger')();

module.exports = class ServerController {
  /**
   * 
   * @param {import('../docker/docker.controller').DockerController} dockerController 
   */
  constructor (dockerController) {
    this.dockerController = dockerController;

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
   * Create a new server with the given configuration.
   * 
   * @param {ServerModel|string} server The ServerModel or a valid server name
   * @returns {Server} The server created
   */
  createServer (server) {
    if (typeof server === 'string') {
      const serverModel = config.servers[server];
      if (!serverModel) {
        throw new InvalidServerException(`The server ${server} does not exist`);
      }

      server = serverModel;
    }

    if (!(server instanceof ServerModel)) {
      throw new InvalidServerException(`The server is not of type ServerModel. ${server}`);
    }

    const instance = this.dockerController.createContainer(server);
    // this.registerServer(instance);

    return instance;
  }

  /**
   * Register a new server.
   * 
   * @param {Server} server The server instance to register
   */
  registerServer (server) {
    this.servers[server.container.id] = server;
  }
};
