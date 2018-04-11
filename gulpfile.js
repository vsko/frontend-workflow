'use strict';

var pkg = require('./package'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    rigger = require('gulp-rigger'),
    sass = require('gulp-sass'),
    cssbeautify = require('gulp-cssbeautify'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    cached = require('gulp-cached'),
    remember = require('gulp-remember'),
    ftp = require('vinyl-ftp'),
    mainBowerFiles = require('main-bower-files'),
    browserSync = require("browser-sync");

var path = {
    src: {
        html: 'app/**/*.html',
        css: 'app/css/**/*.css',
        sass: 'app/sass/**/*.sass',
        js: 'app/js/**/*.js',
        images: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    build: {
        root: 'build/',
        styles: 'build/css/',
        scripts: 'build/js/',
        images: 'build/images/',
        fonts: 'build/fonts/',
        match: 'build/**/*.*'
    },
    ignore: {
        html: '!app/templates/*.html'
    },
    clean: 'build/*'
};

var setting = {
    webserver: {
        host: 'localhost',
        server: path.build.root,
        port: 9000,
        tunnel: true,
        logPrefix: pkg.name
    },
    ftp: {
        host: 'zoom.net.ua',
        user: 'deploy',
        password: 'AwxTZQtR',
        parallel: 10
    }
};

/***** misc *****/

gulp.task('up', ['clean', 'build']);
gulp.task('default', ['webserver', 'watch']);

/***** html *****/

gulp.task('html:minify', function() {
    gulp.src([path.src.html, path.ignore.html])
        .pipe(rigger())
        // .pipe(usemin({
        //     css: [cssmin(),rev()],
        //     js: [uglify().on('error', function(err) {console.log('[Error] ' + err.toString())}), rev()]
        // }))
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(path.build.root));
});

gulp.task('html:build', ['html:minify']);

/***** styles *****/

gulp.task('styles:sass', function() {
    return gulp.src(path.src.sass)
        .pipe(cached('scripts'))
        //.pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({'browsers': 'last 10 versions', cascade: false}))
        .pipe(cssmin())
        //.pipe(sourcemaps.write())
        .pipe(remember('scripts'))
        .pipe(gulp.dest('app/css/'))
        .pipe(gulp.dest(path.build.styles));
});

gulp.task('styles:minify', ['styles:sass'], function() {
    return gulp.src(path.src.css)
        .pipe(cached('scripts'))
        .pipe(cssmin())
        .pipe(remember('scripts'))
        //.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.styles));
});

gulp.task('styles:beautify', ['styles:sass'], function() {
    return gulp.src(path.src.css)
        .pipe(cached('scripts'))
        .pipe(cssbeautify())
        .pipe(remember('scripts'))
        .pipe(gulp.dest(path.build.styles));
});

gulp.task('styles:build', ['styles:minify']);

/***** scripts *****/

gulp.task('scripts:build', function() {
    return gulp.src(path.src.js)
        .pipe(cached('scripts'))
        .pipe(rigger())
        //.pipe(sourcemaps.init())
        //.pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(remember('scripts'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest(path.build.scripts));
});

gulp.task('scripts:bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest(path.build.scripts));
});

/***** images *****/

gulp.task('images:build', function () {
    return gulp.src(path.src.images)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.images));
});

/***** fonts *****/

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

/***** build *****/

gulp.task('build', [
    'html:build',
    'styles:build',
    'scripts:build',
    //'images:build',
    //'fonts:build'
]);

/***** deploy *****/

gulp.task('ftp:deploy', function() {
    var connect = ftp.create(setting.ftp);
    return gulp.src([path.build.match], {base: '.', buffer: false})
        .pipe(connect.newer('/www'))
        .pipe(connect.dest('zoom.net.ua'));
});

gulp.task('deploy', ['ftp:deploy']);

/******* clean *******/

gulp.task('clean', function() {
    return gulp.src(path.clean, {read: false})
        .pipe(clean({ showLog: true }));
});

/******* webserver *******/

gulp.task('webserver', function () {
    browserSync.init(setting.webserver);
    browserSync.watch(path.build.match)
        .on('change', browserSync.reload);
});

/******* watch *******/

gulp.task('watch', function() {
    var whatever = function(event) {
        console.log('File: ' + '\x1b[32m' + event.path + '\x1b[0m' + ' was ' + event.type);
    };

    gulp.watch([path.src.html], function() {
        gulp.start('html:build');
    }).on('change', whatever);

    gulp.watch([path.src.css, path.src.sass], function() {
        gulp.start('styles:build');
    }).on('change', whatever);

    gulp.watch([path.src.js], function() {
        gulp.start('scripts:build');
    }).on('change', whatever);

    gulp.watch([path.src.images], function() {
        gulp.start('images:build');
    }).on('change', whatever);

    gulp.watch([path.src.fonts], function() {
        gulp.start('fonts:build');
    }).on('change', whatever);
});
