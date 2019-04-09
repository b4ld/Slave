const ServerException = require('./server.exception');

module.exports = class InvalidServerException extends ServerException {
  constructor (message = 'Invalid server!') {
    super(message);
  }
};
