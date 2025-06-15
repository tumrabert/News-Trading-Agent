const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const LogLevel = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

/**
 * Logger class to manage application logs
 */
class Logger {
  constructor(component) {
    this.component = component;
  }

  /**
   * Write a log entry to file
   */
  _writeToFile(level, message, data = null) {
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
    const logDate = format(new Date(), "yyyy-MM-dd");
    const logFileName = `${logDate}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    let logEntry = `[${timestamp}] [${level}] [${this.component}] ${message}`;
    if (data) {
      logEntry += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    logEntry += "\n";

    fs.appendFileSync(logFilePath, logEntry);

    // Also log to console
    console.log(logEntry);
  }

  info(message, data = null) {
    this._writeToFile(LogLevel.INFO, message, data);
  }

  warning(message, data = null) {
    this._writeToFile(LogLevel.WARNING, message, data);
  }

  error(message, data = null) {
    this._writeToFile(LogLevel.ERROR, message, data);
  }

  debug(message, data = null) {
    this._writeToFile(LogLevel.DEBUG, message, data);
  }
}

/**
 * Create a logger instance for a component
 */
function createLogger(component) {
  return new Logger(component);
}

module.exports = {
  createLogger,
  LogLevel,
};
