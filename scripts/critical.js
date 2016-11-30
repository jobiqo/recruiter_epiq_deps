var exec = require('child_process').exec,
  chalk = require('chalk'),
  epiq_dir = '../../../../../../profiles/recruiter/themes/epiq',
  gulpconfig = '../../gulpconfig.json',
  args = "";

var prompt = require('prompt');
prompt.start();

prompt.get(['site'], function (err, result) {
  var site = result.site;
  args = '--site ' + result.site;

  var cmd = 'cd node_modules/recruiter_epiq_deps && gulp critical-css --epiq_dir ' + epiq_dir + ' --gulpconfig ' + gulpconfig + ' ' + args;

  console.log('Compiling critical css - ' + chalk.yellow('gulp critical-css'));
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
});