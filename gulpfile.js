var args, epiq_path, gulp, isProduction, paths, sass, shell, util;

require('es6-promise').polyfill();
gulp = require('gulp');
args = require('yargs').argv;
isProduction = args.production === false;
util = require('gulp-util');

epiq_path = util.env.epiq_dir;

paths = {
  sass: ['../../src/sass/**/*.scss'],
  images: ['../../src/images/**/*'],
  docs: 'docs',
  styleguide: {
    docs: '../../styleguide/docs',
    sass: epiq_path + '/styleguide/sass/*.scss',
    source: epiq_path + '/styleguide',
    template: epiq_path + '/styleguide/epiq-kss/'
  }
};

gulp.task('sass', ['images'], function () {
  var prefix, sass;
  sass = require('gulp-sass');
  prefix = require('gulp-autoprefixer');
  util = require('gulp-util');
  return gulp.src(paths.sass).pipe(sass().on('error', sass.logError)).pipe(prefix()).pipe(gulp.dest('../../dist/css'));
});

gulp.task('images', function () {
  var changed, imagemin, stream;
  changed = require('gulp-changed');
  imagemin = require('gulp-imagemin');
  stream = gulp.src(paths.images).pipe(changed('../../dist/images')).pipe(imagemin()).pipe(gulp.dest('../../dist/images'));
  return stream;
});

gulp.task('livereload', function () {
  var livereload;
  livereload = require('gulp-livereload');
  livereload.changed();
});

gulp.task('watch', function () {
  var livereload;
  livereload = require('gulp-livereload');
  livereload.listen();
  gulp.watch(paths.sass, ['sass', 'livereload']);
  return gulp.watch(paths.images, ['images', 'livereload']);
});

gulp.task('build', ['images', 'sass']);

shell = require('gulp-shell');

sass = require('gulp-sass');

gulp.task('compile-styleguide', function () {
  util = require('gulp-util');
  return gulp.src('../../styleguide/sass/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest('../../styleguide/docs/css'));
});

gulp.task('styleguide-kss', ['compile-styleguide'], shell.task(['kss-node <%= source %> <%= destination %> --template <%= template %> --css <%= cssfile %>'], {
  templateData: {
    source: paths.styleguide.source,
    destination: '../../styleguide/docs',
    template: paths.styleguide.template,
    cssfile: 'css/styles.css'
  }
}));

gulp.task('default', ['build', 'watch']);

gulp.task('clean', function () {
  var rimraf;
  rimraf = require('gulp-rimraf');
  return gulp.src(['dist'], {
    read: false
  }).pipe(rimraf());
});

gulp.task('full-build', ['build', 'styleguide-kss', 'critical-css']);

gulp.task('minify-css', function () {
  var cssmin, rename;
  cssmin = require('gulp-cssmin');
  rename = require('gulp-rename');
  gulp.src('../../dist/css/*.css').pipe(cssmin()).pipe(rename({
    suffix: '.min'
  })).pipe(gulp.dest('../../dist/css/min'));
});

gulp.task('critical-front', function (cb) {
  var criticalcss, cssPath, cssUrl, front_force_selectors, fs, gulpconfig, includePath, jobs_force_selectors, path, replace, request, siteUrl, tmpDir, urls;
  util = require('gulp-util');
  gulpconfig = require(util.env.gulpconfig);
  urls = {
    site: gulpconfig.urls.site,
    css: gulpconfig.urls.css,
    theme_folder: gulpconfig.urls.theme_folder
  };
  jobs_force_selectors = gulpconfig.jobs.force_include;
  front_force_selectors = gulpconfig.front.force_include;
  request = require('request');
  replace = require('gulp-replace-path');
  path = require('path');
  criticalcss = require('criticalcss');
  fs = require('fs');
  tmpDir = require('os').tmpdir();
  siteUrl = util.env.site ? util.env.site : urls.site;
  cssUrl = util.env.csspath ? util.env.csspath : siteUrl + urls.css;
  cssPath = path.join(tmpDir, 'style.css');
  includePath = path.join(__dirname, '../../dist/css/critical-front.css');
  return request(cssUrl).pipe(fs.createWriteStream(cssPath)).on('close', function () {
    criticalcss.getRules(cssPath, {
      buffer: 2000 * 1024
    }, function (err, output) {
      if (err) {
        throw new Error(err);
      } else {
        criticalcss.findCritical(siteUrl, {
          ignoreConsole: true,
          rules: JSON.parse(output),
          buffer: 2000 * 1024,
          forceInclude: front_force_selectors
        }, function (err, output) {
          if (err) {
            throw new Error(err);
          } else {
            fs.writeFile(includePath, output, function (err) {
              return gulp.src([includePath]).pipe(replace('../images', urls.theme_folder + "dist/images")).pipe(gulp.dest('../../dist/css'));
            });
          }
        });
      }
    });
  });
});

gulp.task('critical-front', function (cb) {
  var critical = require('critical'),
    path = require('path'),
    util = require('gulp-util'),
    gulpconfig = require(util.env.gulpconfig),
    urls = {
      site: gulpconfig.urls.site,
      css: gulpconfig.urls.css,
      css_file: gulpconfig.urls.css_file,
      theme_folder: gulpconfig.urls.theme_folder
    },
    front_force_selectors = gulpconfig.front.force_include,
    siteUrl = util.env.site ? util.env.site : urls.site,
    includePath = path.join(__dirname, '../../dist/css/min/critical-front.min.css');
  critical.generate({
    base: '../../dist',
    src: siteUrl,
    css: '../../dist/css/' + urls.css_file,
    dest: includePath,
    minify: true,
    width: 2000,
    height: 1024,
    include:jobs_force_selectors,
  });
});

gulp.task('critical', function (cb) {
  var critical = require('critical'),
    path = require('path'),
    util = require('gulp-util'),
    gulpconfig = require(util.env.gulpconfig),
    urls = {
      site: gulpconfig.urls.site + '/jobs',
      css: gulpconfig.urls.css,
      css_file: gulpconfig.urls.css_file,
      theme_folder: gulpconfig.urls.theme_folder,
    },
    jobs_force_selectors = gulpconfig.jobs.force_include,
    siteUrl = util.env.site ? util.env.site : urls.site,
    includePath = path.join(__dirname, '../../dist/css/min/critical.min.css');
  critical.generate({
    base: '../../dist',
    src: siteUrl,
    css: '../../dist/css/' + urls.css_file,
    dest: includePath,
    minify: true,
    width: 2000,
    height: 1024,
    include: jobs_force_selectors
  });
});

gulp.task('critical-css', ['critical','critical-front']);