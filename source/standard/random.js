//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const Random = effect("@builtin:Random", {
  Random: []
});

const random = {
  random() {
    return new Random.Random();
  },
  *randomInt(start, stop) {
    return Math.floor(start + (stop - start) * (yield this.random()));
  }
};

const defaultRandom = Random.makeHandler({
  Random(_, k) {
    k(null, Math.random());
  }
});

Random.setDefaultHandler(defaultRandom);

module.exports = { random, Random, defaultRandom };
