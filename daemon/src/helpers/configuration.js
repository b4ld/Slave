const ConfigParser = require('../configuration/parsers/configuration.parser');

let configuration = ConfigParser.loadAndParse();

/**
 * Get all container images configured
 * 
 * @returns {import('../configuration/configuration.model').ContainerImage[]}
 */
function getImages () {
  return Object.values(configuration.servers)
    .map(server => server.image)
    // Filter duplicated values
    .filter((item, pos, self) => {
      for (let i = 0; i < self.length; i++) {
        if (item.name === self[i].name) {
          return i === pos;
        }
      }
    });
}

/**
 * Reload the configuration
 */
function reload () {
  configuration = ConfigParser.loadAndParse();
}

module.exports = {
  ...configuration,
  getImages,
  reload
};
