//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const RandomEffect = effect("@builtin:Random", {
  Random: []
});

const random = {
  random() {
    return new RandomEffect.Random();
  },
  *randomInt(start, stop) {
    return start + (stop - start) * (yield this.random());
  },
  makeHandler: RandomEffect.makeHandler
};

const defaultRandom = random.makeHandler({
  random(_, k) {
    k(Math.random());
  }
});

RandomEffect.setDefaultHandler(defaultRandom);

module.exports = { random, RandomEffect, defaultRandom };
