'use strict'

const EventEmitter = require('events')
const logger = require('../config/logger')
const ContainerStatus = require('./containerStatus')
const EventType = require('./eventType')

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
    super()

    this.logger = logger()
    // Temporary values
    this.name = container.id
    this.containerName = container.id

    this.container = container
    this.status = ContainerStatus.OFFLINE
    this.regex = {
      start: /^(.*?)\[[\d:]{8} INFO]: Done \((.*?)s\)! For help, type "help"/,
      stop: /^(.*?)\[[\d:]{8} INFO]: Stopping server/
    }

    this.init()
      .then(() => this.logger.info('Container "%s" loaded! Current status: %s', this.containerName, this.status))
      .catch(err => this.logger.error('Failed to start the container!', { stack: err.stack }))
  }

  /**
   * Initialize the container.
   * Gets the container's name and state and
   * start it if not running already.
   */
  async init () {
    const info = await this.container.inspect()

    this.name = info.Name.substr(15)
    this.containerName = info.Name.substr(1)
    this.logger = logger(this.name)

    if (info.State.Running === true) {
      this.status = ContainerStatus.ONLINE

      this.attach()
        .then(() => this.logger.info('Attached to the container.'))
    } else {
      this.start()
    }
  }

  /**
   * Start the container
   */
  async start () {
    if (this.status === ContainerStatus.OFFLINE) {
      this.logger.info('Container is now starting...')
      this.updateStatus(ContainerStatus.STARTING)
      await this.container.start()

      await this.postStart()
    } else {
      this.logger.warning('Received command to start the container but it is already running!')
    }
  }

  async postStart () {
    await this.attach()
    this.logger.info('Attached to the container, waiting for it to fully start.')
  }

  /**
   * Attach to the container 
   */
  async attach () {
    const stream = await this.container.attach({ stream: true, stdout: true, stderr: true })

    // Listen for console output
    stream.on('data', (data) => {
      data.toString().split('\n').forEach((line) => {
        if (line) {
          this.onConsoleOutput(line.trim())
        }
      })
    })
  }

  /**
   * Method called when there is new console output
   * @param {string} msg - Message received
   */
  async onConsoleOutput (msg) {
    let match = msg.match(this.regex.start)
    if (match) {
      this.updateStatus(ContainerStatus.ONLINE)
    }

    match = msg.match(this.regex.stop)
    if (match) {
      this.updateStatus(ContainerStatus.STOPPING)
    }
  }

  /**
   * 
   * @param {string} status 
   */
  updateStatus (status) {
    this.status = status
    this.emit(EventType.STATUS_UPDATE, status)
    this.logger.info('Status updated: %s', this.status)
  }
}
