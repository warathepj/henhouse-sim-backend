/**
 * Logger utility for simulator backend
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARN: 'WARN',
  DEBUG: 'DEBUG'
};

/**
 * Format timestamp for log messages
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message) => {
  return `[${getTimestamp()}] [${level}] ${message}`;
};

const logger = {
  info: (message) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message));
  },
  
  error: (message, error) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message));
    if (error) console.error(error);
  },
  
  warn: (message) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message));
  },
  
  debug: (message) => {
    if (process.env.DEBUG) {
      console.debug(formatMessage(LOG_LEVELS.DEBUG, message));
    }
  }
};

export default logger;