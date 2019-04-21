import ConfigurationException from './configuration.exception';

export default class InvalidConfigurationException extends ConfigurationException {
    constructor(message: string = 'Invalid configuration file!') {
        super(message);
    }
}
