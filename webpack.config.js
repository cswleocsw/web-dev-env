var path = require('path');
var webpack = require('webpack');

var config = {
  context: path.resolve(__dirname, 'src/js'),

  cache: true,

  entry: {
    app: 'index.js',
    vendor: ['lodash']
  },

  output: {
    path: path.resolve('./build/js'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ],
    noParse: [/\.min\.js/]
  },

  resolve: {
    root: [path.join(__dirname, 'src/js')],
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js'],
    alias: []
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
  ]
};

module.exports = config;
