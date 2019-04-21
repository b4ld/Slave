/**
 * The avaliable server properties with
 * its default value.
 */
enum ServerPropertyType {
    AUTO_RESTART = 'autoRestart',
    SINGLE_INSTANCE = 'singleInstance',
    DELETE_ON_STOP = 'deleteOnStop',
    VOLUME = 'volumes',
}

export default ServerPropertyType;
