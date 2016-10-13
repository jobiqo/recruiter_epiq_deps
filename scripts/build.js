var exec = require('child_process').exec,
  chalk = require('chalk'),
  epiq_dir = '../../../../../../profiles/recruiter/themes/epiq';

var cmd = 'cd node_modules/recruiter_epiq_deps && gulp build --epiq_dir ' + epiq_dir;

console.log('Running build script - ' + chalk.yellow('gulp build'));
exec(cmd, function (error, stdout, stderr) {
  // command output is in stdout
  if (!error) {
    console.log(chalk.green(stdout));
  }
  else {
    console.log(chalk.white(stdout));
    console.log(chalk.red(error));
  }
  console.log(chalk.red(stderr));
});