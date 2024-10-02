import { src, dest } from 'gulp'
import { deleteSync } from 'del'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)
// import gulpPurgeCSS from 'gulp-purgecss'
import tailwindcss from 'tailwindcss'
import concat from 'gulp-concat'
import GulpPostCss from 'gulp-postcss'
import sourcemaps from 'gulp-sourcemaps'

import { isProduction, location, config } from './globals.mjs'
import { handleError } from './handleError.mjs'

export const css = async () => {
  const sassConfig = {
    includePaths: location.sources,
    outputStyle: isProduction ? 'compressed' : 'expanded',
  }

  deleteSync(`${location.output.css}/**`)

  const task = src(location.input.css, { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(sass(sassConfig).on('error', handleError))
    .pipe(GulpPostCss([tailwindcss(config.tailwind)]))
    .pipe(concat('app.css'))
    .pipe(sourcemaps.write('maps'))

  task.pipe(dest(location.output.css))

  return task
}
