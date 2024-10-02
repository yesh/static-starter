import { src, dest } from 'gulp'
import { deleteAsync } from 'del'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import DotenvWebpackPlugin from 'dotenv-webpack'
import path from 'path'

import { isProduction, location } from './globals.mjs'

const webpackConfig = {
  mode: isProduction ? 'production' : 'development',
  output: {
    filename: 'app.js',
  },
  resolve: {
    modules: ['src/js', 'node_modules'],
  },
  optimization: {
    minimize: isProduction,
    minimizer: [new TerserPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },

  plugins: [
    // new DotenvWebpackPlugin({
    //   path: path.join(__dirname, `../.env`),
    //   safe: true,
    // }),
  ],
}

export const js = async () => {
  await deleteAsync(`${location.output.js}/**`)

  const task = src(location.input.js, { allowEmpty: true })
  task
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(dest(location.output.js))

  return task
}
