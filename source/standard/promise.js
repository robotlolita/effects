//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const PromiseAlgebra = effect("@builtin:Promise", {
  Await: ["promise"]
});

const promise = {
  await(promise) {
    return new PromiseAlgebra.Await(promise);
  },
  makeHandler: PromiseAlgebra.makeHandler
};

const defaultPromise = promise.makeHandler({
  Await({ promise }, k) {
    promise.then(value => k(null, value), error => k(error, null));
  }
});

module.exports = { promise, PromiseAlgebra, defaultPromise };
