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

/*
let test = {1:"a",2:"b",3:"c"};
for(e of Object.entries(test)){
    console.log(e);
}
console.log(1 in test);*/

io.on("connection",(socket)=>{
    socket.emit("connection");
    require("./handler.js")(socket,io);

});

server.listen(80);

function mPath(_path){
    return path.join(process.cwd(),_path);
}
