module.exports = {
  entry: {
    'entities.test': "./test/functional/src/entities.test.js",
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ],
  },
  output: {
    path: 'test/functional/lib/',
    filename: "[name].bundle.js"
  },
  devtool: "#source-map",
  node: {
    net: 'empty',
    dns: 'empty',
  }
};
