const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const opn = require('opn')

const port = 8030

module.exports = {
  mode: 'development',
  entry: {
    'toPolylines.test': [
      `webpack-dev-server/client?http://localhost:${port}`,
      'webpack/hot/dev-server',
      path.resolve(__dirname, 'toPolylines.test.js')
    ],
    'toSVG.test': [
      `webpack-dev-server/client?http://localhost:${port}`,
      'webpack/hot/dev-server',
      path.resolve(__dirname, 'toSVG.test.js')
    ],
    'toBezier.test': [
      `webpack-dev-server/client?http://localhost:${port}`,
      'webpack/hot/dev-server',
      path.resolve(__dirname, 'toBezier.test.js')
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    port,
    after: (app, server) => {
      opn(`http://localhost:${port}`)
    }
  },
  resolve: {
    modules: [path.resolve('..', '..', 'node_modules'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/react', '@babel/env']
            }
          }
        ],
        include: [
          fs.realpathSync(path.resolve(__dirname)),
          fs.realpathSync(path.resolve(__dirname, '..', '..', 'src'))
        ]
      },
      {
        test: /\.dxf$/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      }
    ]
  }
}
