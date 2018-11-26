const { Time, Random } = require("../../source/standard");

const fixedTime = date =>
  Time.makeHandler({
    Now(_, k) {
      k(null, date);
    }
  });

const fixedRandom = number => {
  if (number < 0 || number >= 1) {
    throw new Error(`Random number must be in the range [0, 1)`);
  }

  return Random.makeHandler({
    Random(_, k) {
      k(null, number);
    }
  });
};

module.exports = { fixedTime, fixedRandom };
