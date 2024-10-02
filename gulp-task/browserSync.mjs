import browserSync from 'browser-sync'
import path from 'path'
import { env } from './globals.mjs'

browserSync.create()

export const live = (done) => {
  const projectRoot = process.cwd()
  const publicDir = path.resolve(projectRoot, 'app')
  console.log(publicDir)
  browserSync.init({
    // proxy: env.LOCAL_URL,
    // open: false,
    server: {
      baseDir: publicDir,
    },
  })
  browserSync.emitter.on('init', () => {
    console.log('Resolved baseDir:', browserSync.server)
  })
  done()
}

export const reload = (done) => {
  browserSync.reload()
  done()
}
