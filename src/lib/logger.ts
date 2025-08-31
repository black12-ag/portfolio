type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = import.meta.env.PROD;
const enabledNamespaces = (import.meta.env.VITE_DEBUG || '').split(',').map(s => s.trim()).filter(Boolean);

// Throttle logs to prevent spam
const logThrottleMap = new Map<string, number>();
const LOG_THROTTLE_MS = 5000; // 5 seconds

function shouldLog(level: LogLevel, namespace?: string, message?: string): boolean {
  if (isProd && (level === 'debug' || level === 'info')) return false;
  
  // Throttle identical log messages
  if (message) {
    const key = `${namespace || 'default'}:${level}:${message}`;
    const now = Date.now();
    const lastLog = logThrottleMap.get(key);
    if (lastLog && now - lastLog < LOG_THROTTLE_MS) {
      return false;
    }
    logThrottleMap.set(key, now);
  }
  
  if (!namespace) return true;
  if (enabledNamespaces.length === 0) return !isProd;
  return enabledNamespaces.includes(namespace) || enabledNamespaces.includes('*');
}

function format(namespace: string | undefined, args: unknown[]) {
  const ts = new Date().toISOString();
  return namespace ? [`[${ts}] [${namespace}]`, ...args] : [`[${ts}]`, ...args];
}

export const logger = {
  debug: (namespace: string | undefined, ...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldLog('debug', namespace, message)) console.debug(...format(namespace, args));
  },
  info: (namespace: string | undefined, ...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldLog('info', namespace, message)) console.info(...format(namespace, args));
  },
  warn: (namespace: string | undefined, ...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldLog('warn', namespace, message)) console.warn(...format(namespace, args));
  },
  error: (namespace: string | undefined, ...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldLog('error', namespace, message)) console.error(...format(namespace, args));
  },
};

export default logger;


