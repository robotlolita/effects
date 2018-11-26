const { Time } = require("../../source/standard");

const fixedTime = date =>
  Time.makeHandler({
    Now(_, k) {
      k(null, date);
    }
  });

module.exports = { fixedTime };
