/**
 * ScrollVerse Trinity Sovereign - Production Logger
 * Winston-based structured logging with file rotation
 */

'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, errors, json, colorize, printf } = format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'scrollverse-sovereign',
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'production',
  },
  transports: [
    // Console output (colorized for development)
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    }),
    // Combined log file
    new transports.File({
      filename: path.join(logsDir, 'scrollverse.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 14,
      tailable: true,
    }),
    // Error-only log file
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 14,
    }),
    // Payment-specific log
    new transports.File({
      filename: path.join(logsDir, 'payments.log'),
      maxsize: 50 * 1024 * 1024,
      maxFiles: 30,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

module.exports = logger;
