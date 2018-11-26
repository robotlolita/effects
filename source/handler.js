//----------------------------------------------------------------------
//
// This source file is part of the Effects project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

class UnknownEffectInAlgebraError extends Error {
  constructor(algebra, effect) {
    super(`Unknown effect constructor ${effect} in algebra ${algebra}`);
    this.algebra = algebra;
    this.effect = effect;
  }
}

class UnknownHandlerError extends Error {
  constructor(id) {
    super(`No handler defined for effect ${id}`);
    this.id = id;
  }
}

class EmptyHandler {
  maybeGet(_id) {
    return null;
  }

  get handlers() {
    return new Map();
  }
}

class FixedHandler {
  constructor(handlers) {
    this._handlers = handlers;
  }

  maybeGet(id) {
    return this._handlers.get(id);
  }

  get handlers() {
    return this._handlers;
  }

  static fromAlgebra(algebra, cases) {
    const handlers = new Map();

    for (const [key, handler] of Object.entries(cases)) {
      const effect = algebra[key];
      if (!effect) {
        throw new UnknownEffectInAlgebraError(algebra, key);
      }

      const id = effect.prototype["@folktale/effect-id"];
      if (!id) {
        throw new TypeError(
          `${effect} is not a valid effect (missing effect-id)`
        );
      }

      handlers.set(id, handler);
    }

    return new FixedHandler(handlers);
  }
}

class MultiHandler {
  constructor(handlers) {
    this._handlers = handlers;
    this._cache = new Map();
    this._isCacheFilled = false;
  }

  maybeGet(id) {
    const fn = this._cache.get(id);
    if (fn != null) {
      return fn;
    }

    for (const handler of this._handlers) {
      const fn = handler.maybeGet(id);
      if (fn != null) {
        this._cache.set(id, fn);
        return fn;
      }
    }

    return null;
  }

  handlers() {
    this.fillCache();
    return this._cache;
  }

  fillCache() {
    if (this._isCacheFilled) {
      return;
    }

    for (const handler of this._handlers) {
      for (const [k, v] of handler.handlers) {
        if (!this._cache.has(k)) {
          this._cache.set(k, v);
        }
      }
    }

    this._isCacheFilled = true;
  }
}

const handlers = {
  fromAlgebra(algebra, cases) {
    return FixedHandler.fromAlgebra(algebra, cases);
  },

  combine(handlers) {
    return new MultiHandler(handlers);
  },

  get(handler, id) {
    const fn = handler.maybeGet(id);
    if (fn == null) {
      throw new UnknownHandlerError(id);
    } else {
      return fn;
    }
  },
  empty: new EmptyHandler()
};

module.exports = { FixedHandler, MultiHandler, EmptyHandler, handlers };
