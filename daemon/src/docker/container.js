const EventEmitter = require('events');
const logger = require('../helpers/logger');
const ServerStatus = require('../server/enums/server-status.enum');
const DockerEventEnum = require('./docker-event.enum');

/** @typedef {import('dockerode').Container} DockerContainer */

/**
 * @property {DockerContainer} container
 * @property {string} name - Server name
 * @property {string} containerName - Container name
 * @property {import('winston').Logger} logger - Container logger
 */
module.exports = class Container extends EventEmitter {
  /**
   * @param {DockerContainer} container 
   */
  constructor (container) {
    super();

    this.container = container;

    this.logger = logger();
    this.id = container.id;
    this.name = container.id;
  }

  /**
   * Get the information about the container
   * 
   * @returns {Promise<InspectInfo>}
   */
  async inspect () {
    const info = await this.container.inspect();
    this.name = info.Name.substr(1);
    this.logger = logger(this.name);

    const ports = info.NetworkSettings.Ports['25565/tcp'] || [{ HostPort: '-1' }];

    return {
      name: info.Name.replace('/' + 'zentry-server-', ''),
      status: info.State.Running ? ServerStatus.ONLINE : ServerStatus.OFFLINE,
      port: ports[0].HostPort
    };
  }

  /**
   * Start the container if not running
   */
  async start () {
    await this.container.start();
  }

  /**
   * Attach to the container if running
   */
  async attach () {
    const stream = await this.container.attach({ stream: true, stdout: true, stderr: true });
    stream.setEncoding('utf8');
    // Listen for console output
    stream.on('data', (data) => {
      data.toString().split('\n').forEach((line) => {
        if (line) {
          this.emit(DockerEventEnum.CONSOLE_OUTPUT, line.trim());
        }
      });
    }).on('end', () => {
      this.logger.warn('Attach stream closed!');
    }).on('error', err => {
      this.logger.error('Attach stream error!', { err });
    });
  }

  /**
   * Stop the container if running
   */
  async stop () {
    await this.container.stop();
  }

  /**
   * Remove the container
   * This is a permanent action
   */
  async remove () {
    await this.container.remove();
  }
};

/**
 * @typedef InspectInfo
 * @type {object}
 * @property {string} name - The container name
 * @property {string} status - The container current status(online or offline)
 * @property {string} port - The port exposed
 */
