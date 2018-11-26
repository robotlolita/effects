//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { effect } = require("../effect");

const State = effect(
  "@builtin:State",
  {
    Read: ["box"],
    Update: ["box", "value"]
  },
  {
    Read(box, k) {
      k(box.value);
    },

    Update(box, value, k) {
      box.value = value;
      k();
    }
  }
);

class Ref {
  constructor(value) {
    this.value = value;
  }
}

const state = {
  read(box) {
    return State.Read(box);
  },

  update(box, value) {
    return State.Update(box, value);
  },

  box(value) {
    return new Ref(value);
  }
};

module.exports = { State, state, Ref };
