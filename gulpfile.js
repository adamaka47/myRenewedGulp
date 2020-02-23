const gulp = require('gulp')
const sass = require('gulp-sass')
const prefixer = require('gulp-autoprefixer')
const bs = require('browser-sync')
const watch = require('gulp-watch')
const babel = require('gulp-babel')
const del = require('del')
const sprite = require('gulp-svg-sprite')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const imagemin = require('gulp-imagemin')
const fileinc = require('gulp-file-include')
const concat = require('gulp-concat')
const cheerio = require('gulp-cheerio')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')
const replace = require('gulp-replace')

gulp.task('server', function() {

	bs.init({
		server: {
			baseDir: './build'
		}
	})

})

gulp.task('watch', function() {

	watch('src/js/*.js', gulp.parallel('js'))
	watch('src/sass/**/*', gulp.parallel('sass'))
	watch('src/html/**/*', gulp.parallel('html'))

})

gulp.task('svg', function() {

	return gulp.src('./src/img/**/*.svg')
		.pipe(cheerio({
			run: function($) {
				$('[fill]').removeAttr('fill')
				$('[stroke]').removeAttr('stroke')
				$('[style]').removeAttr('style')
			},
			parserOptions: {xmlMode: true}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(sprite({
			mode: {
				symbol: {
					sprite: "sprite.svg",
				}
			}
		}))
		.pipe(gulp.dest('build/img'))
})


gulp.task('html', function() {

	return gulp.src('src/html/*.html')
		.pipe(fileinc({
			prefix: '@@'
		}))
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('build/'))
		.pipe(bs.stream())

})

gulp.task('imagemin', function() {

	gulp.src('src/img/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('build/img'))

})


gulp.task('js', function() {

	return gulp.src('src/js/*.js')
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'))
		.pipe(bs.stream())

})



gulp.task('sass', function() {

	return gulp.src('src/sass/main.sass')
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Sass styles',
					sound: false,
					message: err.message
				}
				})
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(sourcemaps.write())
		.pipe(prefixer({
			overrideBrowserslist: ['last 4 versions']
		}))
		.pipe(gulp.dest('build/css'))
		.pipe(bs.stream())

})



gulp.task('del', function(cb) {

	del.sync('build/');
	cb()

})


gulp.task('dev', gulp.parallel('del', 'sass', 'js', 'html', 'imagemin', 'svg', 'watch', 'server'))
