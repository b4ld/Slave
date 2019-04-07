/**
 * Event types the container holds.
 * @readonly
 * @enum {string}
 */
module.exports = Object.freeze({
  /**
   * Container status got updated(online, starting, offline, stopping)
   */
  STATUS_UPDATE: 'status_update',
  /**
   * Got new data from the container stdout
   */
  CONSOLE_OUTPUT: 'console_output' 
});
