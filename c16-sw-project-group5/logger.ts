import winston from 'winston';
import { env } from './env';

const logFormat = winston.format.printf(function(info) {
    let date = new Date().toISOString();
    return `${date}[${info.level}]: ${info.message}\n`;
  });


export const logger = winston.createLogger({
    level:env.LOGGING_LEVEL,
    format:winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    transports:[
        new winston.transports.Console()
    ]
});



