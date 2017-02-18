var gulp = require('gulp');

var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var minicss = require('gulp-clean-css');
var cssver = require('gulp-make-css-url-version'); 
var concat = require('gulp-concat');

var htmlmin = require('gulp-htmlmin');

var imagemin = require('gulp-imagemin');

gulp.task('clean', function() {  
  return gulp.src(['./disk/css/*', './disk/js/*','./disk/index.html'], {read: false})
    .pipe(clean());
});

gulp.task('move',function(){
    return gulp.src('./src/css/fonts/*.{eot,svg,ttf,woff}')
    .pipe(gulp.dest('./disk/css/fonts'))
})

gulp.task('minijs',function(){
    return gulp.src('./src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./disk/js'))
})

gulp.task('style',function(){
    return gulp.src('./src/css/*.css')
    .pipe(concat('main.css'))  
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
    }))
    .pipe(minicss({
        keepSpecialComments: '*',
    }))
    .pipe(cssver())
    .pipe(gulp.dest('./disk/css'));
});

gulp.task('minihtml',function(){
    return gulp.src('src/*.html')
    .pipe(htmlmin({
        removeComments : true,
        collapseWhitespace : true,
        collapseBooleanAttributes : true,
        removeEmptyAttributes : true,
        removeScriptTypeAttributes : true,
        removeStyleLinkTypeAttributes : true,
        minifyJS : true,
        minifyCSS : true
    }))
    .pipe(gulp.dest('disk'))
});

gulp.task('miniimg',function(){
    gulp.src('./src/image/*.{png,jpg,gif,ico}')
    .pipe(imagemin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('./disk/image'))
})

gulp.task('default',['clean'],function(){
    gulp.start('move','minijs','style','minihtml','miniimg');
})
