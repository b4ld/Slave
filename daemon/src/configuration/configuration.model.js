
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
     * @type {Object.<string, ServerType>}
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
 * @property {string[]} volume - Delete container on stop
 */

/**
 * @typedef ContainerImage
 * @type {object}
 * @property {string} name - Image name
 */
