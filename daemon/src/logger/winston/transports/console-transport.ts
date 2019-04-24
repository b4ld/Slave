import colors from 'colors/safe';
import { format, transports } from 'winston';
import { TransformableInfo } from 'logform';

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

export const consoleTransport = new transports.Console({
    format: format.combine(
        format(info => ({
            ...info,
            level: info.level.toUpperCase(),
        }))(),
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss.SSS' }), // YYYY-MM-DD
        format.printf(consoleFormatter)
    ),
});
