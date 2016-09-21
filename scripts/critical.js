var exec = require('child_process').exec,
    epiq_dir = '../../../../../../profiles/recruiter/themes/epiq',
    gulpconfig = '../../gulpconfig.json',
    args = "";

var yargs = require('yargs').argv;
if (yargs.site) {
    args = '--site' + yargs.site;
}
if (yargs.csspath) {
    args = '--csspath' + yargs.csspath;
}

var cmd = 'cd node_modules/recruiter_epiq_deps && gulp critical-css --epiq_dir ' + epiq_dir + ' --gulpconfig ' + gulpconfig + ' ' + args;

exec(cmd, function (error, stdout, stderr) {
    // command output is in stdout
    console.log(stdout);
});