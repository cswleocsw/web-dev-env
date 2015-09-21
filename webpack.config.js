var path = require('path');
var webpack = require('webpack');

module.exports = {
  cache: true,

  entry: {
    app: './src/js/app'
  },

  output: {
    path: path.join(__dirname, 'build/js'),
    publicPath: '',
    filename: 'bundle.js'
  },

  devtool: 'source-map',

  module: {
    loaders: [],
    noParse: [/\.min\.js/]
  },

  resolve: {
    root: [path.join(__dirname, 'build/js')],
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js'],
    alias: []
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
    )
  ]
};
