var gulp = require('gulp');
var rev = require('gulp-rev');

var clean = require('gulp-clean');

var uglify = require('gulp-uglify');



 
gulp.task('clean', function () {
     return gulp.src('build/', {read: false})
    .pipe(clean());
});

gulp.task('copy',['clean'],function(){
        return gulp.src(['dev/**/'])
         .pipe(gulp.dest('build/'))

})

gulp.task('uglify',['clean','copy'], function() {
  return  gulp.src(['build/**/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('build/'))
});



gulp.task('build',['clean','copy'], function () {
    // by default, gulp would pick `assets/css` as the base,
    // so we need to set it explicitly:
   return  gulp.src(['build/**/*.css', 'build/**/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('build/'))  // write rev'd assets to build dir
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/')); // write manifest to build dir
 
});

gulp.task('lsload',function(){
      require('./gulptask/templateBuild').run({
          path:['./build/html/'
          ]
      })

})

gulp.task('default',['clean'],function(){
   gulp.run('lsload')
})

gulp.task('amd',['clean','copy','build'],function(){
    gulp.run('lsload')
})

//gulp.task('webpack',function(){
//    require('./gulptask/webpack2/lsloader_es6').run()
//})
//gulp.task('addcombo',function(){
//    require('./gulptask/webpack2/addCombo').run()
//})