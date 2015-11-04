/* eslint-env node */
/* eslint strict: 0, no-console: 0, complexity: [1, 5] */


/* Project directory structure
 *
 * barebones
 * |- bower_components          [vendor]   libraries (via Bower)
 * |- node_modules              [node]     node packages (via npm)
 * |- dist                      [project]  compiled files, misc files (html, ico, png, xml, txt)
 * |  |- fonts                  [fonts]    compressed (eot, svg, ttf, woff)
 * |  |- images                 [images]   compressed (jpg, png) and sprites (png)
 * |  |- scripts                [scripts]  combined and minified (min.js)
 * |  |  '- vendor              [scripts]  vendor libraries (min.js)
 * |  '- styles                 [styles]   prefixed and minifed (min.css)
 * '- src                       [project]  source files (html)
 *    |- fonts                  [fonts]    source (eot, otf, ttf, svg, woff, woff2)
 *    |- images                 [images]   source (jpg, png, svg)
 *    |- misc                   [misc]     misc files (ico, png, xml, txt)
 *    |- partials               [partials] source (html)
 *    |- scripts                [scripts]  source (js)
 *    |- sprites                [images]   sprite components (png)
 *    |  '- icon                [example]  [images] sprite components (png)
 *    '- styles                 [styles]   uncompiled source (scss)
 *
 */


// Basic stuff we need
// ===================
var exec       = require('child_process').exec,
    del        = require('del'),
    config     = require('./barebones.json'),
    connect    = require('gulp-connect'),
    portfinder = require('portfinder'),
    gulp       = require('gulp');


// Gulp plugins
// ============
var filter         = require('gulp-filter'),
    plumber        = require('gulp-plumber'),
    gulpSequence   = require('gulp-sequence'),
    gulpif         = require('gulp-if'),
    notify         = require("gulp-notify"),

    lazypipe       = require('lazypipe'),

    imagemin       = require('gulp-imagemin'),
    fileinclude    = require('gulp-file-include'),

    sourcemaps     = require('gulp-sourcemaps'),

    sass           = require('gulp-sass'),
    postcss        = require('gulp-postcss'),
    autoprefixer   = require('autoprefixer'),
    sprites        = require('postcss-sprites'),
    mqpacker       = require('css-mqpacker'),
    postcssEasings = require('postcss-easings'),
    csso           = require('gulp-csso'),

    useref         = require('gulp-useref'),
    uglify         = require('gulp-uglify');

/* Unused plugins:
 *
 * postcssSVG = require('postcss-svg'),
 * rename = require('gulp-rename'),
 * concat = require('gulp-concat'),
 * newer = require('gulp-newer'),
 * spritesmith = require('gulp.spritesmith'),
 * merge = require('merge-stream'),
 * csswring = require('csswring'),
 * checkCSS = require('gulp-check-unused-css');
 */


// Helper functions
// ================

/*
 * Handle error
 *
 * Outputs internal error via gulp-notify
 */
var handleError = function (errorObject) {
    notify.onError(errorObject.toString()).apply(this, arguments);

    // Keep gulp from hanging on this task
    if (typeof this.emit === 'function') this.emit('end');
};

var getFormats = function (type, def) {
    var _def = def || [];

    var formats = config && config.formats && config.formats[type]
                ? config.formats[type]
                : _def;

    if (typeof formats == 'string') return [formats];
    if (formats && formats.join) return formats;

    return _def;
};

var formatGlob = function (type, def) {
    var exts = getFormats(type);

    if (exts.length === 1) return exts[0];
    if (exts.length > 1) return '{' + exts.join(',') + '}';

    return def || '*';
};

// http://stackoverflow.com/a/3561711
var regexEscape = function (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

var formatRegex = function (type, def) {
    var exts = getFormats(type);

    if (exts.length === 1) return regexEscape(exts[0]);
    if (exts.length > 1) return '(?:' + exts.map(regexEscape).join('|') + ')';

    return def || '[a-z0-9]{2,5}';
};

var gulpSource = function (path) {
    var stream = gulp.src(config.path.source + path);

    // Handle errors
    return stream.pipe(plumber({
        errorHandler: handleError
    }));
};

var gulpWatch = function (path, callback) {
    return gulp.watch(config.path.source + path, callback);
};


// Task variables
// ==============
var buildPath = config.path.development;


// Gulp tasks
// ==========

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

/* Font task
 *
 * Copies font files over to dest dir
 */
gulp.task('font', function () {
    gulpSource(config.path.font.src + '/**/*.' + formatGlob('font', '{eot,ttf,svg,woff}'))

        .pipe(gulp.dest(buildPath + config.path.font.dest))
        .pipe(connect.reload());
});

/* Html task
 *
 * Copies html files over to dest dir
 */
gulp.task('html', function () {
    var scripts = filter("**/*." + formatGlob('script', 'js')),
        assets  = useref.assets({},
            lazypipe().pipe(sourcemaps.init, {loadMaps: true})
        );

    gulpSource('*.' + formatGlob('document', 'html'))

        // Include partials
        .pipe(fileinclude({
            prefix: config.partials.prefix,
            suffix: config.partials.suffix,
            basepath: config.path.source + config.path.html.partials + '/',
            context: config.partials.context
        }))

        // Include all available assets
        .pipe(assets)

        // Concatenate and minify javascripts
        .pipe(scripts)
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
        .pipe(sourcemaps.write())
        .pipe(scripts.restore())

        // Restore html stream and write concatenated js file names
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(buildPath))
        .pipe(connect.reload());
});

/* Image task
 *
 * Copies compressed and optimized images over to dest dir
 */
gulp.task('image', function () {
    gulpSource(config.path.image.src + '/**/*.' + formatGlob('image', '{jpg,png}'))

        .pipe(gulpif(process.env.NODE_ENV === 'production', imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(buildPath + config.path.image.dest))
        .pipe(connect.reload());
});

/* Script task
 *
 * Concatenates and uglifies scripts
 */
gulp.task('script', ['html']);

/* Style task
 *
 * Compiles scss files to css dest dir
 */
gulp.task('style', function () {
    var processors = [];

    // Init processors
    processors.push(autoprefixer({
        browsers: ['last 2 version']
    }));

    if (process.env.NODE_ENV === 'production') {
        processors.push(mqpacker);
    }

    processors.push(
        postcssEasings,
        sprites({
            stylesheetPath: buildPath + config.path.style.dest,
            spritePath: buildPath + config.path.image.dest + '/' + config.sprite.name,
            retina: config.sprite.retina,
            outputDimensions: true,
            engine: 'pixelsmith',
            filterBy: function (image) {
                var pattern = '^..\/'
                            + regexEscape(config.path.sprite.src)
                            + '\/[a-z0-9\-_]+\.'
                            + formatRegex('sprite', 'png')
                            + '$';

                var regex = new RegExp(pattern, 'gi');

                return regex.test(image.url);
            },
            verbose: true
        })

        // postcssSVG({
        //     paths: [config.path.source + config.path.icon.src]
        // })
    );

    gulpSource(config.path.style.src + '/*.' + formatGlob('style', 'scss'))

        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(gulpif(process.env.NODE_ENV === 'production', csso()))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(buildPath + config.path.style.dest))
        .pipe(connect.reload());
});

/* Misc task
 *
 * Copies misc files misc dest dir
 */
gulp.task('misc', function () {
    var files = config.path.misc.files,
        src   = config.path.source + config.path.misc.src,
        dest  = buildPath;

    // Iterate through files from the list
    // We need this because apparently there is a maximum number of files
    for (var i = 0, l = files.length; i < l; i++) {
        // Copy files
        gulp.src(files[i], {cwd: src})

            // Handle errors
            .pipe(plumber({
                errorHandler: handleError
            }))

            .pipe(gulp.dest(dest));
    }
});

/* Watch task
 *
 * Enters watch mode, automatically recompiling assets on source changes
 */
gulp.task('watch', function () {
    gulpWatch('*.' + formatGlob('document', 'html'), function () {
        gulp.start('html');
    });

    gulpWatch(config.path.html.partials + '/**/*.' + formatGlob('partial', 'partial.html'), function () {
        gulp.start('html');
    });

    gulpWatch(config.path.font.src + '/**/*.' + formatGlob('font', '{eot,otf,svg,ttf,woff}'), function () {
        gulp.start('font');
    });

    gulpWatch(config.path.script.src + '/**/*.' + formatGlob('script', 'js'), function () {
        gulp.start('script');
    });

    gulpWatch(config.path.sprite.src + '**/*.' + formatGlob('sprite', 'png'), function () {
        gulp.start('style');
    });

    gulpWatch(config.path.style.src + '/**/*.' + formatGlob('style', 'scss'), function () {
        gulp.start('style');
    });

    gulpWatch(config.path.image.src + '/**/*.' + formatGlob('image', '{jpg,png,svg}'), function () {
        gulp.start('image');
    });
});

/* Clean:font task
 *
 * Removes font dest folder
 */
gulp.task('clean:font', function (cb) {
    del(buildPath + config.path.font.dest, cb);
});

/* Clean:html task
 *
 * Removes html files from dest folder
 */
gulp.task('clean:html', function (cb) {
    del(buildPath + '*.html', cb);
});

/* Clean:image task
 *
 * Removes image dest folder
 */
gulp.task('clean:image', function (cb) {
    del(buildPath + config.path.image.dest, cb);
});

/* Clean:script
 *
 * Clears script dest folder, except vendor subfolder
 */
gulp.task('clean:script', function (cb) {
    del(buildPath + config.path.script.dest, cb);
});

/* Clean:style task
 *
 * Removes style dest folder
 */
gulp.task('clean:style', function (cb) {
    del(buildPath + config.path.style.dest, cb);
});

/* Clean:misc task
 *
 * Removes misc files from dest folder
 */
gulp.task('clean:misc', function (cb) {
    // Clean all files and folders from the list
    del(config.path.misc.files, {
        read: false,
        cwd: buildPath + config.path.misc.dest
    }, cb);
});

/* Clean task
 *
 * Removes html dest folder
 */
gulp.task('clean', [
    'clean:font',
    'clean:html',
    'clean:image',
    'clean:script',
    'clean:style',
    'clean:misc'
]);

/* Build task
 *
 * Compiles all files. Uglify depends on flag (production or development)
 */
gulp.task('build:dev', function (cb) {
    process.env.NODE_ENV = 'development';
    buildPath = config.path.development;
    gulpSequence('clean', ['font', 'html', 'image', 'misc', 'style'], cb);
});

gulp.task('build', function (cb) {
    process.env.NODE_ENV = 'production';
    buildPath = config.path.production;
    gulpSequence('clean', ['font', 'html', 'image', 'misc', 'style'], cb);
});

/* Default task
 *
 * Compiles all files. Uglify depends on flag (production or development)
 */
gulp.task('default', ['build:dev']);

/* Init task
 *
 * Loads and installs required vendor libraries via bower
 */
gulp.task('init', [
    'bower'
]);

/* Connect task
 *
 * Creates a web server with an index of all html files within html dest dir
 */
gulp.task('connect', function () {
    portfinder.basePort = config.server.port;

    portfinder.getPort(function (err, port) {
        connect.server({
            root: buildPath,
            livereload: false,
            port: port
        });
    });
});

/**
 * Connect task with livereload
 *
 * Creates a web server with an index of all html files within html dest dir
 * and automatic page reloading support
 */
gulp.task('connect:live', function () {
    portfinder.basePort = config.server.port;

    portfinder.getPort(function (err, port) {
        connect.server({
            root: buildPath,
            livereload: true,
            port: port
        });
    });
});

/* Server task
 *
 * Creates a web server and starts watching for any changes within src dir
 */
gulp.task('server', [
    'connect',
    'watch'
]);

/* Server task with livereload
 *
 * Creates a web server and starts watching for any changes within src dir
 * and automatically reloading any opened pages on recompile
 */
gulp.task('server:live', [
    'connect:live',
    'watch'
]);


// Unused gulp tasks
// =================

/* Lint:style task
 *
 * Checks html files for unused css classes and vice versa
 */
// gulp.task('lint:style', /*['html', 'style'],*/ function () {
//     // Check unused css classes
//     gulp.src([config.path.style.dest + '/*.css', config.path.html.dest + '/*.html'])

//         // Handle errors
//         .pipe(plumber({
//             errorHandler: function (error) {
//                 console.log(error.message);
//                 this.emit('end');
//             }
//         }))

//         .pipe(checkCSS({
//             ignore: ['clearfix', /^col-/, /^icon-?/]
//         }));
// });


/* Lint task
 *
 * Uses all available linters
 */
// gulp.task('lint', [
//     'lint:style'
// ]);
