import path from 'path'
import { fileURLToPath } from 'url'
import { configDotenv } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envVariables = configDotenv({
  path: path.join(__dirname, `../.env`),
  // path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
})

export const isProduction = process.env.NODE_ENV === 'production' ? true : false

export const config = {
  path: {
    src: 'src',
    public: 'app',
    assets: 'app/public',
  },
  tailwindjs: './tailwind.config.js',
}

export const env = envVariables.parsed

export const location = {
  input: {
    js: [`${config.path.src}/js/app.js`],
    css: [`${config.path.src}/sass/app.sass`],
  },
  output: {
    js: `${config.path.assets}/js`,
    css: `${config.path.assets}/css`,
  },
  sources: [],
}
