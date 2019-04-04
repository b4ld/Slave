
module.exports = class ServerModel {
  /**
   * @param {string} name - The server name
   * @param {ContainerImage} image - The container image
   * @param {ServerProperties} serverProperties - The server properties 
   */
  constructor (name, image, serverProperties) {
    /** 
     * Server type name
     * 
     * @type {string} 
    */
    this.name = name;

    /** 
     * Server container image
     * 
     * @type {ContainerImage}
    */
    this.image = image;

    /** 
     * Server properties
     * 
     * @type {ServerProperties}
    */
    this.properties = serverProperties;
  }
};

/**
 * @typedef ServerProperties
 * @type {object}
 * @property {boolean} mount - Mount server container to local folder
 * @property {boolean} autoRestart - Restart if container stopps
 * @property {boolean} singleInstance - Keep only one instance of this server type running
 * @property {boolean} deleteOnStop - Delete container on stop
 * @property {string[]} volume - Container volumes
 */

/**
 * @typedef ContainerImage
 * @type {object}
 * @property {string} name - Image name
 */
