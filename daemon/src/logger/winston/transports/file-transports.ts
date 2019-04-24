import { TransformableInfo } from 'logform';
import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import Constants from '../../../helpers/constants';

function fileFormatter(info: TransformableInfo): string {
    return `${info.timestamp} [${info.level}] ${info.message}${
        info.stack ? '\n' + info.stack : ''
    }`;
}

export const dailyFileTransport = new DailyRotateFile({
    filename: '%DATE%.log',
    dirname: Constants.LOG_FOLDER,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '14d',
    level: 'debug',
    format: format.printf(fileFormatter),
});

export const errorFileTransport = new transports.File({
    filename: 'error.log',
    dirname: Constants.LOG_FOLDER,
    level: 'error',
    format: format.printf(fileFormatter),
});

export default [dailyFileTransport, errorFileTransport];
