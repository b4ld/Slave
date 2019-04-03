const ConfigurationException = require('./configuration.exception');

module.exports = class InvalidConfigurationException extends ConfigurationException {
  constructor (message = 'Invalid configuration file!') {
    super(message);
  }
};
