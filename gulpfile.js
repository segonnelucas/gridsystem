const { watch, src, dest, series, parallel } = require("gulp");

/* Utils */
const browserSync = require("browser-sync").create();
const notify = require("gulp-notify");

/* Sass & Opti css */
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const lint = require("gulp-stylelint");

/* Conf globale */
const config = {
  paths: {
    input: {
      scss: "./www/assets/sass/**/*.scss",
      html: "./www/*.html",
    },
    output: {
      css: "./www/assets/static/css/",
    },
  },
  filename: {
    output: {
      css: "./styles.css",
    },
  },
  sassOptions: {
    errLogToConsole: true,
    outputStyle: "expanded",
  },
  autoprefixerOptions: {
    overrideBrowserslist: ["last 2 version", "> 1%", "ie 11"],
  },
};

/* Tasks pour le CSS */
function doCss() {
  return src(config.paths.input.scss, { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(sass(config.sassOptions))
    .on("error", notify.onError())
    .pipe(autoprefixer(config.autoprefixerOptions))
    .pipe(rename(config.filename.output.css))
    .pipe(dest(config.paths.output.css, { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function lintCss() {
  return src(config.paths.input.scss).pipe(
    lint({
      failAfterError: false,
      reporters: [{ formatter: "string", console: true }],
    })
  );
}

/* Init des différents Watcher */
function serve() {
  browserSync.init({ server: "./www" });
  watch(config.paths.input.scss, parallel(doCss, lintCss));
  watch(config.paths.input.html).on("change", browserSync.reload);
}

module.exports = {
  default: series(parallel(doCss), serve),
  sass: series(doCss),
};
