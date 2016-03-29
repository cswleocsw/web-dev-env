var path = require('path');
var webpack = require('webpack');
var webpackCfg = require('./webpack.config');

var cfg = Object.assign({}, webpackCfg);

cfg.devtool = 'source-map';

cfg.plugins = cfg.plugins.concat(
  [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    new webpack.optimize.OccurenceOrderPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
);

module.exports = cfg;
