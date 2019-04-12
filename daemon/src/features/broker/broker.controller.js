const amqp = require('amqplib/callback_api');
const validation = require('./broker.validation');
const logger = require('../../helpers/logger')('RabbitMQ', 'blue');

class BrokerController {
  async init(options = {}) {
    await validation.init(options);

    logger.info('Starting message broker...');

    // Make a rabbitmq connection
    await amqp.connect(`amqp://${options.hostname}`, function(err, conn) {
      conn.createChannel(function(err, ch) {
        const queue = options.queue;

        // Make sure that our queue stays intact even if the rabbitmq crashes or stops
        ch.assertQueue(queue, { durable: true });
        logger.info('Waiting for messages in #%s.', queue);

        // If theres more than one worker, it waits for the other one
        ch.prefetch(1);

        // Listen for messages
        ch.consume(
          queue,
          function(payload) {
            if (payload != null) {
              // TODO: decode payload and create container

              logger.info(
                'Requesting container with: %s',
                payload.content.toString()
              );

              // Send acknowledgment to the publisher
              ch.ack(payload);
            }
          },
          { noAck: false }
        );
      });
    });
  }
}

module.exports = new BrokerController();
