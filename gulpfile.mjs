import { series, parallel, watch } from 'gulp'

import { reload, live } from './gulp-task/browserSync.mjs'
import { css } from './gulp-task/css.mjs'
import { js } from './gulp-task/js.mjs'
import { svg } from './gulp-task/svg.mjs'

import { config } from './gulp-task/globals.mjs'

const watchTask = () => {
  watch(
    [
      config.tailwindjs,
      `${config.path.src}/sass/**/*.s*ss`,
      `${config.path.public}/**/*.{html,js,php}`,
    ],
    series(css, reload)
  )
  watch(`${config.path.src}/js/**/*.js`, js)
  watch(`${config.path.src}/svg/**/*.svg`, svg)
}

export const gwatch = series(parallel(css, js, svg), live, watchTask)
export const gdefault = series(parallel(css, js, svg))
