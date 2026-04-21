import Logger from "../logger";

namespace Log {
  export interface Options {
    /** Which level to emit log. */
    level?: keyof typeof Logger.Level;
    label?: string;
    message?: string;
  }
}

/**
 * Factory form: returns a configured decorator.
 * @param options See {@link Log.Options | `Log.Options`}.
 */
function Log(
  options: Log.Options,
): (target: unknown, context: DecoratorContext) => any;

/** Logs class instantiation via `addInitializer`. `@Log class Foo {}`. */
function Log<Class extends abstract new (...args: any[]) => any>(
  target: Class,
  context: ClassDecoratorContext<Class>,
): Class | void;

/** Wraps a method to log invocation and elapsed time. */
function Log<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This>,
): (this: This, ...args: Args) => Return;

/** Logs the initial value assigned to a class field. */
function Log<This, Value>(
  target: undefined,
  context: ClassFieldDecoratorContext<This, Value>,
): ((this: This, initialValue: Value) => Value) | void;

/** Wraps an auto-accessor to log getter and setter access. */
function Log<This, Value>(
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
): ClassAccessorDecoratorResult<This, Value> | void;

function Log(targetOrOptions: unknown, context?: DecoratorContext): unknown {
  if (context === undefined) {
    const options = targetOrOptions as Log.Options;
    return (target: unknown, ctx: DecoratorContext) =>
      apply(target, ctx, options);
  }
  return apply(targetOrOptions, context);
}

function apply(
  target: unknown,
  context: DecoratorContext,
  options?: Log.Options,
): unknown {
  const logger = Logger.get();
  const level = options?.level ?? "info";
  const name = String(context.name ?? "anonymous");
  const message = options?.message;

  const qualify = (self: unknown): string => {
    const cls = (self as object).constructor?.name;
    return cls ? `${cls}.${name}` : name;
  };

  switch (context.kind) {
    case "class":
      context.addInitializer(() => {
        logger[level](`new ${name}`);
        if (message) logger[level](message);
      });
      return;

    case "method":
      const method = target as (...args: unknown[]) => unknown;
      return function (this: unknown, ...args: unknown[]): unknown {
        const name = options?.label ?? qualify(this);
        logger[level](`${name} called`);
        // check performance only at the "debug" level.
        const s = level === "debug" ? performance.now() : undefined;
        try {
          const result = method.call(this, ...args);
          if (result instanceof Promise) {
            return result
              .then((value) => {
                if (message) logger[level](message);
                logger[level](`${name} ended ${elapsed(s)}`);
                return value;
              })
              .catch((err) => {
                logger.error(`${name} threw`, err);
                throw err;
              }) as typeof result;
          }
          if (message) logger[level](message);
          logger[level](`${name} ended ${elapsed(s)}`);
          return result;
        } catch (err) {
          logger.error(`${name} threw`, err);
          throw err;
        }
      };

    case "field":
      return function (this: unknown, initialValue: unknown): unknown {
        const name = qualify(this);
        logger[level](`${name} =`, initialValue);
        if (message) logger[level](message);
        return initialValue;
      };

    case "accessor":
      const { get, set } = target as ClassAccessorDecoratorTarget<
        unknown,
        unknown
      >;
      return {
        get(this: unknown): unknown {
          const value = get.call(this);
          logger[level](`get ${qualify(this)}`, value);
          if (message) logger[level](message);
          return value;
        },
        set(this: unknown, value: unknown): void {
          logger[level](`set ${qualify(this)}`, value);
          if (message) logger[level](message);
          set.call(this, value);
        },
      };
  }
}

function elapsed(start?: number): string {
  if (!start) return "";
  const ms = performance.now() - start;
  const formatted =
    ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;
  return `(${formatted})`;
}

export default Log;
