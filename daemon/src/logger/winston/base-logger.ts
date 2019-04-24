import { createLogger, format } from 'winston';
import * as Transport from 'winston-transport';

import { consoleTransport } from './transports/console-transport';
import fileTransports from './transports/file-transports';

const loggerTransports: Transport[] = [];
if (process.env.NODE_ENV !== 'test') {
    loggerTransports.push(...fileTransports);
    if (process.env.NODE_ENV !== 'production') {
        loggerTransports.push(consoleTransport);
    }
}

export const baseLogger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.splat(),
        format.timestamp({ format: 'HH:mm:ss.SSS' })
    ),
    transports: loggerTransports,
});
