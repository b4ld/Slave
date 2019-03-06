'use strict'

const Docker = require('dockerode')
const logger = require('../config/logger')()
const Container = require('./container')

const client = new Docker()

module.exports.client = client
module.exports.DockerController = class DockerController {
  constructor () {
    this.init()
      .catch(err => {
        if (err.errno === 'ENOENT' && err.syscall === 'connect') {
          logger.error('Error connecting to docker!', { stack: err.stack })
        } else {
          logger.error('Error initializing Docker Controller!', { stack: err.stack })
        }
      })
  }

  /**
   * Initialize the docker controller.
   * Ensures images are updated and check for
   * existing zentry containers.
   */
  async init () {
    logger.info('Donwloading required images...')
    await this.ensureImagesLoaded()
    logger.info('All images required are loaded localy!')

    logger.info('Checking for existing containers...')
    const containers = client.listContainers({ all: true })
    for (const container of containers) {
      if (this.isZentryServer(container)) {
        logger.info('Found a zentry container! %s', container.Names)
        this.initContainer(container)
      }
    }
  }

  /**
   * Ensure that all the images required for the 
   * containers are present localy.
   * @private
   */
  async ensureImagesLoaded () {
    const servers = require('../config.json').servers
    const images = Object.keys(servers)
      .map(server => servers[server].image)
      // Filter duplicated values
      .filter((item, pos, self) => self.indexOf(item) === pos)

    for (const image of images) {
      if (typeof image === 'string') {
        await client.pull(image, {})
      } else if (typeof image === 'object') {
        // Image from private repo, with auth
        await client.pull(image.image, { 'authconfig': image.auth })
      }
    }
  }

  /**
   * Initialize a zentry server container
   * 
   * @param {Docker.ContainerInfo} containerInfo 
   */
  initContainer (containerInfo) {
    const container = client.getContainer(containerInfo.Id)

    new Container(container)
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
        return true
      }
    }

    return false
  }
}
