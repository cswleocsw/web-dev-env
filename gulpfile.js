var gulp = require('gulp');
var compass = require('gulp-compass');
var gutil = require('gulp-util');
var path = require('path');
var bs = require('browser-sync').create();
var spa = require('browser-sync-spa');
var Imagemin = require('imagemin');
var rimraf = require('rimraf');
var jade = require('gulp-jade');
var webpack = require('webpack');
var assign = require('object-assign');
var sequence = require('run-sequence');
var ghPages = require('gh-pages');
var git = require('git-rev-sync');

// config
var compassConfig = require('./compass.config');
var webpackConfig = require('./webpack.config');


gulp.task('default', function() {
  sequence('image', 'font', 'jade', 'compass', 'webpack', 'server', 'watch');
});

gulp.task('watch', function() {
  gulp.watch('src/**', function(vinyl) {
    console.log('File ' + vinyl.path + ' was ' + vinyl.type + ', running tasks...');
    var m = vinyl.path.match(/\.([^\.]{1,})$/);
    if (m) {
      switch (m[1]) {
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
    .on('error', function (error) {
      gutil.log(gutil.colors.red('[Error]'), error.message);
    })
    .pipe(gulp.dest('build'))
});

gulp.task('image', function() {
  new Imagemin()
    .src('src/img/**/*.{gif,jpg,png,svg}')
    .dest('build/img')
    .run();
});

gulp.task('font', function() {
  return gulp.src(['src/font/**/*'])
    .pipe(gulp.dest('build/font'));
});

gulp.task('compass', function() {
  gulp.src('src/css/**/*.+(sass|scss)')
    .pipe(compass(compassConfig))
    .on('error', function(error) {
      gutil.log(gutil.colors.red('[Error]'), error);
      this.emit('end');
    });
});

gulp.task('server', function() {
  bs.use(spa());
  bs.init({
    port: 4000,
    server: {
      baseDir: 'build',
    },
    files: [
      'build/**'
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
  webpack(config, function(error) {
    if (error) {
      gutil.log(gutil.colors.red('[Error]'), error);
    }
  });
});

gulp.task('build', function() {
  sequence('image', 'font', 'jade', 'build:compass', 'build:webpack');
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
    });
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
  webpack(config, function(error) {
    if (error) {
      gutil.log(gutil.colors.red('[Error]'), error);
    }
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