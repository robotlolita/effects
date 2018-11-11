//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// This module provides the means for running Effect computations.
// An effect is any type that implements the Effect interface, as
// described below.
//
//     interface Effect<Out, Error> {
//       runEffect(k :: once (Error | null, Out | null) -> Void);
//     }
//
// That is, an effect interface specifies a single `runEffect` operation,
// which receives a continuation `k`. This continuation may be called with
// an Error value, in which case the suspended function fails entirely, or
// with an output value, in which case execution of suspended function
// proceeds where it left off.
//
// The continuation `k` is an one-shot continuation, which means that it
// may be called *at most once*. Because JavaScript does not have a linear
// type system (or a type system at all), this restriction is enforced at
// runtime.

type Nullable<T> = T | null | undefined;
type Continuation<Err, Out> = (err: Nullable<Err>, out: Nullable<Out>) => void;

interface Generator<I, E, O, R> {
  next(input?: I): GeneratorResult<O, R>;
  throw(input?: E): GeneratorResult<O, R>;
  return(input?: R): GeneratorResult<O, R>;
}

type GeneratorResult<O, R> =
  | { done: true; value: R }
  | { done: false; value: O };

/**
 * The interface that effect handlers should implement.
 */
interface IEffect<Err, Out> {
  /**
   * Runs the effect, passing its completion value to the continuation.
   */
  runEffect(k: Continuation<Err, Out>): void;
}

/**
 * Thrown when the one-shot aspect of the continuation is violated.
 */
export class OneShotViolationError extends Error {
  /**
   * @param effect -- the effect that violated the one-shot constraint.
   */
  constructor(effect: IEffect<any, any>) {
    super(
      `An one-shot continuation was called more than once. (While running ${effect})`
    );
  }
}

/**
 * Thrown when the continuation receives both a non-null Error value, and
 * a non-null Result value.
 */
export class ContinuedWithErrorAndSuccess extends Error {
  /**
   * @param error -- the error that was thrown
   * @param result -- the result that was returned
   * @param effect -- the effect that violated this constraint.
   */
  constructor(error: any, result: any, effect: IEffect<any, any>) {
    super(
      `The continuation was called both with a non-null Error value (${error}), and a non-null result value (${result}). Continuations only accept one or the other. (While running ${effect})`
    );
  }
}

/**
 * A class that simplifies building effect handlers.
 */
export class Handler<Err, Out> implements IEffect<Err, Out> {
  /**
   * @param description -- a description for the effect
   * @param handler -- the actual handler implementation
   */

  constructor(
    readonly handler: (k: Continuation<Err, Out>) => void,
    readonly description: string = ""
  ) {}

  /**
   * Runs the the handler for this effect.
   *
   * @param k -- the continuation
   */
  runEffect(k: Continuation<Err, Out>): void {
    const handler = this.handler;
    handler(k);
  }

  /**
   * Returns a textual representation of this effect.
   */
  toString(): string {
    return `[Handler for effect: ${this.description}]`;
  }
}

/**
 * Runs a generator that yields Effect values, by interpreting each effect of the
 * generator (one at a time).
 *
 * This works as a collaborative process, where the generator runs its routine until
 * suspension, and returns an effect; we interpret this effect, which either results
 * in a value or an error, and—if successful—run the next step of the generator with
 * the value.
 *
 * > NOTE: it's impossible to give this function a sensible type (for now) in TypeScript.
 *
 * @param generator -- A generator that yields Effects.
 */
export function run<Err, Ret, Out, Args extends any[]>(
  gen: (...args: Args) => IterableIterator<IEffect<Err, Out>>,
  ...args: Args
) {
  const generator = gen(...args) as Generator<
    Nullable<Out>,
    Err,
    IEffect<Err, Out>,
    Ret
  >;
  return new Promise<Ret>((resolve, reject) => {
    function next(value: Nullable<Out>) {
      try {
        const result = generator.next(value);

        if (result.done) {
          resolve(result.value);
        } else {
          handleEffect(result.value);
        }
      } catch (error) {
        reject(error);
      }
    }

    function handleEffect(effect: IEffect<Err, Out>) {
      let called = false;

      effect.runEffect((error, result) => {
        if (called) {
          return reject(new OneShotViolationError(effect));
        }

        called = true;
        if (error != null) {
          if (result != null) {
            return reject(
              new ContinuedWithErrorAndSuccess(error, result, effect)
            );
          }

          throwAndContinue(error);
        } else {
          next(result);
        }
      });
    }

    function throwAndContinue(error: Err) {
      try {
        const result = generator.throw(error);
        if (result.done) {
          resolve(result.value);
        } else {
          handleEffect(result.value);
        }
      } catch (error) {
        reject(error);
      }
    }

    next(undefined);
  });
}
