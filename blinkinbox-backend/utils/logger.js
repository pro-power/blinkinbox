// utils/logger.js
const logLevel = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const logger = {
  error: (...args) => {
    if (levels[logLevel] >= levels.error) {
      console.error(new Date().toISOString(), '[ERROR]', ...args);
    }
  },
  
  warn: (...args) => {
    if (levels[logLevel] >= levels.warn) {
      console.warn(new Date().toISOString(), '[WARN]', ...args);
    }
  },
  
  info: (...args) => {
    if (levels[logLevel] >= levels.info) {
      console.info(new Date().toISOString(), '[INFO]', ...args);
    }
  },
  
  debug: (...args) => {
    if (levels[logLevel] >= levels.debug) {
      console.debug(new Date().toISOString(), '[DEBUG]', ...args);
    }
  }
};

module.exports = logger;