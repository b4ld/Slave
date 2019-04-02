const path = require('path');
const fs = require('fs');
const xmlToJs = require('xml2js');

let logger = require('./logger')('Config');
const ConfigModel = require('./configuration.model');
const ConfigurationException = require('./configuration.exception');
const InvalidConfigurationException = require('./invalid-configuration.exception');
const ServerPropertyType = require('../server/server-property.enum');

const configFilePath = path.join(__dirname, '../slave-config-template.xml');

const parser = new xmlToJs.Parser({
  explicitArray: false,
  attrValueProcessors: [xmlToJs.processors.parseBooleans]
});

/**
 * Load the configuration from the xml object
 * 
 * @returns {ConfigModel} - The parsed configuration
 */
function loadAndParse () {
  logger.info(`Loading ${path.basename(configFilePath)}...`);
  const result = getConfigFileContents();

  if (!result.Configuration) {
    throw new InvalidConfigurationException();
  }

  const config = result.Configuration;

  if (
    !config.Daemon ||
    !config.Daemon.MountDir ||
    !config.Daemon.PortRange ||
    !config.Daemon.PortRange.Start ||
    !config.Daemon.PortRange.End
  ) {
    throw new InvalidConfigurationException('Invalid daemon configuration!');
  }
  
  const mountDir = config.Daemon.MountDir;
  const portRange = {
    start: config.Daemon.PortRange.Start,
    end: config.Daemon.PortRange.End
  };
  const servers = {};

  if (config.Servers) {
    if (Array.isArray(config.Servers.Server)) {
      for (const server of config.Servers.Server) {
        const s = parseServer(server);
        servers[s.name] = s;
      }
    } else {
      const s = parseServer(config.Servers.Server);
      servers[s.name] = s;
    }
  }

  return new ConfigModel({
    volume: mountDir,
    portRange: portRange,
    servers: servers
  });
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
 * Read the configuration file and parse to a js object
 * 
 * @returns {object} - object retrieved from the configuration file
 */
function getConfigFileContents () {
  const configFile = fs.readFileSync(configFilePath);

  let err;
  let xml;
  parser.parseString(configFile, (e, r) => {
    err = e;
    xml = r;
  });

  if (err) {
    throw err;
  }

  return xml;
}

module.exports.loadAndParse = loadAndParse;
