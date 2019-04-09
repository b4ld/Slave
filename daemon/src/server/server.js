const EventEmitter = require('events');

const Logger = require('../helpers/logger');
const DockerEventEnum = require('../docker/docker-event.enum');
const config = require('../helpers/configuration');
const ServerStatus = require('./enums/server-status.enum');
const ServerException = require('./exceptions/server.exception');

module.exports = class Server extends EventEmitter {
  /**
   * @param {import('../docker/container')} container The docker container
   */
  constructor (container) {
    super();
    this.container = container;
    this.logger = Logger();

    this.status = ServerStatus.OFFLINE;
    this.regex = {
      start: /^(.*?)\[[\d:]{8} INFO]: Done \((.*?)s\)! For help, type "help"/,
      stop: /^(.*?)\[[\d:]{8} INFO]: Stopping server/
    };
  }

  async init () {
    const inspect = await this.container.inspect();
    this.name = inspect.name;
    this.port = inspect.port;

    this.logger = Logger(this.name);
    const serverType = this.name.split('-')[0];
    this.config = config.servers[serverType];

    if (inspect.status !== this.status) {
      this.updateStatus(inspect.status);
    }

    if (this.status === ServerStatus.OFFLINE) {
      await this.start();
    }

    this.registerListeners();
  }

  /**
   * Start the container if not running
   */
  async start () {
    if (this.status !== ServerStatus.OFFLINE) {
      throw new ServerException('The server is already running!');
    }
    
    this.logger.info('The server is now starting.');
    this.updateStatus(ServerStatus.STARTING);
    await this.container.start();
    
    const inspect = await this.container.inspect();
    this.port = inspect.port;

    await this.container.attach();
    this.logger.info('Attached to the container, waiting for it to fully start.');
  }

  /**
   * Stop the container if running
   */
  async stop () {
    if (this.status !== ServerStatus.OFFLINE &&
      this.status !== ServerStatus.STOPPING) {
      await this.container.stop();
    }
  }

  /**
   * Remove the container
   * This is a permanent action
   */
  async remove () {
    if (this.status !== ServerStatus.OFFLINE) {
      await this.container.stop();
    } else {
      await this.container.remove();
    }
  }

  /**
   * Update the container status
   * 
   * @param {string} status New status
   */
  updateStatus (status) {
    this.status = status;
    this.logger.child({ label: `${this.name} status` }).debug(this.status);
    this.emit(DockerEventEnum.STATUS_UPDATE, status);
  }

  async registerListeners () {
    this.container.on(DockerEventEnum.STATUS_UPDATE, newStatus => this.updateStatus(newStatus));
    this.container.on(DockerEventEnum.CONSOLE_OUTPUT, data => this.onConsoleOutput(data));

    this.on(DockerEventEnum.STATUS_UPDATE, newStatus => {
      if (newStatus === ServerStatus.OFFLINE) {
        if (this.config.properties.deleteOnStop) {
          this.logger.info('Server stopped, deleting container...');
          this.remove()
            .catch(err => this.logger.error('Failed to delete the container!', { err }));
        } else if (this.config.properties.autoRestart) {
          this.logger.info('Restarting the server...');
          this.start();
        }
      }
    });
  }

  /**
   * Method called when there is new console output
   * 
   * @param {string} msg - Message received
   */
  async onConsoleOutput (msg) {
    let match = msg.match(this.regex.start);
    if (match) {
      this.updateStatus(ServerStatus.ONLINE);
    }

    match = msg.match(this.regex.stop);
    if (match) {
      this.updateStatus(ServerStatus.STOPPING);
    }
  }
};
