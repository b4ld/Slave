const winston = require('winston');
const format = winston.format; 
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.timestamp({ format: 'HH:mm:ss.SSS' }),
    format.printf(info => `${info.timestamp} [${info.level}] ${info.message}${info.stack ? '\n' + info.stack : ''}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.DailyRotateFile({ 
      filename: '%DATE%.log',
      dirname: './logs',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  // Log to console in development
  logger.add(new winston.transports.Console({
    format: format.combine(
      format(info => ({ ...info, level: info.level.toUpperCase() }))(),
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      format.printf(info => `${info.timestamp} [${info.level}]${info.label ? `[${info.label}]` : ''}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`)
    )
  }));
}

module.exports = (opts) => {
  if (typeof opts === 'string') {
    return logger.child({ label: opts });
  } else if (typeof opts === 'object') {
    return logger.child(...opts);
  }

  return logger;
};
