const path = require('path');
const fs = require('fs');
const xml = require('xml2js');

let logger = require('./logger')('Config');
const ConfigurationException = require('./configuration.exception');
const ServerPropertyType = require('../server/server-property.enum');

const configFilePath = path.join(__dirname, '../slave-config-template.xml');

const parser = new xml.Parser({
  explicitArray: false,
  attrValueProcessors: [xml.processors.parseBooleans]
});
const configFile = fs.readFileSync(configFilePath);

/** @type {Configuration} */
const configuration = {};

function load () {
  return new Promise((resolve, reject) => {
    parser.parseString(configFile, (err, result) => {
      try {
        if (err) {
          reject(err);
          return;
        }

        loadXmlConfiguration(result);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Load the configuration from the xml object
 * 
 * @param {object} result object retrieved from the configuration file
 */
function loadXmlConfiguration (result) {
  logger.info(`Loading ${path.basename(configFilePath)}...`);

  if (!result.Configuration) {
    logger.info('Invalid configuration file!');
    return;
  }

  const config = result.Configuration;

  if (
    !config.Daemon ||
    !config.Daemon.MountDir ||
    !config.Daemon.PortRange ||
    !config.Daemon.PortRange.Start ||
    !config.Daemon.PortRange.End
  ) {
    logger.info('Invalid daemon configuration!');
    return;
  }

  configuration.mountDir = config.Daemon.MountDir;
  configuration.portRange = {
    start: config.Daemon.PortRange.Start,
    end: config.Daemon.PortRange.End
  };
  configuration.servers = {};

  if (config.Servers) {
    if (Array.isArray(config.Servers.Server)) {
      for (const server of config.Servers.Server) {
        const s = parseServer(server);
        configuration.servers[s.name] = s;
      }
    } else {
      const s = parseServer(config.Servers.Server);
      configuration.servers[s.name] = s;
    }
  }
  logger.info(`Configuration loaded!`);
}

/**
 *
 * @param {object} serverObject
 * @returns {ServerType} server
 */
function parseServer (serverObject) {
  logger = logger.child({ subLabel: serverObject.Name });
  assertFieldDefined(serverObject.Image, 'Server image is undefined!');

  if (!serverObject.Properties) {
    serverObject.Properties = { Property: [] };
  }

  /** @type {ServerType} */
  const server = {
    name: assertFieldDefined(serverObject.Name, 'Server name is undefined!'),
    image: {
      name: assertFieldDefined(
        serverObject.Image.Name,
        'Server image name is undefined!'
      )
    },
    properties: parseServerProperties(
      serverObject.Name,
      serverObject.Properties.Property
    )
  };

  logger.info(`Server configuration loaded for "${server.name}"!`);
  return server;
}

/**
 *
 * @param {object[]} props
 * @returns {ServerProperties}
 */
function parseServerProperties (serverName, props) {
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
          logger.warn(
            `${serverName} - The property ${prop.$.name} does not exist!`
          );
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
          `${serverName} - The property ${props.$.name} does not exist!`
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
  for (const p of Object.values(ServerPropertyType)) {
    if (p.name.toLowerCase() === property.toLowerCase()) {
      return p;
    }
  }
}

/**
 *
 * @param {object} field
 * @param {string} message
 */
function assertFieldDefined (field, message) {
  if (!field) {
    throw new ConfigurationException(message);
  }

  return field;
}

/**
 * @typedef Configuration
 * @type {object}
 * @property {string} mountDir - Mounting directory for containers.
 * @property {PortRange} portRange - Port range to register containers.
 * @property {Object.<string, ServerType>} servers - All server types avaliable.
 */

/**
 * @typedef PortRange
 * @type {object}
 * @property {number} start - Port range start
 * @property {number} end - Port range end
 */

/**
 * @typedef ServerType
 * @type {object}
 * @property {string} name - Server type name
 * @property {ContainerImage} image - Server container image
 * @property {ServerProperties} properties - Server properties
 */

/**
 * @typedef ServerProperties
 * @type {object}
 * @property {boolean} mount - Mount server container to local folder
 * @property {boolean} autoRestart - Restart if container stopps
 * @property {boolean} singleInstance - Keep only one instance of this server type running
 * @property {boolean} deleteOnStop - Delete container on stop
 */

/**
 * @typedef ContainerImage
 * @type {object}
 * @property {string} name - Image name
 */

module.exports.load = load;
module.exports.configuration = configuration;
