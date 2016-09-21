# Include gulp
require('es6-promise').polyfill()
gulp = require 'gulp'

# Parse command-line arguments.
args = require('yargs').argv

# Load the plugins that we are going to use.

# Check if we are compiling for production.
isProduction = args.production is false

# Get the epiq theme dir from the build script
util = require ('gulp-util')
epiq_path = util.env.epiq_dir

# Source path patterns.
paths =
  sass: ['../../src/sass/**/*.scss']
  images: ['../../src/images/**/*']
  docs: 'docs'
  styleguide:
    docs: '../../styleguide/docs'
    sass: epiq_path + '/styleguide/sass/*.scss'
    source: epiq_path + '/styleguide'
    template: epiq_path + '/styleguide/epiq-kss/'

# Convert .scss to .css (including live reload) using
# LibSass.
gulp.task 'sass', ['images'], ->
  sass = require 'gulp-sass'
  prefix = require 'gulp-autoprefixer'
  util = require 'gulp-util'

  # Compile the .scss and catch (and log) any potential errors so the pipe does
  # not break.
  gulp.src(paths.sass)
  .pipe(sass().on('error', sass.logError))
  .pipe(prefix())
  .pipe(gulp.dest('../../dist/css'));

# Optimize images.
gulp.task 'images', ->
  changed = require 'gulp-changed'
  imagemin = require 'gulp-imagemin'
  stream = gulp.src(paths.images)
  .pipe(changed '../../dist/images')
  .pipe(imagemin())
  .pipe(gulp.dest '../../dist/images')

  # The 'styles' task might depend on this task to be finished. Returning the
  # stream causes the tasks to run synchronously.
  return stream

gulp.task 'livereload', ->
  livereload = require 'gulp-livereload'
  livereload.changed()
  return

# Watch files for changes.
gulp.task 'watch', ->
  livereload = require 'gulp-livereload'
  livereload.listen()

  gulp.watch paths.sass, ['sass', 'livereload']
  gulp.watch paths.images, ['images', 'livereload']

# Build task.
gulp.task 'build', [
  'images'
  'sass'
]

# complile styleguide CSS (required for styleguide-kss)
shell = require('gulp-shell');
sass = require('gulp-sass');

gulp.task 'compile-styleguide', ->
  util = require 'gulp-util'
  gulp.src('../../styleguide/sass/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('../../styleguide/docs/css'))

# Generates the styleguide using kss-node.
gulp.task('styleguide-kss', ['compile-styleguide'], shell.task([
    'kss-node <%= source %> <%= destination %> --template <%= template %> --css <%= cssfile %>'
  ], {
    templateData: {
      source: paths.styleguide.source,
      destination: '../../styleguide/docs',
      template: paths.styleguide.template,
      cssfile: 'css/styles.css'
    }
  }
));

# Default task (build, then watch).
gulp.task 'default', [
  'build'
  'watch'
]

# Task for cleaning up the 'dist' directory.
gulp.task 'clean', ->
  rimraf = require 'gulp-rimraf'
  gulp.src(['dist'], read: false)
  .pipe(rimraf())

# Full build task (build, compile styleguide and compile critical css).
gulp.task 'full-build', [
  'build'
  'styleguide-kss'
  'critical-css'
]

gulp.task 'minify-css', ->
  cssmin = require('gulp-cssmin')
  rename = require('gulp-rename')
  gulp.src('../../dist/css/*.css').pipe(cssmin()).pipe(rename(
    suffix: '.min')).pipe gulp.dest('../../dist/css/min')
  return

gulp.task 'critical-front', (cb) ->
  # URLs for criticalCSS
  util = require ('gulp-util')

  gulpconfig = require(util.env.gulpconfig);
  urls =
    site: gulpconfig.urls.site
    css: gulpconfig.urls.css
    theme_folder: gulpconfig.urls.theme_folder
  jobs_force_selectors = gulpconfig.jobs.force_include
  front_force_selectors = gulpconfig.front.force_include

  request = require('request')
  replace = require('gulp-replace-path')
  path = require('path')
  criticalcss = require('criticalcss')
  fs = require('fs')
  tmpDir = require('os').tmpdir()
  siteUrl = if util.env.site then util.env.site else urls.site
  cssUrl = if util.env.csspath then util.env.csspath else (siteUrl + urls.css)
  cssPath = path.join(tmpDir, 'style.css')
  includePath = path.join(__dirname, '../../dist/css/critical-front.css')
  request(cssUrl).pipe(fs.createWriteStream(cssPath)).on 'close', ->
    criticalcss.getRules cssPath, {buffer: 2000 * 1024}, (err, output) ->
      if err
        throw new Error(err)
      else
        criticalcss.findCritical (siteUrl), {
          ignoreConsole: true,
          rules: JSON.parse(output),
          buffer: 2000 * 1024,
          forceInclude: front_force_selectors
        }, (err, output) ->
          if err
            throw new Error(err)
          else
            fs.writeFile includePath, output, (err) ->
              gulp.src([includePath])
              .pipe(replace('../images', urls.theme_folder + "dist/images"))
              .pipe gulp.dest('../../dist/css')
            return
        return
    return

gulp.task 'critical', ->
  # URLs for criticalCSS
  util = require ('gulp-util')

  gulpconfig = require(util.env.gulpconfig);
  urls =
    site: gulpconfig.urls.site
    css: gulpconfig.urls.css
    theme_folder: gulpconfig.urls.theme_folder
  jobs_force_selectors = gulpconfig.jobs.force_include
  front_force_selectors = gulpconfig.front.force_include

  request = require('request')
  path = require('path')
  criticalcss = require('criticalcss')
  fs = require('fs')
  tmpDir = require('os').tmpdir()
  siteUrl = if util.env.site then util.env.site else urls.site
  cssUrl = if util.env.csspath then util.env.csspath else (siteUrl + urls.css)
  cssPath = path.join(tmpDir, 'style.css')
  includePath = path.join(__dirname, '../../dist/css/critical.css')
  request(cssUrl).pipe(fs.createWriteStream(cssPath)).on 'close', ->
    criticalcss.getRules cssPath, {buffer: 2000 * 1024}, (err, output) ->
      if err
        throw new Error(err)
      else
        criticalcss.findCritical (if util.env.site then util.env.site + "/jobs" else siteUrl + "/jobs"), {
          ignoreConsole: true,
          rules: JSON.parse(output),
          buffer: 2000 * 1024,
          forceInclude: jobs_force_selectors
        }, (err, output) ->
          if err
            throw new Error(err)
          else
            fs.writeFile includePath, output, (err) ->
              if err
                throw new Error(err)
              console.log 'Critical for jobs written to include!'
      return

# criticalCSS compilation task. Opens as PhantomJs browser and compiles CSS for the above the fold
# Arguments can be passed to the command as such :
# gulp critical-css --csspath https://demo_en-joao.dev1.epiqo.com/ --site https://demo_en-joao.dev1.epiqo.com/
gulp.task 'critical-css', [
  'critical-front'
  'critical'
  'minify-css'
]