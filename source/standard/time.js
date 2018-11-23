//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const TimeEffect = effect("@builtin:Time", {
  Now: []
});

const time = {
  now() {
    return new TimeEffect.now();
  },
  makeHandler: TimeEffect.makeHandler
};

const defaultTime = time.makeHandler({
  now(_, k) {
    k(new Date());
  }
});

TimeEffect.setDefaultHandler(defaultTime);

module.exports = { time, TimeEffect, defaultTime };
