const { series, parallel, src, dest, watch } = require('gulp'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      merge2 = require('merge2'),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      cleanDest = require('gulp-clean-dest'),
      jshint = require('gulp-jshint'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      svgmin = require('gulp-svgmin'),
      through2 = require('through2'),
      log = require('fancy-log'),
      beeper = require('beeper'),
      minimist = require('minimist')(process.argv.slice(2));

const config = {
  project: 'application',
  srcPath: 'src/',
  publicPath: 'static/',
  forProduction: minimist.prod
}

let location = {
  compiled: {
    css: config.publicPath + 'css/',
    js: config.publicPath + 'js'
  },
  sources: {
    jsVendors: [
      // note: no .min versions, will be minified by the task
      'node_modules/jquery/dist/jquery.js'
    ],
    jsApplication: config.srcPath + 'js/**/*.js',
    css: [
      config.srcPath + 'sass/application.s*ss'
    ],
    frameworks: [
      'node_modules/bootstrap/scss'
    ]
  }
}

function css() {
  return src(location.sources.css)
    .pipe(config.forProduction ? through2.obj() : sourcemaps.init())
    .pipe(config.forProduction ? sass({ includePaths: location.sources.frameworks, outputStyle: 'compressed' }).on('error', handleError) : sass({ includePaths: location.sources.frameworks }).on('error', handleError))
    .pipe(autoprefixer())
  .pipe(concat(config.project + '.css'))
  .pipe(cleanDest(location.compiled.css))
  .pipe(config.forProduction ? through2.obj() : sourcemaps.write('maps'))
  .pipe(dest(location.compiled.css));
}

function js() {
  return merge2(
      src(location.sources.jsVendors, { allowEmpty: true }),
      src(location.sources.jsApplication)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'), { beep: true })
        .pipe(babel({
          "presets": [["@babel/preset-env"]]
        }))
    )
    .pipe(concat(config.project + '.js'))
    .pipe(config.forProduction ? uglify() : through2.obj())
    .pipe(cleanDest(location.compiled.js))
    .pipe(dest(location.compiled.js));
}

function svg() {
  return src(config.srcPath + 'svg/**/*.svg')
    .pipe(svgmin({
      plugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(cleanDest(config.publicPath + 'svg'))
    .pipe(dest(config.publicPath + 'svg'));
}

exports.default = parallel(css, js, svg);

exports.watch = series(parallel(css, js, svg), w);

exports.svgmin = svg;

function w() {
  watch(config.srcPath + 'sass/**/*.s*ss', css);
  watch(config.srcPath + 'js/**/*.js', js);
  watch(config.srcPath + 'svg/**/*.svg', svg);
}

function handleError(err) {
  beeper(2);
  log.error('\n\n' + '  |   Error: ' + err.messageOriginal + ' /// line: ' + err.line + '/' + err.column + '\n' + '  |   In file: ' + err.file + '\n');
  this.emit('end');
}
