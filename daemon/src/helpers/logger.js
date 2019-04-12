const winston = require('winston');
const format = winston.format;
require('winston-daily-rotate-file');
const colors = require('colors/safe');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.splat(),
    format.timestamp({ format: 'HH:mm:ss.SSS' }),
    format.printf(
      info =>
        `${info.timestamp} [${info.level}] ${info.message}${
          info.stack ? '\n' + info.stack : ''
        }`
    )
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log',
      dirname: './logs',
      level: 'error', 
    }),
    new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: './logs',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  // Log to console in development
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format(info => ({ ...info, level: info.level.toUpperCase() }))(),
        format.colorize(),
        winston.format((info, opts) => {
          if (info.timestamp) {
            info.timestamp = colors.green(info.timestamp);
          }
          if (info.label) {
            info.label = colors[info.color || 'yellow'](info.label);
          }

          return info;
        })(),
        format.timestamp({ format: 'HH:mm:ss.SSS' }), // YYYY-MM-DD 
        format.printf(
          info => {
            const label = info.label ? `[${info.label}] ` : '';
            let stack = info.stack ? `\n${info.stack}` : '';
            if (!stack && info.err) {
              stack = `\n${info.err.stack}`;
            }

            return `${info.timestamp} ${info.level} ${label}${info.message}${stack}`;
          }
        )
      ),
    })
  );
}

module.exports = (opts, color) => {
  if (typeof opts === 'string') {
    return logger.child({ label: opts, color });
  } else if (typeof opts === 'object') {
    return logger.child(...opts, color);
  }

  return logger;
};
