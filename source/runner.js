//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { handlers } = require("./handler");

class OneShotViolationError extends Error {
  constructor(effect) {
    super(
      `An one-shot continuation was called more than once. (While running ${effect})`
    );
  }
}

class ContinuedWithErrorAndSuccess extends Error {
  constructor(error, result, effect) {
    super(
      `The continuation was called both with a non-null Error value (${error}), and a non-null result value (${result}). Continuations only accept one or the other. (While running ${effect})`
    );
  }
}

function runEffect(handler, effect, k) {
  const id = effect["@folktale/effect-id"];
  const fn = handler.maybeGet(id);

  if (fn != null) {
    fn(effect, k, handler);
  } else if (effect.runEffect) {
    const fn = effect.runEffect;
    fn(effect, k, handler);
  } else {
    throw new Error(`No handler defined for ${id}`);
  }
}

function run(handlers, gen) {
  const generator = gen();

  return new Promise((resolve, reject) => {
    function next(value) {
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

    function handleEffect(effect) {
      let called = false;

      runEffect(handlers, effect, (error, result) => {
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

    function throwAndContinue(error) {
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

module.exports = { run };
