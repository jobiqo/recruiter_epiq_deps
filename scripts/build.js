import { exec } from 'node:child_process';
import chalk from 'chalk';
var epiq_dir = '../../../../../../profiles/recruiter/themes/epiq';
var cmd = 'cd node_modules/recruiter_epiq_deps && gulp build';

console.log('Running build script - ' + chalk.yellow('gulp build'));
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
