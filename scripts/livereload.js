var spawn = require('child_process').spawn,
  chalk = require('chalk');

var options = {cwd: 'node_modules/recruiter_epiq_deps'};

console.log('Running livereload script - ' + chalk.yellow('gulp livereload'));

var livereload = spawn('gulp', ['livereload', 'default'], options);

livereload.stdout.on('data', function (data) {
  console.log(chalk.green(data));
});

livereload.stderr.on('data', function (data) {
  console.log(chalk.red(data));
});

livereload.on('close', function (data) {
  console.log(chalk.white(data));
});

livereload.on('error', function (err) {
  console.log(chalk.red(err));
});
