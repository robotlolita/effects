const { io } = require("../../source/node");
const { time } = require("../../source/standard");
const { fixedTime, runCapturing, runMain, run } = require("../utils");

function* main() {
  const now = yield time.now();

  if (now.getHours() < 12) {
    yield io.writeLine(`Good morning`);
  } else if (now.getHours() < 18) {
    yield io.writeLine(`Good afternoon`);
  } else {
    yield io.writeLine(`Good evening`);
  }
}

runMain(async function() {
  console.log(`\n== Default IO/Time`);
  await run({}, main);

  console.log(`\n== Captured IO, Morning Time`);
  await runCapturing({ ...fixedTime(new Date(2018, 1, 1, 8)) }, main);

  console.log(`\n== Captured IO, Afternoon Time`);
  await runCapturing({ ...fixedTime(new Date(2018, 1, 1, 14)) }, main);

  console.log(`\n== Captured IO, Evening Time`);
  await runCapturing({ ...fixedTime(new Date(2018, 1, 1, 19)) }, main);
});
