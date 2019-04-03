const ServerPropertyType = require('../../server/server-property.enum');
const logger = require('./configuration.parser').logger;

/**
 *
 * @param {string} server - The server name
 * @param {object[]} props - The properties to parse
 * @returns {import('../configuration.model').ServerProperties} - The parsed properties
 */
function parseServerProperties (server, props) {
  /** @type {ServerProperties} */
  const properties = {};

  if (props) {
    if (Array.isArray(props)) {
      for (const prop of props) {
        if (!prop.$ || !prop.$.name) {
          continue;
        }

        const property = isValidServerProperty(prop.$.name);
        if (!property) {
          logger.warn(`${server} - The property ${prop.$.name} does not exist!`);
          continue;
        }

        properties[property.name] = prop.$.type === undefined
          ? property.default
          : prop.$.type;
      }
    } else if (props.$ && props.$.name) {
      const property = isValidServerProperty(props.$.name);
      if (!property) {
        logger.warn(
          `${server} - The property ${props.$.name} does not exist!`
        );
      } else {
        properties[property.name] = props.$.type || property.default;
      }
    }
  }

  if (properties[ServerPropertyType.AUTO_RESTART]) {
    properties[ServerPropertyType.DELETE_ON_STOP] = false;
  }

  // Fill undefined properties
  for (const p of Object.values(ServerPropertyType)) {
    if (properties[p.name] === undefined) {
      properties[p.name] = p.default;
    }
  }

  return properties;
}

/**
 * Check if the property exists
 *
 * @param {string} property property to check
 * @returns {string} ServerProperty if property exists, undefined otherwise
 */
function isValidServerProperty (property) {
  console.log(ServerPropertyType.MOUNT);
  for (const p of Object.values(ServerPropertyType)) {
    if (p.name.toLowerCase() === property.toLowerCase()) {
      return p;
    }
  }
}

module.exports = parseServerProperties;
