class Logger {
  private static _instance: Logger;

  private readonly _level: Logger.Level = Logger._fromEnv();

  private constructor() {}

  static get(): Logger {
    if (!this._instance) {
      this._instance = new Logger();
    }

    return this._instance;
  }

  debug(...args: unknown[]): void {
    this._emit(Logger.Level.debug, args);
  }

  info(...args: unknown[]): void {
    this._emit(Logger.Level.info, args);
  }

  warn(...args: unknown[]): void {
    this._emit(Logger.Level.warn, args);
  }

  error(...args: unknown[]): void {
    this._emit(Logger.Level.error, args);
  }

  private static _fromEnv(): Logger.Level {
    const env = process.env.LOG_LEVEL?.toLowerCase();
    if (env && env in Logger.Level) {
      return Logger.Level[env as keyof typeof Logger.Level];
    }
    return Logger.Level.info;
  }

  private _emit(level: Logger.Level, args: unknown[]): void {
    if (level < this._level) return;
    const name = Logger.Level[level] as keyof typeof Logger.Level;
    const method = name === "debug" ? "log" : name;
    const pad = Math.max(
      ...Object.keys(Logger.Level)
        .filter((k) => Number.isNaN(Number(k)))
        .map((k) => k.length),
    );
    console[method](`[${name.toUpperCase()}]`.padEnd(pad + 2), ...args);
  }
}

namespace Logger {
  export enum Level {
    debug,
    info,
    warn,
    error,
  }
}

export default Logger;
