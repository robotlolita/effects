const { run } = require("../../source");
const { io } = require("../../source/node");
const { capturingIO, runCapturing, runMain } = require("../utils");

function* main() {
  yield io.writeLine("Hello, world");
}

runMain(async function() {
  console.log("== Default IO");
  await run({}, main);

  console.log("== Captured IO");
  runCapturing({}, main);
});
