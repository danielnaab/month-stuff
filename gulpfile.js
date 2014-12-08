'use strict';

var _ = require('lodash'),
    argv = require('yargs').argv,
    browserify = require('browserify'),
    cache = require('gulp-cache'),
    connect = require('gulp-connect'),
    envify = require('envify/custom'),
    es6Browserify = require('es6-browserify'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    minifycss = require('gulp-minify-css'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    watchify = require('watchify')

var server = require('./server/app.js')


/**
 * The environment may be set in one of these manners:
 * - gulp --env=[development | test | production]
 * - export NODE_ENV=[development | test | production]
 */
var ENVIRONMENT = argv.env || process.env.NODE_ENV || 'development'


/**
 * Debug mode may be set in one of these manners:
 * - gulp --debug=[true | false]
 * - export NODE_DEBUG=[true | false]
 * Will default to true if running in the development environment.
 */
var USER_DEBUG = argv.debug || process.env.NODE_DEBUG
var DEBUG = USER_DEBUG === undefined ? ENVIRONMENT === 'development' : USER_DEBUG === 'true'


function scripts(watch, debug) {
    var args
    if (watch) {
        args = _.clone(watchify.args)
    }
    else {
        args = {}
    }
    args.debug = debug

    var bundler = browserify('./client/scripts/main.js', args)
        .transform(es6Browserify)
        .transform(envify({NODE_ENV: ENVIRONMENT}))

    if (watch) {
        bundler = watchify(bundler)
    }

    function rebundle() {
        gutil.log('Bundling... ')

        return bundler.bundle()
            // log errors if they happen
            .on('error', function (e) {
                gutil.log('Browserify Error', e)
            })
            .pipe(source('main.js'))
            .pipe(gulpif(!debug, streamify(uglify())))
            .pipe(gulp.dest('./dist/scripts'))
            .pipe(connect.reload())
    }

    bundler.on('update', rebundle)
    return rebundle()
}


gulp.task('cleanscripts', function () {
    return gulp.src(['dist/scripts'], {read: false})
        .pipe(rimraf())
})


gulp.task('clean', function () {
    return gulp.src(['dist'], {read: false})
        .pipe(rimraf())
})


gulp.task('server', function () {
    connect.server({
        root: ['dist'],
        port: 9000,
        livereload: true
    })
    server(8080, DEBUG)
})


gulp.task('cleanhtml', function () {
    return gulp.src(['dist/*.html'], {read: false})
        .pipe(rimraf())
})


gulp.task('html', ['cleanhtml'], function () {
    return gulp.src('./client/*.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'))
        .pipe(size())
        .pipe(connect.reload())
})


gulp.task('cleanimages', function () {
    return gulp.src(['dist/img'], {read: false})
        .pipe(rimraf())
})


gulp.task('images', ['cleanimages'], function () {
    return gulp.src(['./client/images/**'])
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img'))
        .pipe(size())
        .pipe(connect.reload())
})


function styles(debug) {
    return gulp.src('./client/styles/app.scss')
        .pipe(sass())
        .pipe(gulpif(!debug, minifycss()))
        .pipe(gulp.dest('./dist/styles'))
        .pipe(size())
        .pipe(connect.reload())
}


gulp.task('styles', function () {
    return styles(DEBUG)
})


gulp.task('dist', ['clean'], function () {
    styles(DEBUG)
    return scripts(DEBUG, DEBUG)
})


gulp.task('watch', ['cleanscripts', 'html', 'images', 'styles', 'server'], function () {
    gulp.watch('./client/**/*.html', ['html'])
    gulp.watch('./client/styles/**/*.scss', ['styles'])
    gulp.watch('./client/image/**/', ['images'])

    styles(DEBUG)
    return scripts(DEBUG, DEBUG)
})
