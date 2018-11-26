//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const Promise = effect(
  "@builtin:Promise",
  {
    Await: ["promise"]
  },
  {
    Await({ promise }, k) {
      promise.then(value => k(null, value), error => k(error, null));
    }
  }
);

const promise = {
  await(promise) {
    return Promise.Await(promise);
  }
};

module.exports = { promise, Promise };
