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

/**
 * An one-shot continuation for effects.
 *
 * @typedef {function(err: ?Err, out: ?Out): void} Continuation
 */

/**
 * Handlers of effects.
 *
 * @typedef {function(k: Continuation<Err, Out>): void} IHandler
 */

/**
 * The interface effect handlers should implement.
 *
 * @typedef {Object} IEffect
 * @property {IHandler<Err, Out>} runEffect -- Runs the effect, and passes the result to the continuation
 */

/**
 * Thrown when the one-shot aspect of the continuation is violated.
 */
export class OneShotViolationError extends Error {
  /**
   * @param {IEffect<Err, Out>} effect -- the effect that violated the one-shot constraint.
   */
  constructor(effect) {
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
   * @param {Err} error -- the error that was thrown
   * @param {Ret} result -- the result that was returned
   * @param {IEffect<Err, Ret>} effect -- the effect that violated this constraint.
   */
  constructor(error, result, effect) {
    super(
      `The continuation was called both with a non-null Error value (${error}), and a non-null result value (${result}). Continuations only accept one or the other. (While running ${effect})`
    );
  }
}

/**
 * A class that simplifies building effect handlers.
 *
 * @implements {IEffect<Err, Out>}
 */
export class Handler {
  /**
   * @param {string} description -- a description for the effect
   * @param {IHandler<Err, Out>} handler -- the actual handler implementation
   */

  constructor(handler, description = "") {
    /**
     * The actual handler implementation.
     *
     * @type {IHandler<Err, Out>}
     */
    this.handler = handler;

    /**
     * A description for this effect.
     *
     * @type {string}
     */
    this.description = description;
  }

  /**
   * Runs the the handler for this effect.
   *
   * @param {IHandler<Err, Out>} k -- the continuation
   */
  runEffect(k) {
    const handler = this.handler;
    return handler(k);
  }

  /**
   * Returns a textual representation of this effect.
   *
   * @returns {string}
   */
  toString() {
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
 * @template Out -- the intermediate values in the generator
 * @template Err -- the error that an effect may propagate
 * @template Ret -- the final value of the generator
 * @param {Generator<Effect<Out, Err>, Ret>} generator -- A generator that yields Effects.
 * @returns {Promise<Ret, Err>} -- the final value of the generator.
 */
export function run(generator) {
  return new Promise((resolve, reject) => {
    /**
     * Runs one step of the suspended continuation, and interpret its Effect.
     * This is seeded with the value previous output by interpreting the last
     * effect of the suspended function.
     *
     * @param {Out | null} value -- the value to input to the generator.
     */
    function go(value) {
      const { value: effect, done } = generator.next(value);
      let called = false;

      if (done) {
        resolve(effect);
      } else {
        effect.runEffect((error, result) => {
          if (called) {
            reject(new OneShotViolationError(effect));
          } else {
            called = true;
            if (error != null) {
              if (result != null) {
                reject(new ContinuedWithErrorAndSuccess(error, result, effect));
              } else {
                reject(error);
              }
            } else {
              resolve(result);
            }
          }
        });
      }
    }

    go(undefined);
  });
}
