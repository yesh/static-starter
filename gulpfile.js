const { series, parallel, src, dest, watch, start } = require('gulp'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      merge2 = require('merge2'),
      htmlmin = require('gulp-htmlmin'),
      htmltidy = require('gulp-htmltidy'),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      cleanDest = require('gulp-clean-dest'),
      jshint = require('gulp-jshint'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      through2 = require('through2'),
      log = require('fancy-log'),
      beeper = require('beeper'),
      minimist = require('minimist')(process.argv.slice(2));

const config = {
  project: 'application',
  srcPath: 'src/',
  publicPath: 'public/',
  htmlPath: 'public/',
  isProduction: minimist.prod
}

let location = {
  compiled: {
    css: config.publicPath + 'css/',
    js: config.publicPath + 'js'
  },
  sources: {
    jsVendors: [
      // note: avoid .min versions
      'node_modules/jquery/dist/jquery.js'
    ],
    jsApplication: config.srcPath + 'js/**/*.js',
    css: [
      config.srcPath + 'sass/application.s*ss'
    ],
    frameworks: [
      // 'node_modules/bootstrap/scss'
    ]
  }
}

function css() {
  return src(location.sources.css)
    .pipe(config.isProduction ? through2.obj() : sourcemaps.init())
    .pipe(config.isProduction ? sass({ includePaths: location.sources.frameworks, outputStyle: 'compressed' }).on('error', handleError) : sass({ includePaths: location.sources.frameworks }).on('error', handleError))
    .pipe(autoprefixer())
  .pipe(concat(config.project + '.css'))
  .pipe(cleanDest(location.compiled.css))
  .pipe(config.isProduction ? through2.obj() : sourcemaps.write('maps'))
  .pipe(dest(location.compiled.css));
}

function js() {
  return merge2(
      src(location.sources.jsVendors, { allowEmpty: true }),
      src(location.sources.jsApplication)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'), { beep: true })
        .pipe(babel({"presets": ["@babel/preset-env"]]}))
    )
    .pipe(concat(config.project + '.js'))
    .pipe(config.isProduction ? uglify() : through2.obj())
    .pipe(cleanDest(location.compiled.js))
    .pipe(dest(location.compiled.js));
}

function tidifyHtml() {
  return src(config.htmlPath + '**/*.html')
    .pipe(htmltidy({
      doctype: 'html5',
      hideComments: false,
      indent: true,
      wrap: 0,
      'indent-spaces': 2,
      'alt-text': 'image',
      'drop-empty-elements': false,
      'drop-empty-paras': false
    }))
    .pipe(dest(config.htmlPath));;
}

function minifyHtml() {
  return src(config.htmlPath + '**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(config.htmlPath));
}

exports.default = parallel(css, js);

exports.tidifyHtml = tidifyHtml;

exports.minifyHtml = minifyHtml;

exports.watch = series(parallel(css, js), w);

function w() {
  watch(config.srcPath + 'sass/**/*.s*ss', css);
  watch(config.srcPath + 'js/**/*.js', js);
}

function handleError(err) {
  beeper(2);
  log.error('\n\n' + '  |   Error: ' + err.messageOriginal + ' /// line: ' + err.line + '/' + err.column + '\n' + '  |   In file: ' + err.file + '\n');
  this.emit('end');
}
