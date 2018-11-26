//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { handlers } = require("./handler");

class ArityMismatch extends Error {}

/**
 * Construct an effect algebra, given an unique identifier for it, and
 * a set of constructors for objects in the algebra.
 *
 * @example
 *     effect('Console', {
 *       Read: [],
 *       Write: ['string']
 *     })
 */
function effect(id, cases, defaults = {}) {
  const algebra = Object.create(null);

  const namespace = {
    toString() {
      return `<#Effect: ${id}>`;
    },

    get algebra() {
      return algebra;
    },

    makeHandler(cases) {
      return handlers.fromAlgebra(algebra, cases);
    }
  };

  for (const [name, params] of Object.entries(cases)) {
    const arity = params.length;
    const ctor = class {
      constructor(...args) {
        if (args.length !== arity) {
          throw new ArityMismatch(
            `Expected ${arity} arguments, got ${args.length}`
          );
        }
        for (const [i, key] of params.entries()) {
          Object.defineProperty(this, key, {
            value: args[i],
            enumerable: true
          });
        }
      }
    };
    Object.defineProperty(ctor, "name", { value: `${id}.${name}` });
    Object.defineProperty(ctor.prototype, "@folktale/effect-id", {
      value: `${id}.${name}`
    });
    if (name in defaults) {
      Object.defineProperty(ctor.prototype, "runEffect", {
        value: defaults[name]
      });
    }
    Object.defineProperty(algebra, name, { value: ctor, enumerable: true });
    Object.defineProperty(namespace, name, {
      value: (...args) => new ctor(...args),
      enumerable: true
    });
  }

  return namespace;
}

module.exports = { effect };
