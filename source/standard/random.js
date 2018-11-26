//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const Random = effect(
  "@builtin:Random",
  {
    Random: []
  },
  {
    Random(_, k) {
      k(null, Math.random());
    }
  }
);

const random = {
  random() {
    return Random.Random();
  },
  *randomInt(start, stop) {
    return Math.floor(start + (stop - start) * (yield this.random()));
  }
};

module.exports = { random, Random };
