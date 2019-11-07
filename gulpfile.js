let gulp = require('gulp');
let sass = require('gulp-sass');
let csso = require('gulp-csso')
let htmlmin = require('gulp-htmlmin');
let bs = require('browser-sync').create();
let prefixer = require('gulp-autoprefixer');
let uglify = require('gulp-uglify');
let pipeline = require('readable-stream').pipeline;
let babel = require('gulp-babel');
let del = require('del');
let imagemin = require('gulp-imagemin');


function streamMe() {
	bs.init({
		server: {
			baseDir: './src'
		}
		})

	gulp.watch('src/index.html', gulp.series(minifyHtml)).on('change', bs.reload)
	gulp.watch('src/*.js', gulp.series(compressJS)).on('change', bs.reload)
	gulp.watch('src/sass/main.sass', gulp.series(sassCompile)).on('change', bs.reload)

}

async function clearDist() {
	let deletedPath = await del(['dist'])
}

function minImages() {
	return gulp.src('src/img/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'))
}


function sassCompile() {
	return gulp.src('src/sass/main.sass')
		.pipe(sass())
		.pipe(prefixer({
			browsers: ['last 2 version'],
			cascade: false
			}))
		.pipe(csso())
		.pipe(gulp.dest('dist/css'))
		.pipe(bs.stream())
}


function compressJS() {
	return pipeline(

			gulp.src('src/js/*.js')
				.pipe(babel({
					presets: ['@babel/env']
				})),
			uglify(),
			gulp.dest('dist/js')

		)
}

function minifyHtml() {
	return gulp.src('src/index.html')
		.pipe(htmlmin({
			collapseWhitespace: true
			}))
		.pipe(gulp.dest('dist'))
}


exports.build = gulp.series(sassCompile, minifyHtml, compressJS, minImages, streamMe)
exports.streamMe = streamMe;
exports.clearDist = clearDist;
exports.minImages = minImages
