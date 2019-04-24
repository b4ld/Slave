/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger as WinstonLogger } from 'winston';

import Logger from '../Logger';
import { baseLogger } from './base-logger';

export default class LoggerImpl implements Logger {
    private readonly baseLogger: WinstonLogger;

    constructor(properties: object) {
        this.baseLogger = baseLogger.child(properties);
    }

    info(message: string, ...meta: any[]): Logger {
        this.baseLogger.info(message, ...meta);

        return this;
    }

    warn(message: string, ...meta: any[]): Logger {
        this.baseLogger.warn(message, ...meta);

        return this;
    }

    debug(message: string, ...meta: any[]): Logger {
        this.baseLogger.debug(message, ...meta);

        return this;
    }

    error(message: string, ...meta: any[]): Logger {
        this.baseLogger.error(message, ...meta);

        return this;
    }
}
