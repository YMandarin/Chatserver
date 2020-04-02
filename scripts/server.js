var fs = require("fs");
var path = require("path");
var express = require("express");
var http = require("http");
var socketIo = require("socket.io");
var ejs = require("ejs");

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

app.use(express.static(mPath("client")))

require("./routings.js")(app);

io.on("connection",(socket)=>{
    socket.emit("connection");
    require("./handler.js")(socket);
});

server.listen(80);

function mPath(_path){
    return path.join(process.cwd(),_path);
}
