const { io } = require("../../source/node");
const { handlers, effect } = require("../../source");
const { run, runMain, capturingIO } = require("../utils");

function* main() {
  for (let i = 0; i < 2 ** 20; ++i) {
    yield io.writeLine("text");
  }
}

runMain(async function() {
  console.log("\n== should run without blowing the stack");
  const stdin = [];
  const stdout = [];
  const stderr = [];
  await run(capturingIO(stdout, stderr, stdin), main);
  console.log(`Ran ${stdout.length} synchronous effects`);
});
