import { exec } from 'node:child_process';
import chalk from 'chalk';
var args = "";

if (process.env.user && process.env.pass) {
  args += " --user " + process.env.user;
  args += " --pass " + process.env.pass;
}

var cmd = "cd node_modules/recruiter_epiq_deps && gulp critical-css" + args;

console.log("Compiling critical css - " + chalk.yellow("gulp critical-css"));
exec(cmd, function (error, stdout, stderr) {
  // command output is in stdout
  if (!error) {
    console.log(chalk.green(stdout));
  } else {
    console.log(chalk.white(stdout));
    console.log(chalk.red(error));
  }
  console.log(chalk.red(stderr));
});
