const Joi = require('@hapi/joi');
const logger = require('../helpers/logger')('RabbitMQ', 'blue');

const schema = Joi.object().keys({
  hostname: Joi.string()
    .alphanum()
    .required(),
  queue: Joi.string()
    .alphanum()
    .required(),
  port: Joi.number().port(),
  username: Joi.string().alphanum(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
});

module.exports = {
  init: options => {
    const { error, value } = Joi.validate(options, schema);

    logger.debug(`Validating message broker options...`);

    if (error != undefined) {
      logger.error(`Message broker options error: ${error}`);
    }

    logger.debug('Message broker options validated w/success!');
  },
};
