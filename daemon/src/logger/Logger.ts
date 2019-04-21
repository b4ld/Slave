import LoggerImpl from './winston/LoggerImpl';

export default interface Logger {
    info(message: string, ...meta: any[]): Logger;
    warn(message: string, ...meta: any[]): Logger;
    debug(message: string, ...meta: any[]): Logger;
    error(message: string, ...meta: any[]): Logger;
}

export const newLogger = (properties: object = {}) => {
    return new LoggerImpl(properties)
};
