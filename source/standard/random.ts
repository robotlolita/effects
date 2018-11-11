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
 * An effect algebra for random number generation.
 */
export class RandomEffect {
  /**
   * Returns a random number between [0, 1).
   */
  random() {
    return new Handler<void, number>(k => k(null, Math.random()));
  }
}

export const random = new RandomEffect();
