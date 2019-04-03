const Container = require('../docker/container');
const ContainerStatus = require('../docker/container-status.enum');
const EventType = require('../docker/event-types.enum');
const config = require('../helpers/configuration');

module.exports = class Server extends Container {
  async init () {
    await super.init();

    const serverType = this.name.split('-')[0];
    this.config = config.servers[serverType];
    // this.logger.info(`Server config for ${serverType}:`);
    // console.log(this.config);

    if (this.status === ContainerStatus.OFFLINE) {
      if (this.config.properties.deleteOnStop) {
        this.logger.info('Server stopped, deleting container...');
        this.remove()
          .then(() => this.logger.info('Container deleted!'))
          .catch(err => this.logger.error('Failed to delete the container!', { stack: err.stack }));
      } else if (this.config.properties.autoRestart) {
        this.logger.info('Server is offline, restarting...');
        this.start();
      }
    }

    this.on(EventType.STATUS_UPDATE, newStatus => {
      if (newStatus === ContainerStatus.OFFLINE) {
        if (this.config.properties.deleteOnStop) {
          this.logger.info('Server stopped, deleting container...');
          this.remove()
            .then(() => this.logger.info('Container deleted!'))
            .catch(err => this.logger.error('Failed to delete the container!', { stack: err.stack }));
        } else if (this.config.properties.autoRestart) {
          this.logger.info('Restarting the server...');
          this.start();
        }
      }
    });
  }
};
