const fs = require('fs');
const controllers = [].concat(
  require('./controllers/server/server.controller')
);

module.exports = {
  routes: controllers,
};
