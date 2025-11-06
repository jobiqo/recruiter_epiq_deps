import es6Promise from "es6-promise";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import gulp from "gulp";
import path from "path";
import { fileURLToPath } from "url";
es6Promise.polyfill();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = yargs(hideBin(process.argv)).argv;
const isProduction = argv.production === false;
const epiq_path = "../../../../../../profiles/recruiter/themes/epiq";
const gulpConfigDefault = "../../gulpconfig.json";

const paths = {
  sass: ["../../src/sass/**/*.scss"],
  images: ["../../src/images/**/*.{png,jpg,jpeg,svg}"],
  livereload: ["../../dist/**/*"],
  docs: "docs",
  styleguide: {
    docs: "../../styleguide/docs",
    sass: path.resolve(`${epiq_path}/styleguide/sass/*.scss`),
    source: path.resolve(`${epiq_path}/styleguide`),
    destination: "../../styleguide/docs",
  },
  svg: [`${epiq_path}/src/icons/*.svg`, "../../src/icons/*.svg"],
};

async function _red_LoadCritical() {
  const critical = await import("critical");
  return critical;
}

import changed from "gulp-changed";
import imagemin from "gulp-imagemin";

gulp.task("images", function () {
  const stream = gulp
    .src(paths.images)
    .pipe(changed("../../dist/images"))
    .pipe(imagemin())
    .pipe(gulp.dest("../../dist/images"));
  return stream;
});

import gulpSass from "gulp-sass";
import * as sassCompiler from "sass";
const sass = gulpSass(sassCompiler);
import autoprefixer from "gulp-autoprefixer";

gulp.task("sass", function () {
  return gulp
    .src(paths.sass)
    .pipe(
      sass({
        quietDeps: true,
        silenceDeprecations: [
          "legacy-js-api",
          "import",
          "slash-div",
          "global-builtin",
          "color-functions",
        ],
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest("../../dist/css"));
});

import gulpStylelint from "gulp-stylelint-esm";

gulp.task("lint-css", function () {
  return gulp.src(paths.sass).pipe(
    gulpStylelint({
      reporters: [{ formatter: "string", console: true }],
    })
  );
});

import svgMin from "gulp-svgmin";
import svgSprite from "gulp-svg-sprite";
import fs from "fs";
import { Readable } from "stream";

// Helper function to check if directory exists.
function directoryExists(path) {
  try {
    path = path.replace(/\/\*\.svg$/, '');
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
}

// Helper function to return an empty stream.
function emptyStream() {
  const stream = new Readable({ objectMode: true });
  stream._read = () => {
    // Immediately signals end of stream
    stream.push(null);
  };
  return stream;
}

gulp.task("svg-icons", function () {
  // Filter olny existing directories from the svg icons directories.
  const svgDirs = paths.svg.filter(directoryExists);

  // If none of the directories exist, return empty stream to skip task.
  if (svgDirs.length === 0) {
    return emptyStream();
  }

  return gulp
    .src(svgDirs)
    .pipe(svgMin())
    .pipe(
      svgSprite({
        mode: {
          defs: {
            sprite: "icons.svg",
          },
        },
      })
    )
    .pipe(gulp.dest("../../dist/icons"));
});

import livereload from "gulp-livereload";

gulp.task("livereload", function () {
  livereload.listen();
  gulp.watch(paths.livereload).on("all", function (event, path, stats) {
    livereload.changed(path);
  });
});

gulp.task("watch", function () {
  gulp.watch(paths.sass, gulp.series("sass"));
  return gulp.watch(paths.images, gulp.series("images"));
});

gulp.task("build", gulp.series("images", "sass", "svg-icons"));

gulp.task("compile-styleguide", function () {
  return gulp
    .src("../../styleguide/sass/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("../../styleguide/docs/css"));
});

import kss from "kss";

gulp.task("kss", function () {
  return kss({
    source: paths.styleguide.source,
    destination: paths.styleguide.destination,
    css: "css/styles.css",
  });
});

gulp.task("styleguide-kss", gulp.series("compile-styleguide", "kss"));

gulp.task("default", gulp.parallel("build", "watch"));

import rimraf from "gulp-rimraf";

gulp.task("clean", function () {
  return gulp.src(["dist"], { read: false }).pipe(rimraf());
});

import cleanCSS from "gulp-clean-css";
import rename from "gulp-rename";

gulp.task("minify-css", function () {
  return gulp
    .src("../../dist/css/*.css")
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("../../dist/css/min"));
});

gulp.task("critical-front", async function () {
  const critical = await _red_LoadCritical();

  const coreGulpConfig = await import(`${epiq_path}/gulpconfig.json`, {
    assert: { type: "json" },
  });
  const gulpconfig = await import(`${gulpConfigDefault}`, {
    assert: { type: "json" },
  });

  const urls = {
    site: gulpconfig.site,
    css_file: gulpconfig.css_file,
  };

  const generic_force_selectors = coreGulpConfig.generic.force_include.concat(
    gulpconfig.generic.force_include
  );
  const front_force_selectors = coreGulpConfig.front.force_include.concat(
    gulpconfig.front.force_include
  );

  const includePath = path.join(
    __dirname,
    "../../dist/css/min/critical-front.min.css"
  );

  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    target: includePath,
    width: 2000,
    height: 1024,
    include: generic_force_selectors.concat(front_force_selectors),
  });
});

gulp.task("critical", async function () {
  const critical = await _red_LoadCritical();
  const coreGulpConfig = await import(`${epiq_path}/gulpconfig.json`, {
    assert: { type: "json" },
  });
  const gulpconfig = await import(`${gulpConfigDefault}`, {
    assert: { type: "json" },
  });

  const urls = {
    site: gulpconfig.site + "/jobs",
    css_file: gulpconfig.css_file,
  };

  const generic_force_selectors = coreGulpConfig.generic.force_include.concat(
    gulpconfig.generic.force_include
  );
  const jobs_force_selectors = coreGulpConfig.jobs.force_include.concat(
    gulpconfig.jobs.force_include
  );

  const includePath = path.join(__dirname, "../../dist/css/min/critical.min.css");

  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    target: includePath,
    width: 2000,
    height: 1024,
    include: generic_force_selectors.concat(jobs_force_selectors),
  });
});

gulp.task("critical-job", async function () {
  const critical = await _red_LoadCritical();
  const coreGulpConfig = await import(`${epiq_path}/gulpconfig.json`, {
    assert: { type: "json" },
  });
  const gulpconfig = await import(`${gulpConfigDefault}`, {
    assert: { type: "json" },
  });

  const urls = {
    site: gulpconfig.site + "/critical-css/job-per-template",
    css_file: gulpconfig.css_file,
  };

  const generic_force_selectors = coreGulpConfig.generic.force_include.concat(
    gulpconfig.generic.force_include
  );
  const jobs_force_selectors = coreGulpConfig.job.force_include.concat(
    gulpconfig.job.force_include
  );

  const includePath = path.join(
    __dirname,
    "../../dist/css/min/critical-job.min.css"
  );

  return critical.generate({
    base: "../../dist",
    src: urls.site,
    css: "../../dist/css/" + urls.css_file,
    target: includePath,
    width: 2000,
    height: 1024,
    include: generic_force_selectors.concat(jobs_force_selectors),
  });
});

import replace from "gulp-replace";

gulp.task(
  "critical-fix-fonts",
  gulp.series(
    gulp.parallel("critical", "critical-front", "critical-job"),
    function () {
      const gulpconfigPromise = import(`${gulpConfigDefault}`, {
        assert: { type: "json" },
      });
      return gulpconfigPromise.then((gulpconfig) => {
        return gulp
          .src([
            path.join(__dirname, "../../dist/css/min/critical.min.css"),
            path.join(__dirname, "../../dist/css/min/critical-front.min.css"),
            path.join(__dirname, "../../dist/css/min/critical-job.min.css"),
          ])
          .pipe(
            replace(
              "../../fonts",
              "/" + gulpconfig.theme_directory + "/dist/fonts"
            )
          )
          .pipe(gulp.dest(path.join(__dirname, "../../dist/css/min")));
      });
    }
  )
);

gulp.task("critical-css", gulp.series("critical-fix-fonts"));

gulp.task("full-build", gulp.series("build", "styleguide-kss", "critical-css"));
