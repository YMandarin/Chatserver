path = require("path");
fs = require("fs");
express = require("express");

module.exports = function (app) {
    // automatically route source for client
    app.use(express.static(mPath("client")));

    app.get("/", (req, res) => {
        res.sendFile(mPath("/client/html/index.html"));
    });

}

function mPath(_path) {
    return path.join(process.cwd(), _path);
}