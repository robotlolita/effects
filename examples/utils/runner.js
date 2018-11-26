const {
  run,
  handlers: { combine }
} = require("../../source");
const { capturingIO } = require("./capture-io");

async function runCapturing(handlers, effects, stdin = []) {
  const stderr = [];
  const stdout = [];
  await run(combine([capturingIO(stdout, stderr, stdin), handlers]), effects);
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
