const EventEmitter = require('events');
const logger = require('../helpers/logger');
const ContainerStatus = require('./container-status.enum');
const EventType = require('./event-types.enum');

/** @typedef {import('dockerode').Container} DockerContainer */

/**
 * @property {DockerContainer} container
 * @property {string} name - Server name
 * @property {string} containerName - Container name
 * @property {string} status - Container current status
 * @property {import('winston').Logger} logger - Container logger
 */
module.exports = class Container extends EventEmitter {
  /**
   * @param {DockerContainer} container 
   */
  constructor (container) {
    super();

    this.logger = logger();
    // Temporary values
    this.name = container.id;
    this.containerName = container.id;

    this.container = container;
    this.status = ContainerStatus.OFFLINE;
    this.regex = {
      start: /^(.*?)\[[\d:]{8} INFO]: Done \((.*?)s\)! For help, type "help"/,
      stop: /^(.*?)\[[\d:]{8} INFO]: Stopping server/
    };
  }

  /**
   * Initialize the container.
   * Gets the container's name and state and
   * attach if running.
   */
  async init () {
    const info = await this.container.inspect();

    this.name = info.Name.replace('/' + 'zentry-server-', '');
    this.containerName = info.Name.substr(1);
    this.logger = logger(this.name);

    if (info.State.Running === true) {
      this.status = ContainerStatus.ONLINE;

      await this.attach();
      this.logger.info('Attached to the container.');
    }
  }

  /**
   * Start the container if not running
   */
  async start () {
    if (this.status === ContainerStatus.OFFLINE) {
      this.logger.info('Container is now starting...');
      this.updateStatus(ContainerStatus.STARTING);
      await this.container.start();

      await this.attach();
      this.logger.info('Attached to the container, waiting for it to fully start.');
    } else {
      this.logger.warning('Received command to start the container but it is already running!');
    }
  }

  /**
   * Attach to the container if running
   */
  async attach () {
    const stream = await this.container.attach({ stream: true, stdout: true, stderr: true });

    // Listen for console output
    stream.on('data', (data) => {
      data.toString().split('\n').forEach((line) => {
        if (line) {
          this.onConsoleOutput(line.trim());
        }
      });
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
      this.updateStatus(ContainerStatus.ONLINE);
    }

    match = msg.match(this.regex.stop);
    if (match) {
      this.updateStatus(ContainerStatus.STOPPING);
    }
  }

  /**
   * Stop the container if running
   */
  async stop () {
    if (this.status !== ContainerStatus.OFFLINE && this.status !== ContainerStatus.STOPPING) {
      await this.container.stop();
    }
  }

  /**
   * Remove the container
   * This is a permanent action
   */
  async remove () {
    if (this.status !== ContainerStatus.OFFLINE) {
      await this.stop();
    } else {
      await this.container.remove();
      // TODO - Remove from cached zentry container
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
    this.emit(EventType.STATUS_UPDATE, status);
  }
};
