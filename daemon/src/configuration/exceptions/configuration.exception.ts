export default class ConfigurationException extends Error {
    constructor(message: string) {
        super();

        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    }
}
