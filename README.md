# recruiter_epiq_deps [![CircleCI](https://dl.circleci.com/status-badge/img/gh/jobiqo/recruiter_epiq_deps/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/jobiqo/recruiter_epiq_deps/tree/master)

Npm dependencies for the epiq theme

## How it works

To use the recruiter epiq dependencies npm package simply register it as a dependency in your package.json (inside your hteme).

```
"devDependencies": {
    "recruiter_epiq_deps": "^5.0.0"
  },
```

This will expose a number of commands that you can then register in your scripts. it currently supporst the following scripts

```
"scripts": {
    "build": "recruiter-epiq-deps build",
    "images": "recruiter-epiq-deps images",
    "styleguide": "recruiter-epiq-deps styleguide",
    "critical-css": "recruiter-epiq-deps critical",
  }
```

Each command needs to be run using recruiter-epiq-deps, this will link to the binary in this repository where each task has a specific js file inside scripts folder that is responsible for running that gulp task (or other tasks that are not gulp specific).

## Dependencies

This package bundles all the dependencies using bundledDependencies, this make for _npm install_ to run faster and insure that there are no side effects when running npm install since dependencies will only be changed when we explicitly update them here.

## Publishing a new version

For a new version to be available you have to manually run :

`npm publish ./` and this will publish a new version of the package. Make sure to update package.json with the version you want to publish.
You might have to first login to npm with `npm login` in order to publish the version. Only authorized users can publish new versions.
