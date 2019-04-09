/**
 * The avaliable server properties with
 * its default value.
 * 
 * @readonly
 * @enum {string}
 */
module.exports = Object.freeze({
  MOUNT: {
    name: 'mount',
    default: false
  },
  AUTO_RESTART: {
    name: 'autoRestart',
    default: false
  },
  SINGLE_INSTANCE: {
    name: 'singleInstance',
    default: false
  },
  DELETE_ON_STOP: {
    name: 'deleteOnStop',
    default: true
  },
  VOLUME: {
    name: 'volume',
    default: []
  }
});
