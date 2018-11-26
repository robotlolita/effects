const { io } = require("../../source/node");
const { random } = require("../../source/standard");
const { fixedRandom, run, runCapturing, runMain } = require("../utils");

function* main() {
  yield io.writeLine("Guess the number!");
  const secret_number = Math.floor(1 + 100 * (yield random.random()));

  while (true) {
    const guess = Number(yield io.read());
    if (isNaN(guess)) {
      yield io.writeLine("Please enter a valid number.");
    } else {
      yield io.writeLine(`You guessed ${guess}`);

      if (guess < secret_number) {
        yield io.writeLine("Too small!");
      } else if (guess > secret_number) {
        yield io.writeLine("Too big!");
      } else {
        yield io.writeLine("You win!");
        break;
      }
    }
  }
}

runMain(async function() {
  console.log("\n== Default IO/Random");
  await run({}, main);

  console.log("\n== Captured IO/Fixed Random");
  await runCapturing({ ...fixedRandom(0.5) }, main, [
    "10",
    "60",
    "30",
    "50",
    "51"
  ]);
});
