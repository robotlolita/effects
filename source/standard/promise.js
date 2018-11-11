//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

import { Handler } from "../core";

/**
 * A handler for Promise-based effects.
 *
 * This allows running Promise-based computations directly in the
 * generalised Effect-based routines. Errors thrown *within* the
 * Promise-based effect are caught and propagated as rejected
 * promises as usual, but this does not affect the Effect-based
 * routine.
 */
class PromiseEffect {
  /**
   * Awaits the result of the given promise.
   *
   * If successful, the routine continues with the output of the
   * promise.
   *
   * If the promise fails, the *entire routine* fails.
   *
   * @param {Promise<Out, Err>} promise -- the promise computation to run.
   * @return {Handler<Err, Out>} an effect handler for the promise.
   */
  await(promise) {
    new Handler(k => {
      promise.then(value => k(null, value), error => k(error, null));
    });
  }
}

export const promise = new PromiseEffect();
