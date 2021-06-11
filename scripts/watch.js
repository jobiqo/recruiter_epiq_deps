var spawn = require('child_process').spawn,
  chalk = require('chalk');

var options = {cwd: 'node_modules/recruiter_epiq_deps'};

console.log('Running watch script - ' + chalk.yellow('gulp watch'));

var watch = spawn('gulp', ['watch'], options);

watch.stdout.on('data', function (data) {
  console.log(chalk.green(data));
});

watch.stderr.on('data', function (data) {
  console.log(chalk.red(data));
});

watch.on('close', function (data) {
  console.log(chalk.white(data));
});

watch.on('error', function (err) {
  console.log(chalk.red(err));
});
