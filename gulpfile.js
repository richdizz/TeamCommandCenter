var gulp = require("gulp"),
merge = require("merge-stream"),
rimraf = require("rimraf");

var paths = {
    webroot: "./wwwroot/",
    node_modules: "./node_modules/"
};

paths.libDest = paths.webroot + "lib/";

gulp.task("libs", function () {
    var react = gulp.src(paths.node_modules + "react/umd/react.production.min.js")
        .pipe(gulp.dest(paths.libDest + "react"));
    var reactdom = gulp.src(paths.node_modules + "react-dom/umd/react-dom.production.min.js")
        .pipe(gulp.dest(paths.libDest + "react-dom"));
    var reactrouterdom = gulp.src(paths.node_modules + "react-router-dom/umd/react-router-dom.min.js")
        .pipe(gulp.dest(paths.libDest + "react-router-dom"));
    var reactbootstrap = gulp.src(paths.node_modules + "react-bootstrap/dist/react-bootstrap.min.js")
        .pipe(gulp.dest(paths.libDest + "react-bootstrap"));
    var reacthtmlparser = gulp.src(paths.node_modules + "react-html-parser/dist/react-html-parser.min.js")
        .pipe(gulp.dest(paths.libDest + "react-html-parser"));
    var signalr = gulp.src(paths.node_modules + "@microsoft/signalr/dist/browser/signalr.min.js")
        .pipe(gulp.dest(paths.libDest + "signalr"));

    return merge(react, reactrouterdom, reactdom, reactbootstrap, reacthtmlparser, signalr);
});