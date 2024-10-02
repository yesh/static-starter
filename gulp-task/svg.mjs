import { src, dest } from 'gulp'
import { deleteAsync } from 'del'
import GulpSvgmin from 'gulp-svgmin'

import { config } from './globals.mjs'

export const svg = async () => {
  await deleteAsync(`${config.path.assets}/svg`)

  const task = src(`${config.path.src}/svg/**/*.svg`)
    .pipe(
      GulpSvgmin({
        plugins: [
          {
            removeViewBox: false,
            convertStyleToAttrs: false,
          },
        ],
      })
    )
    .pipe(dest(`${config.path.assets}/svg`))

  return task
}
