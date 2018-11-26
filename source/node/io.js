const { effect } = require("../effect");
const readline = require("readline");

const IO = effect("@node:IO", {
  Write: ["stream", "text"],
  Read: []
});

class IOStream {}
class Stdout extends IOStream {}
class Stderr extends IOStream {}

const streams = {
  output: new Stdout(),
  error: new Stderr()
};

class UnknownStreamError extends Error {
  constructor(stream) {
    super(`Unknown stream ${stream}`);
    this.stream = stream;
  }
}

class SignalInterrupt extends Error {}

const defaultIO = IO.makeHandler({
  Write({ stream, text }, k) {
    if (stream === streams.output) {
      process.stdout.write(text);
      k(null, null);
    } else if (stream === streams.error) {
      process.stderr.write(text);
      k(null, null);
    } else {
      k(new UnknownStreamError(stream), null);
    }
  },

  Read(_, k) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.once("line", text => {
      k(null, text);
      rl.close();
    });

    rl.once("SIGINT", () => {
      k(new SignalInterrupt(), null);
      rl.close();
    });
  }
});

IO.setDefaultHandler(defaultIO);

const io = {
  write(text) {
    return new IO.Write(streams.output, text);
  },

  writeLine(text) {
    return this.write(text + "\n");
  },

  writeError(text) {
    return new IO.Write(streams.error, text);
  },

  writeErrorLine(text) {
    return this.writeError(text + "\n");
  },

  read() {
    return new IO.Read();
  }
};

module.exports = {
  IO,
  defaultIO,
  streams,
  io,
  SignalInterrupt,
  UnknownStreamError
};
