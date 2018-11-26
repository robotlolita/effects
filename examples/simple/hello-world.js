const { io } = require("../../source/node");
const { run, runCapturing, runMain } = require("../utils");

function* main() {
  yield io.writeLine("Hello, world");
}

runMain(async function() {
  console.log("\n== Default IO");
  await run({}, main);

  console.log("\n== Captured IO");
  await runCapturing({}, main);
});
