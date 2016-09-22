# recruiter_epiq_deps [![Build Status][ci-img]][ci]
Npm dependencies for the epiq theme 

## How it works

To use the recruiter epiq dependencies npm package simply register it as a dependency in your package.json (inside your hteme).

```
"devDependencies": {
    "recruiter_epiq_deps": "^0.0.14"
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

This package bundles all the dependencies using bundledDependencies, this make for *npm install* to run faster and insure that there are no side effects when running npm install since dependencies will only be changed when we explicitly update them here.

[ci-img]:  https://travis-ci.org/epiqo/recruiter_epiq_deps.svg
[ci]:      https://travis-ci.org/epiqo/recruiter_epiq_deps
