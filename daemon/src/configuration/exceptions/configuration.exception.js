module.exports = class ConfigurationException extends Error {
  constructor (message) {
    super();

    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
};
