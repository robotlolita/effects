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
 * An effect algebra for time.
 */
export class TimeEffect {
  /**
   * Returns the current date.
   *
   * In the default handler, returns the date from the system.
   */
  now() {
    return new Handler<void, Date>(k => {
      k(null, new Date());
    });
  }
}

export const time = new TimeEffect();
