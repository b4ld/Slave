module.exports = class ServerException extends Error {
  constructor (message) {
    super();

    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
};
