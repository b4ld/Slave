const Register = require('prom-client').register;
const Counter = require('prom-client').Counter;
const ResponseTime = require('response-time');
const logger = require('../../helpers/logger')('Prometheus', 'green');

/**
 * A Prometheus counter that counts the invocations of the different HTTP verbs
 * e.g. a GET and a POST call will be counted as 2 different calls
 */
module.exports.numOfSlaves = new Counter({
  name: 'numOfSlaves',
  help: 'Number of slave nodes made',
  labelNames: ['nodes'],
});

module.exports.startCollection = function() {
  logger.info(
    `Starting the collection of metrics, the metrics are available on /metrics`
  );
  require('prom-client').collectDefaultMetrics();
};

module.exports.requestCounters = function(req, res, next) {
  if (req.path != '/metrics') {
    numOfRequests.inc({ method: req.method });
    pathsTaken.inc({ path: req.path });
  }
  next();
};

module.exports.responseCounters = ResponseTime(function(req, res, time) {
  if (req.url != '/metrics') {
    responses.labels(req.method, req.url, res.statusCode).observe(time);
  }
});

module.exports.injectMetricsRoute = function(App) {
  App.get('/metrics', (req, res) => {
    res.set('Content-Type', Register.contentType);
    res.end(Register.metrics());
  });
};
