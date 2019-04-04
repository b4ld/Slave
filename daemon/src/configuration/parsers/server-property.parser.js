const ServerPropertyType = require('../../server/server-property.enum');
const logger = require('./configuration.parser').logger;

class ServerPropertyParser {
  constructor (server) {
    this.server = server;
    this.properties = [];
  }
  
  /**
   * Parse an array of properties.
   * 
   * @param {object[]} props 
   */
  parse (props) {
    if (props) {
      if (Array.isArray(props)) {
        for (const prop of props) {
          this.parseProperty(prop);
        }
      } else {
        this.parseProperty(props);
      }
    }

    if (this.properties[ServerPropertyType.AUTO_RESTART.name]) {
      this.properties[ServerPropertyType.DELETE_ON_STOP.name] = false;
    }

    // Fill undefined properties
    for (const p of Object.values(ServerPropertyType)) {
      if (this.properties[p.name] === undefined) {
        this.properties[p.name] = p.default;
      }
    }
  }

  /**
   * Parse a single property
   * 
   * @param {object} prop 
   */
  parseProperty (prop) {
    if (!prop.$ || !prop.$.name) {
      return;
    }

    const property = this.isValidServerProperty(prop.$.name);
    if (!property) {
      logger.warn(`${this.server} - The property ${prop.$.name} does not exist!`);
      return;
    }

    if (property === ServerPropertyType.VOLUME) {
      /** @type {string[]} */
      const volumes = this.properties[ServerPropertyType.VOLUME.name] || [];
      volumes.push(prop.$.type);
      this.properties[ServerPropertyType.VOLUME.name] = volumes;
    } else {
      this.properties[property.name] = prop.$.type === undefined
        ? property.default
        : prop.$.type;
    }
  }

  /**
   * Check if the property exists
   *
   * @param {string} property property to check
   * @returns {ServerProperty} ServerProperty if property exists, undefined otherwise
   */
  isValidServerProperty (property) {
    for (const p of Object.values(ServerPropertyType)) {
      if (p.name.toLowerCase() === property.toLowerCase()) {
        return p;
      }
    }
  }

  /** 
   * Get the parsed properties 
   * 
   * @returns {import('../configuration.model').ServerProperties}
  */
  get () {
    return this.properties;
  }
}

/**
 *
 * @param {string} server - The server name
 * @param {object[]} props - The properties to parse
 * @returns {import('../configuration.model').ServerProperties} - The parsed properties
 */
module.exports = (server, props) => {
  const parser = new ServerPropertyParser(server);
  parser.parse(props);

  console.log(`${parser.server} properties:\n`, parser.get());
  return parser.get();
};
