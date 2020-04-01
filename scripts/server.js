var fs = require("fs");
var path = require("path");
var express = require("express");
var http = require("http");
var socketIo = require("socket.io");
var ejs = require("ejs");

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

require("./routings.js")(app);

io.on("connection",(socket)=>{
    console.log(socket.id);
    socket.emit("connection");
    require()
});

server.listen(3000);

function mPath(_path){
    return path.join(process.cwd(),_path);
}
