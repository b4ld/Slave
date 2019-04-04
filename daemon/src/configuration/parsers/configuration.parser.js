const path = require('path');
const fs = require('fs');
const xmlToJs = require('xml2js');

let logger = require('../../helpers/logger')('Config');
const ConfigModel = require('../configuration.model');
const ConfigurationException = require('../exceptions/configuration.exception');
const InvalidConfigurationException = require('../exceptions/invalid-configuration.exception');
const parseServerProperties = require('./server-property.parser');

const configFilePath = path.join(__dirname, '../../slave-config-template.xml');

const parser = new xmlToJs.Parser({
  explicitArray: false,
  attrValueProcessors: [xmlToJs.processors.parseBooleans]
});

/** @typedef {import('../configuration.model').ServerType} ServerType */

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
module.exports.logger = logger;
