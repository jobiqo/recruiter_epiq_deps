var args, epiq_path, gulp, path, paths, sass, util;

require("es6-promise").polyfill();
gulp = require("gulp");
args = require("yargs").argv;
isProduction = args.production === false;
util = require("gulp-util");
path = require("path");
epiq_path = util.env.epiq_dir;

paths = {
  sass: ["../../src/sass/**/*.scss"],
  images: ["../../src/images/**/*"],
  docs: "docs",
  styleguide: {
    docs: "../../styleguide/docs",
    sass: path.resolve(`${epiq_path}/styleguide/sass/*.scss`),
    source: path.resolve(`${epiq_path}/styleguide`),
    template: path.resolve(`${epiq_path}/styleguide/epiq-kss/`)
  },
  svg: [`${epiq_path}/src/icons/*.svg`, "../../src/icons/*.svg"]
};

gulp.task("images", function() {
  var changed, imagemin, stream;
  changed = require("gulp-changed");
  imagemin = require("gulp-imagemin");
  stream = gulp
    .src(paths.images)
    .pipe(changed("../../dist/images"))
    .pipe(imagemin())
    .pipe(gulp.dest("../../dist/images"));
  return stream;
});

gulp.task("sass", function() {
  var prefix, sass;
  sass = require("gulp-sass");
  prefix = require("gulp-autoprefixer");
  util = require("gulp-util");
  return gulp
    .src(paths.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(prefix())
    .pipe(gulp.dest("../../dist/css"));
});

gulp.task("lint-css", function() {
  const gulpStylelint = require("gulp-stylelint");

  return gulp.src(paths.sass).pipe(
    gulpStylelint({
      reporters: [{ formatter: "string", console: true }]
    })
  );
});

gulp.task("svg-icons", function() {
  const svgMin = require("gulp-svgmin");
  const svgSprite = require("gulp-svg-sprite");

  return gulp
    .src(paths.svg)
    .pipe(svgMin())
    .pipe(
      svgSprite({
        mode: {
          defs: {
            sprite: "icons.svg"
          }
        }
      })
    )
    .pipe(gulp.dest("../../dist/icons"));
});

gulp.task("livereload", function() {
  var livereload;
  livereload = require("gulp-livereload");
  livereload.changed();
});

gulp.task("watch", function() {
  var livereload;
  livereload = require("gulp-livereload");
  livereload.listen();
  gulp.watch(paths.sass, gulp.series("sass", "livereload"));
  return gulp.watch(paths.images, gulp.series("images", "livereload"));
});

gulp.task("build", gulp.series("images", "sass", "svg-icons"));

sass = require("gulp-sass");

gulp.task("compile-styleguide", function() {
  util = require("gulp-util");
  return gulp
    .src("../../styleguide/sass/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("../../styleguide/docs/css"));
});

gulp.task("kss", function() {
  var kss = require("kss");
  console.log(paths.styleguide.source);
  return kss({
    source: paths.styleguide.source,
    destination: paths.styleguide.destination,
    // builder: config.server.styleguide.template,
    // homepage: config.server.styleguide.homepage,
    css: "css/styles.css"
  });
});

gulp.task("styleguide-kss", gulp.series("compile-styleguide", "kss"));

gulp.task("default", gulp.parallel("build", "watch"));

gulp.task("clean", function() {
  var rimraf;
  rimraf = require("gulp-rimraf");
  return gulp
    .src(["dist"], {
      read: false
    })
    .pipe(rimraf());
});

gulp.task("minify-css", function() {
  var cssmin, rename;
  cssmin = require("gulp-cssmin");
  rename = require("gulp-rename");
  gulp
    .src("../../dist/css/*.css")
    .pipe(cssmin())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("../../dist/css/min"));
});

gulp.task("critical-front", function(cb) {
  var critical = require("critical"),
    path = require("path"),
    coreGulpConfig = require(util.env.epiq_dir + "/gulpconfig.json"),
    gulpconfig = require(util.env.gulpconfig),
    urls = {
      site: util.env.site,
      css_file: gulpconfig.css_file
    },
    generic_force_selectors = coreGulpConfig.generic.force_include.concat(
      gulpconfig.generic.force_include
    ),
    front_force_selectors = coreGulpConfig.front.force_include.concat(
      gulpconfig.front.force_include
    ),
    includePath = path.join(
      __dirname,
      "../../dist/css/min/critical-front.min.css"
    );
  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    dest: includePath,
    minify: true,
    width: 2000,
    height: 1024,
    timeout: 120000,
    include: generic_force_selectors.concat(front_force_selectors)
  });
});

gulp.task("critical", function(cb) {
  var critical = require("critical"),
    path = require("path"),
    coreGulpConfig = require(util.env.epiq_dir + "/gulpconfig.json"),
    gulpconfig = require(util.env.gulpconfig),
    urls = {
      site: util.env.site + "/jobs",
      css_file: gulpconfig.css_file
    },
    generic_force_selectors = coreGulpConfig.generic.force_include.concat(
      gulpconfig.generic.force_include
    ),
    jobs_force_selectors = coreGulpConfig.jobs.force_include.concat(
      gulpconfig.jobs.force_include
    ),
    includePath = path.join(__dirname, "../../dist/css/min/critical.min.css");
  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    dest: includePath,
    minify: true,
    width: 2000,
    height: 1024,
    timeout: 120000,
    include: generic_force_selectors.concat(jobs_force_selectors)
  });
});

gulp.task("critical-job", function(cb) {
  var critical = require("critical"),
    path = require("path"),
    coreGulpConfig = require(util.env.epiq_dir + "/gulpconfig.json"),
    gulpconfig = require(util.env.gulpconfig),
    urls = {
      site: util.env.site + "/critical-css/job-per-template",
      css_file: gulpconfig.css_file
    },
    generic_force_selectors = coreGulpConfig.generic.force_include.concat(
      gulpconfig.generic.force_include
    ),
    jobs_force_selectors = coreGulpConfig.job.force_include.concat(
      gulpconfig.job.force_include
    ),
    includePath = path.join(
      __dirname,
      "../../dist/css/min/critical-job.min.css"
    );
  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    dest: includePath,
    minify: true,
    width: 2000,
    height: 1024,
    timeout: 120000,
    include: generic_force_selectors.concat(jobs_force_selectors)
  });
});

gulp.task(
  "critical-fix-fonts",
  gulp.series(
    gulp.parallel("critical", "critical-front", "critical-job"),
    function(cb) {
      var replace = require("gulp-replace"),
        path = require("path"),
        gulpconfig = require(util.env.gulpconfig);
      return gulp
        .src([
          path.join(__dirname, "../../dist/css/min/critical.min.css"),
          path.join(__dirname, "../../dist/css/min/critical-front.min.css"),
          path.join(__dirname, "../../dist/css/min/critical-job.min.css")
        ])
        .pipe(
          replace(
            "../../fonts",
            "/" + gulpconfig.theme_directory + "/dist/fonts"
          )
        )
        .pipe(gulp.dest(path.join(__dirname, "../../dist/css/min")));
    }
  )
);

gulp.task("critical-css", gulp.series("critical-fix-fonts"));

gulp.task("full-build", gulp.series("build", "styleguide-kss", "critical-css"));
