module.exports = {
  entry: {
    'entities.test': "./src/entities.test.js",
    'ref.test': "./src/ref.test.js",
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
    path: 'lib/',
    filename: "[name].bundle.js"
  },
  devtool: "eval",
  node: {
    net: 'empty',
    dns: 'empty',
  }
};
