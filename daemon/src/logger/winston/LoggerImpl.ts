/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from 'colors/safe';
import { TransformableInfo } from 'logform';
import {
    createLogger,
    format,
    Logger as WinstonLogger,
    transports,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import Constants from '../../helpers/constants';
import Logger from '../Logger';

function fileFormatter(info: TransformableInfo): string {
    return `${info.timestamp} [${info.level}] ${info.message}${
        info.stack ? '\n' + info.stack : ''
    }`;
}

function consoleFormatter(info: TransformableInfo): string {
    if (info.timestamp) {
        info.timestamp = colors.green(info.timestamp);
    }
    if (info.label) {
        if (Array.isArray(info.label)) {
            info.label = info.label
                .filter(l => typeof l === 'string')
                .map(l => colors.cyan(`[${l}]`))
                .join('');
        }

        info.label = colors[info.color || 'yellow'](info.label);
    }

    const label = info.label ? `[${info.label}] ` : '';
    let stack = info.stack ? `\n${info.stack}` : '';
    if (!stack && info.err) {
        stack = `\n${info.err.stack}`;
    }

    return `${info.timestamp} ${info.level} ${label}${info.message}${stack}`;
}

export default class LoggerImpl implements Logger {
    private readonly baseLogger: WinstonLogger;

    constructor(properties: object) {
        this.baseLogger = createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: format.combine(
                format.splat(),
                format.timestamp({ format: 'HH:mm:ss.SSS' }),
                format.printf(fileFormatter)
            ),
            ...properties,
        });

        if (process.env.NODE_ENV !== 'test') {
            this.baseLogger.add(
                new transports.File({
                    filename: 'error.log',
                    dirname: Constants.LOG_FOLDER,
                    level: 'error',
                })
            );

            this.baseLogger.add(
                new DailyRotateFile({
                    filename: '%DATE%.log',
                    dirname: Constants.LOG_FOLDER,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxFiles: '14d',
                })
            );

            if (process.env.NODE_ENV !== 'production') {
                this.baseLogger.add(
                    new transports.Console({
                        format: format.combine(
                            format(info => ({
                                ...info,
                                level: info.level.toUpperCase(),
                            }))(),
                            format.colorize(),
                            format.timestamp({ format: 'HH:mm:ss.SSS' }), // YYYY-MM-DD
                            format.printf(consoleFormatter)
                        ),
                    })
                );
            }
        }
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
