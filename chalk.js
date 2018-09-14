let chalk = require("chalk")
console.log(chalk.yellow("304"));
process.stdout.write(chalk.yellow("304"))
process.stdout.write(chalk.green("200"))
process.stdin.resume();
process.stdin.on("data", () => { process.exit(0) })
