// Basic stuff we need
var exec   = require('child_process').exec,
    config = require('./barebones.json'),
    gulp   = require('gulp');

// Gulp plugins
var compass = require('gulp-compass'),
    uglify  = require('gulp-uglify'),
    rename  = require("gulp-rename");

// Gulp tasks

/* Bower task
 *
 * Installs all bower dependencies
 */
gulp.task('bower', function (cb) {
    // Install bower dependencies
    exec('bower install', function (err, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        cb(err);
    });
});

/* Vendor task
 *
 * Copies all vendor dependencies into their respective locations
 */
gulp.task('vendor', ['vendor:normalize', 'vendor:jquery', 'vendor:modernizr']);

/* Vendor:normalize subtask
 *
 * Copies normalize.scss to style source dir
 */
gulp.task('vendor:normalize', ['bower'], function () {
    gulp.src(config.path.vendor.src + '/normalize-scss/_normalize.scss')
        .pipe(gulp.dest(config.path.style.src + '/base'));
});

/* Vendor:jquery subtask
 *
 * Copies jquery to vendor dest dir
 */
gulp.task('vendor:jquery', ['bower'], function () {
    gulp.src(config.path.vendor.src + '/jquery/dist/jquery.min.js')
        .pipe(rename('jquery-2.1.1.min.js'))
        .pipe(gulp.dest(config.path.vendor.dest));
});

/* Vendor:modernizr subtask
 *
 * Copies modernizr to vendor dest dir
 */
gulp.task('vendor:modernizr', ['bower'], function () {
    gulp.src(config.path.vendor.src + '/modernizr/modernizr.js')
        .pipe(uglify())
        .pipe(rename('modernizr-2.8.2.min.js'))
        .pipe(gulp.dest(config.path.vendor.dest));
});

/* Compass task
 *
 * Compiles main.scss to main.css
 *
 * Does not compress the resulting css
 */
gulp.task('compass', ['vendor:normalize'], function () {
    gulp.src(config.path.style.src + '/main.scss')
        .pipe(compass({
            config_file: 'config.rb',
            css: config.path.style.dest,
            sass: config.path.style.src,
            style: 'expanded'
        }))
        .on('error', function (err) {}) // Error message is output by the plugin
        .pipe(gulp.dest(config.path.style.dest));
});

/* Compass:dist subtask
 *
 * Compiles main.scss to main.css
 *
 * Compresses the resulting css
 */
gulp.task('compass-dist', ['vendor:normalize'], function () {
    gulp.src('./' + config.path.style.src + '/main.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: config.path.style.dest,
            sass: config.path.style.src,
            style: 'compressed'
        }))
        .on('error', function (err) {}) // Error message is output by the plugin
        .pipe(gulp.dest(config.path.style.dest));
});

/* Watch task
 *
 * Enters watch mode, automatically recompiling assets on source changes
 */
gulp.task('watch', function () {
    gulp.watch([config.path.style.src + '/**/*.scss', '!' + config.path.style.src + '/base/_normalize.scss'], ['compass']);
});

/* Default task
 *
 * Compiles dev version (uncompressed css and js)
 */
gulp.task('default', ['bower', 'compass', 'vendor']);

/* Dev task
 *
 * Enters dev mode: compiles all resources and starts watching for changes
 */
gulp.task('dev', ['bower', 'compass', 'vendor', 'watch']);

/* Dist task
 *
 * Compiles all resources for production
 */
gulp.task('dist', ['bower', 'compass-dist', 'vendor']);

// validation
