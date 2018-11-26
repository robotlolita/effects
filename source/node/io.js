const { effect } = require("../effect");
const readline = require("readline");

class UnknownStreamError extends Error {
  constructor(stream) {
    super(`Unknown stream ${stream}`);
    this.stream = stream;
  }
}

class SignalInterrupt extends Error {}

class IOStream {}
class Stdout extends IOStream {}
class Stderr extends IOStream {}

const streams = {
  output: new Stdout(),
  error: new Stderr()
};

const IO = effect(
  "@node:IO",
  {
    Write: ["stream", "text"],
    Read: []
  },
  {
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
        rl.close();
        k(null, text);
      });

      rl.once("SIGINT", () => {
        rl.close();
        k(new SignalInterrupt(), null);
      });

      rl.prompt();
    }
  }
);

const io = {
  write(text) {
    return IO.Write(streams.output, text);
  },

  writeLine(text) {
    return this.write(text + "\n");
  },

  writeError(text) {
    return IO.Write(streams.error, text);
  },

  writeErrorLine(text) {
    return this.writeError(text + "\n");
  },

  read() {
    return IO.Read();
  }
};

module.exports = {
  IO,
  streams,
  io,
  SignalInterrupt,
  UnknownStreamError
};
