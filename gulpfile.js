'use strict';

var pkg = require('./package'),
    gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    //googleCdn = require('gulp-google-cdn'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssbeautify = require('gulp-cssbeautify'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    ftp = require('vinyl-ftp'),
    mainBowerFiles = require('main-bower-files'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    src: {
        html: 'app/**/*.html',
        css: 'app/css/*.css',
        sass: 'app/sass/*.sass',
        js: 'app/js/*.js',
        images: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    build: {
        html: 'build/',
        styles: 'build/css/',
        js: 'build/js/',
        images: 'build/images/',
        fonts: 'build/fonts/'
    },
    ignore: {
        html: '!app/templates/*.html'
    },
    watch: {
        html: 'app/**/*.html',
        css: 'app/css/*.css',
        sass: 'app/sass/*.sass',
        js: 'app/js/**/*.js',
        images: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: 'build/*'
};

var setting = {
    webserver: {
        host: 'localhost',
        server: {
            baseDir: "./build"
        },
        tunnel: true,
        port: 9000,
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

gulp.task('default', ['webserver', 'watch']);

gulp.task('clean', function() {
    return gulp.src(path.clean, { read: false })
        .pipe(clean({ showLog: true }));
});

gulp.task('webserver', function () {
    browserSync(setting.webserver);
});

/***** html *****/

gulp.task('html:build', function() {
    gulp.src([path.src.html, path.ignore.html])
        .pipe(rigger())
        //.pipe(googleCdn(require('./bower.json')))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

/***** styles *****/

gulp.task('styles:sass', function() {
    return gulp.src(path.src.sass)
        .pipe(sass())
        .pipe(autoprefixer({
            'browsers': 'last 10 versions',
            cascade: false
        }))
        .pipe(cssbeautify())
        .pipe(gulp.dest('app/css/'))
        .pipe(gulp.dest(path.build.styles));
});

gulp.task('styles:minify', ['styles:sass'], function() {
    return gulp.src(path.src.css)
        .pipe(cssmin())
        //.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.styles))
        .pipe(reload({stream: true}));
});

gulp.task('styles:build', ['styles:minify']);

/***** js *****/

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('js:mainfiles', function() {
    gulp.src(mainBowerFiles())
        .pipe(gulp.dest(path.build.js));
});

/***** images *****/

gulp.task('images:build', function () {
    gulp.src(path.src.images)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.images))
        .pipe(reload({stream: true}));
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
    'js:build',
    'images:build',
    'fonts:build'
]);

/***** deploy *****/

gulp.task('ftp:deploy', function() {
    var conn = ftp.create(setting.ftp);

    return gulp.src([
        'build/**/*'
        //'css/*.min.css',
        //'js/**',
        //'images/**',
        //'index.html',
        //'package.json',
        //'gulpfile.js'
    ], {base: '.', buffer: false})
        .pipe(conn.newer('/www'))
        .pipe(conn.dest('zoom.net.ua'));
});

gulp.task('deploy', ['ftp:deploy']);

/******* watch *******/

gulp.task('watch', function() {
    gulp.watch([path.watch.html], function() {
        gulp.start('html:build');
    });

    gulp.watch([path.watch.css, path.watch.sass], function() {
        gulp.start('styles:build');
    });

    gulp.watch([path.watch.js], function() {
        gulp.start('js:build');
    });

    gulp.watch([path.watch.images], function() {
        gulp.start('images:build');
    });

    gulp.watch([path.watch.fonts], function() {
        gulp.start('fonts:build');
    });
});
