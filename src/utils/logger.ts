/**
 * Production-safe logger that removes console logs in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

class ProductionLogger implements Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  
  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }
  
  warn(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }
  
  error(message: string, ...args: unknown[]): void {
    // Always log errors, even in production
    console.error(`❌ ${message}`, ...args);
  }
}

// Export a singleton instance
export const logger = new ProductionLogger();

// For compatibility with existing code, also export individual functions
export const logDebug = (message: string, ...args: unknown[]) => logger.debug(message, ...args);
export const logInfo = (message: string, ...args: unknown[]) => logger.info(message, ...args);
export const logWarn = (message: string, ...args: unknown[]) => logger.warn(message, ...args);
export const logError = (message: string, ...args: unknown[]) => logger.error(message, ...args);

export default logger;
