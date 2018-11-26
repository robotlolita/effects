const { run } = require("../../source");
const { capturingIO } = require("./capture-io");

async function runCapturing(handlers, effects) {
  const stdin = [];
  const stderr = [];
  const stdout = [];
  await run({ ...handlers, ...capturingIO(stdout, stderr, stdin) }, effects);
  console.log("stdout ->", stdout);
  console.log("stderr ->", stderr);
  console.log("stdin ->", stdin);

  return { stdin, stderr, stdout };
}

async function runMain(program) {
  try {
    await program();
  } catch (error) {
    console.error(`Program failed:`, error.stack ? error.stack : error);
  }
}

module.exports = { runCapturing, runMain, run };
