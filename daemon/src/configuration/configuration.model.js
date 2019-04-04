const ServerModel = require('../server/server.model');

module.exports = class ConfigurationModel {
  /**
   * 
   * @param {Configuration} configuration 
   */
  constructor (configuration) {
    /** 
     * Mounting directory for containers
     * 
     * @type {string} 
     */
    this.mountDir = configuration.volume;

    /**
     * Port range to register containers
     * 
     * @type {PortRange}
     */
    this.portRange = configuration.portRange;

    /**
     * All server types avaliable
     * 
     * @type {Object.<string, ServerModel>}
     */
    this.servers = configuration.servers;
  }
};

/**
 * @typedef PortRange
 * @type {object}
 * @property {number} start - Port range start
 * @property {number} end - Port range end
 */
