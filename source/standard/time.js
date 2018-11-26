//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const Time = effect(
  "@builtin:Time",
  {
    Now: []
  },
  {
    Now(_, k) {
      k(null, new Date());
    }
  }
);

const time = {
  now() {
    return Time.Now();
  }
};

module.exports = { time, Time };
