export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level <= this.level) {
      const timestamp = new Date().toISOString();
      const levelStr = LogLevel[level];
      console.log(`[${timestamp}] ${levelStr}: ${message}`, data || '');
    }
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }
}

export const logger = new Logger();