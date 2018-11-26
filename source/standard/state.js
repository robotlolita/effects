//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const StateAlgebra = effect("@builtin:State", {
  Read: ["box"],
  Update: ["box", "value"]
});

class Ref {
  constructor(value) {
    this.value = value;
  }
}

const state = {
  read(box) {
    return new StateAlgebra.Read(box);
  },

  update(box, value) {
    return new StateAlgebra.Update(box, value);
  },

  box(value) {
    return new Ref(value);
  }
};

const defaultState = StateAlgebra.makeHandler({
  Read(box, k) {
    k(box.value);
  },

  Update(box, value, k) {
    box.value = value;
    k();
  }
});

StateAlgebra.setDefaultHandler(defaultState);

module.exports = { StateAlgebra, state, defaultState, Ref };
