"use strict";

var fs = require("fs");
var path = require("path");
var del = require("del");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var istanbul = require("gulp-istanbul");
var mocha = require("gulp-mocha");
var plumber = require("gulp-plumber");
var shell = require("shelljs");
var gutil = require("gulp-util");
var merge = require("merge-stream");

// var executeCommand = function (cmd, dir, done) {
//   gutil.log("Running command: " + cmd);
//   var pwd = shell.pwd();
//   if (undefined !== dir) {
//     gutil.log(" Working directory: " + dir);
//     shell.cd(dir);
//   }
//   shell.exec(cmd, { silent: true }, function (code, stdout, stderr) {
//     gutil.log(" stdout: " + stdout);
//     if (code !== 0) {
//       gutil.log("Command failed: " + cmd + "\nManually execute to debug");
//       gutil.log(" stderr: " + stderr);
//     }
//     shell.cd(pwd);
//     done();
//   });
// };

// var createVsixPackage = function (done) {
//   if (!shell.which('tfx')) {
//     gutil.log('Packaging requires tfx cli. Please install with `npm install tfx-cli -g`.');
//     done();
//     return;
//   }
//   var packagingCmd = 'tfx extension create --manifest-globs vss-extension.json --root dist/src --output-path dist';
//   executeCommand(packagingCmd, shell.pwd(), done);
// };

// var getNodeDependencies = function (done) {
//   gutil.log('Copy package.json to dist directory');
//   shell.mkdir('-p', 'dist/node_modules');
//   shell.cp('-f', 'package.json', 'dist');

//   gutil.log('Fetch node modules to package with tasks');
//   var npmPath = shell.which('npm');
//   var npmInstallCommand = '"' + npmPath + '" install --production';
//   executeCommand(npmInstallCommand, 'dist', done);
// };

// Tasks
gulp.task("lint", function () {
  return gulp
    .src([
      "src/swagger-diff/swagger-diff-v1/task.js",
      "src/swagger-diff/swagger-diff-v2/task.js"
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("build", gulp.series("lint"));

gulp.task("pre-test", gulp.series("build"), function () {
  return gulp
    .src("src/**/*.js")
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire());
});

gulp.task("mocha-test", gulp.series(["pre-test"]), function (done) {
  var mochaErr;

  gulp
    .src("test/**/*.js")
    .pipe(plumber())
    .pipe(mocha({ reporter: "spec" }))
    .on("error", function (err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on("end", function () {
      done(mochaErr);
    });
});

gulp.task("test", gulp.series(["mocha-test"]));

// gulp.task('pester-test', ['pre-test'], function (done) {
//   // Runs powershell unit tests based on pester
//   var pester = spawn('powershell.exe', ['-Command', 'Invoke-Pester -EnableExit -Path test'], {stdio: 'inherit'});
//   pester.on('exit', function (code) {
//     if (code === 0) {
//       done();
//     } else {
//       done('Pester tests failed!');
//     }
//   });

//   pester.on('error', function () {
//     // We may be in a non-windows machine or powershell.exe is not in path. Skip pester tests.
//     done();
//   });
// });

gulp.task("default", gulp.series(["test"]));

gulp.task("package:clean", function(cb){
  return del(["./package/*/**"], cb);
});

gulp.task(
  "package:copy",
  gulp.series("package:clean", () => {
    var m1 = gulp
      .src(
        [
          "./extension-icon*.png",
          "LICENSE",
          "README.md",
          "package.json",
          "docs/**/*",
          "!src/**",
          "!**/node_modules/**/*",
        ],
        { base: "." }
      )
      .pipe(gulp.dest("./package"));

    var m2 = gulp
      .src(
        [
          "./src/vss-extension.json",
          "./src/docs/*",
          "./src/images/*",
          "./src/swagger-diff/swagger-diff-v1/**/*.js",
          "./src/swagger-diff/swagger-diff-v1/package.json",
          "./src/swagger-diff/swagger-diff-v1/task.json",
          "./src/swagger-diff/swagger-diff-v1/icon.png",

          "./src/swagger-diff/swagger-diff-v2/**/*.js",
          "./src/swagger-diff/swagger-diff-v2/package.json",
          "./src/swagger-diff/swagger-diff-v2/task.json",
          "./src/swagger-diff/swagger-diff-v2/icon.png",

          "!**/node_modules/**/*",
        ],
        { base: "./src/" }
      )
      .pipe(gulp.dest("./package"));

    return merge(m1, m2);
  })
);

gulp.task("package", gulp.series("package:copy"));
