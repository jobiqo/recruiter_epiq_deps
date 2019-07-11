var exec = require('child_process').exec,
	chalk = require('chalk'),
	args = '',
	yargs = require('yargs').argv;

if (yargs.user && yargs.pass) {
	args += ' --user ' + yargs.user;
	args += ' --pass ' + yargs.pass;
}

var cmd = 'cd node_modules/recruiter_epiq_deps && gulp critical-css' + args;

console.log('Compiling critical css - ' + chalk.yellow('gulp critical-css'));
exec(cmd, function(error, stdout, stderr) {
	// command output is in stdout
	if (!error) {
		console.log(chalk.green(stdout));
	} else {
		console.log(chalk.white(stdout));
		console.log(chalk.red(error));
	}
	console.log(chalk.red(stderr));
});
