class Logger {

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(timestamp, message);
  }

  debug(message) {
    if (process.env.NODE_DEBUG) {
      const timestamp = new Date().toISOString();
      console.debug(`${timestamp} - DEBUG:`, message);
    }
  }

  error(message) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} - ERROR:`,message);
  }

  time(label) {
    const timeLabel = `${new Date().toISOString()} - DEBUG: ${label}`;
    console.time(timeLabel);
    return timeLabel;
  }
  timeEnd(label) {
    console.timeEnd(label);
  }
}

export const logger = new Logger();
