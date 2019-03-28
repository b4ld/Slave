const Container = require('../docker/container');
const ContainerStatus = require('../docker/containerStatus');
const EventType = require('../docker/eventType');
const config = require('../config/config');

module.exports = class Server extends Container {
  async init () {
    await super.init();

    const serverType = this.name.split('-')[0];
    this.config = config.configuration.servers[serverType];
    // this.logger.info(`Server config for ${serverType}:`);
    // console.log(this.config);

    if (this.status === ContainerStatus.OFFLINE) {
      if (this.config.properties.deleteOnStop) {
        this.logger.info('Server stopped, deleting container...');
        // TODO - Delete the container
      } else if (this.config.properties.autoRestart) {
        this.logger.info('Server is offline, restarting...');
        this.start();
      }
    }

    this.on(EventType.STATUS_UPDATE, newStatus => {
      if (newStatus === ContainerStatus.OFFLINE) {
        if (this.config.properties.deleteOnStop) {
          this.logger.info('Server stopped, deleting container...');
          // TODO - Delete the container
        } else if (this.config.properties.autoRestart) {
          this.logger.info('Restarting the server...');
          this.start();
        }
      }
    });
  }
};
