const { series, parallel, src, dest, watch, start } = require('gulp'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      merge2 = require('merge2'),
      minify = require('gulp-minify-html'),
      tidify = require('gulp-htmltidy'),
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
  publicPath: 'static/',
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
      // example: 'node_modules/jquery/dist/jquery.js'
      'node_modules/jquery/dist/jquery.slim.js'
    ],
    jsApplication: config.srcPath + 'js/**/*.js',
    css: [
      // example: 'node_modules/flickity/dist/flickity.css'
      config.srcPath + 'sass/application.s*ss'
    ],
    frameworks: [
      // example: 'node_modules/bootstrap/scss'
    ]
  }
}

function css() {
  return src(location.sources.css, { sourcemaps: !config.isProduction })
    .pipe(config.isProduction ? sass({ includePaths: location.sources.frameworks, outputStyle: 'compressed' }).on('error', handleError) : sass().on('error', handleError))
    .pipe(autoprefixer())
    .pipe(cleanDest(location.compiled.css))
    .pipe(dest(location.compiled.css, { sourcemaps: !config.isProduction }));
}

function js() {
  return merge2(
      src(location.sources.jsVendors, { allowEmpty: true }),
      src(location.sources.jsApplication)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'), { beep: true })
        .pipe(babel({ presets: ['env'] }))
    )
    .pipe(concat(config.project + '.js'))
    .pipe(config.isProduction ? uglify() : through2.obj())
    .pipe(cleanDest(location.compiled.js))
    .pipe(dest(location.compiled.js));
}

function tidifyHtml() {
  return src(config.htmlPath + '**/*.html')
    .pipe(tidify({
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
    .pipe(minify())
    .pipe(dest(config.htmlPath));
}

exports.default = parallel(css, js);

exports.tidifyHtml = tidifyHtml;

exports.minifyHtml = minifyHtml;

function handleError(err) {
  beeper(2);
  log.error('\n\n' + '  |   Error: ' + err.messageOriginal + ' /// line: ' + err.line + '/' + err.column + '\n' + '  |   In file: ' + err.file + '\n');
  this.emit('end');
}

watch(config.srcPath + 'sass/**/*.s*ss', css);
watch(config.srcPath + 'js/**/*.js', js);
