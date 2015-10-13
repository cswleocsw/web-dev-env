var gulp = require('gulp');
var compass = require('gulp-compass');
var gutil = require('gulp-util');
var path = require('path');
var bs = require('browser-sync').create();
var spa = require('browser-sync-spa');
var rimraf = require('rimraf');
var jade = require('gulp-jade');
var webpack = require('webpack');
var assign = require('object-assign');
var sequence = require('run-sequence');
var ghPages = require('gh-pages');
var git = require('git-rev-sync');
var _ = require('lodash');
var autoprefixer = require('gulp-autoprefixer');

// config
var compassConfig = require('./compass.config');
var webpackConfig = require('./webpack.config');

function getSuffixName(str) {
  var m = str.match(/\.([^\.]{1,})$/);
  return m ? m[1] : '';
}

gulp.task('default', function() {
  sequence('copy', 'jade', 'compass', 'webpack', 'server', 'watch');
});

gulp.task('watch', function() {
  gulp.watch('src/**', function(vinyl) {
    gutil.log(gutil.colors.green('[Info]'), 'File ' + vinyl.path + ' was ' + vinyl.type + ', running tasks...');
    switch (getSuffixName(vinyl.path)) {
      case 'jade':
        gulp.start('jade');
        break;
      case 'sass':
      case 'scss':
        gulp.start('compass');
        break;
      case 'js':
        gulp.start('webpack');
        break;
    }
  });
});

gulp.task('clean', function() {
  rimraf('./build', function() {
    gutil.log(gutil.colors.green('[Info]'), 'Remove build files...');
  });
});

gulp.task('jade', function() {
  gulp.src('src/**/*.jade')
    .pipe(jade())
    .on('error', function(error) {
      gutil.log(gutil.colors.red('[Error]'), error.message);
    })
    .pipe(gulp.dest('build'))
});

gulp.task('copy', function() {
  var folders = {
    'src/img/**/*': 'build/img',
    'src/font/**/*': 'build/font'
  };
  _.each(folders, function(dest, src) {
    gulp.src(src).pipe(gulp.dest(dest));
  });
});

gulp.task('compass', function() {
  gulp.src('src/css/**/*.+(sass|scss)')
    .pipe(compass(compassConfig))
    .on('error', function(error) {
      gutil.log(gutil.colors.red('[Error]'), error);
      this.emit('end');
    })
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(compassConfig.css));
});

gulp.task('server', function() {
  bs.use(spa());
  bs.init({
    port: 4000,
    server: {
      baseDir: 'build',
    },
    files: [
      'build/**/*'
    ],
    open: false,
    logConnections: true
  });
});

gulp.task('webpack', function() {
  var config = assign({}, webpackConfig);
  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]);
  webpack(config, function(error, stats) {
    if (error) {
      gutil.log(gutil.colors.red('[webpack]'), error);
    }
    gutil.log(gutil.colors.blue('[webpack]'), gutil.colors.green(stats.toString()));
  });
});

gulp.task('build', function() {
  sequence('copy', 'jade', 'build:compass', 'build:webpack');
});

gulp.task('build:compass', function() {
  var config = assign({}, compassConfig, {
    style: 'compressed',
    comments: false
  });
  gulp.src('src/css/**/*.+(sass|scss)')
    .pipe(compass(config))
    .on('error', function(error) {
      gutil.log(gutil.colors.red('[Error]'), error);
      this.emit('end');
    })
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(compassConfig.css));
});

gulp.task('build:webpack', function() {
  var config = assign({}, webpackConfig);
  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ]);
  webpack(config, function(error, stats) {
    if (error) {
      gutil.log(gutil.colors.red('[webpack]'), error);
    }
    gutil.log(gutil.colors.blue('[webpack]'), gutil.colors.green(stats.toString()));
  });
});

gulp.task('release', function() {
  ghPages.publish(path.resolve('build'), {
    branch: 'release',
    message: git.short() + ' - Update ' + (new Date()).toISOString(),
    logger: function(message) {
      console.log(message)
    }
  });
});