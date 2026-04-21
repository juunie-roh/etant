/** A class constructor, including abstract classes. */
export type AbstractConstructor = abstract new (...args: any[]) => any;

/** Decorates a class. May return a replacement constructor. */
export type ClassDecorator = <Class extends AbstractConstructor>(
  target: Class,
  context: ClassDecoratorContext<Class>,
) => Class | void;

/** A class method signature parameterized by `this`, argument tuple, and return type. */
export type ClassMethod<This, Args extends unknown[], Return> = (
  this: This,
  ...args: Args
) => Return;

/** Decorates a method. Receives the original method and may return a replacement. */
export type ClassMethodDecorator = <This, Args extends unknown[], Return>(
  target: ClassMethod<This, Args, Return>,
  context: ClassMethodDecoratorContext<This, ClassMethod<This, Args, Return>>,
) => ClassMethod<This, Args, Return> | void;

type ClassFieldDecoratorResult<This, Value> = (
  this: This,
  initialValue: Value,
) => Value;

/** Decorates a field. `target` is `undefined` (fields do not exist at decoration time); may return an initializer that transforms the initial value. */
export type ClassFieldDecorator = <This, Value>(
  target: undefined,
  context: ClassFieldDecoratorContext<This, Value>,
) => void | ClassFieldDecoratorResult<This, Value>;

/** Decorates a getter. Receives the original getter and may return a replacement. */
export type ClassGetterDecorator = <This, Value>(
  target: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>,
) => ((this: This) => Value) | void;

/** Decorates a setter. Receives the original setter and may return a replacement. */
export type ClassSetterDecorator = <This, Value>(
  target: (this: This, value: Value) => void,
  context: ClassSetterDecoratorContext<This, Value>,
) => ((this: This, value: Value) => void) | void;

/** Decorates an auto-accessor (`accessor` keyword). Receives `{ get, set }` and may return a replacement plus an optional initializer. */
export type ClassAccessorDecorator = <This, Value>(
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
) => ClassAccessorDecoratorResult<This, Value> | void;

/** Union of every supported class-element decorator shape. */
export type Decorator = (target: unknown, context: DecoratorContext) => any;
