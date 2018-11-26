//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const Time = effect("@builtin:Time", {
  Now: []
});

const time = {
  now() {
    return new Time.Now();
  }
};

const defaultTime = Time.makeHandler({
  Now(_, k) {
    k(null, new Date());
  }
});

Time.setDefaultHandler(defaultTime);

module.exports = { time, Time, defaultTime };
