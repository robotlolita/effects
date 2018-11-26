const { IO, streams } = require("../../source/node");

class StdinEmptyError extends Error {
  constructor() {
    super(`Can't read from an empty input array`);
  }
}

const capturingIO = (stdout, stderr, stdin) => {
  return IO.makeHandler({
    Write({ stream, text }, k) {
      if (stream === streams.output) {
        stdout.push(text);
        k(null, null);
      } else if (stream === streams.error) {
        stderr.push(text);
        k(null, null);
      } else {
        k(new UnknownStreamError(stream), null);
      }
    },

    Read(_, k) {
      if (stdin.length === 0) {
        k(new StdinEmptyError(), null);
      } else {
        const text = stdin.shift();
        k(null, text);
      }
    }
  });
};

module.exports = { capturingIO, StdinEmptyError };
