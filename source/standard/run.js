//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");
const { run } = require("../runner");

const Run = effect(
  "@builtin:Run",
  {
    Run: ["effect"]
  },
  {
    Run({ effect }, k, handler) {
      run(handler, effect).then(
        value => k(null, value),
        error => k(error, null)
      );
    }
  }
);

const runner = {
  run(effect) {
    return Run.Run(effect);
  },

  runGenerator(gen) {
    return Run.Run(function*() {
      let { done, value: effect } = gen.next();

      while (!done) {
        const value = yield effect;
        const nextEffect = gen.next(value);
        done = nextEffect.done;
        effect = nextEffect.value;
      }

      return effect;
    });
  }
};

module.exports = {
  Run,
  runFunction: runner.run,
  runEffects: runner.runGenerator
};
