const sourceMaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const merge = require('merge2');
const gulp = require('gulp');
const path = require('path');
const del = require('del');

const config = path.join(__dirname, 'tsconfig.json');
const proj = ts.createProject(config);
const src = path.join(__dirname, 'src', '**', '*.ts');
const outDir = path.join(__dirname, 'lib');

gulp.task('build', () => {
  const res = gulp.src(src)
                    .pipe(sourceMaps.init())
                    .pipe(proj())
                    .on('error', () => {});

  const js = res.js.pipe(sourceMaps.write('.', {
    includeContent: false,
    sourceRoot: ""
  })).pipe(gulp.dest(outDir));
  const dts = res.dts.pipe(gulp.dest(outDir));
  return merge(js, dts);
});

gulp.task('watch', gulp.series(['build']), () => {
  return gulp.watch(src, gulp.series(['build']));
});

gulp.task('clean', () => {
  return del(`${outDir}/**`);
});
