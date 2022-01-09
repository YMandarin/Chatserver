var fs = require("fs");
var path = require("path");
var express = require("express");
var http = require("http");
var https = require("https")
var socketIo = require("socket.io");

var app = express();

// load ssl keys for https
var privateKey = fs.readFileSync(path.join(process.cwd(), "/ssl/privatekey.key"), 'utf8');
var certificate = fs.readFileSync(path.join(process.cwd(), "/ssl/certificate.crt"), 'utf8');

// create both http and https servers
var httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)
var httpServer = http.createServer(redirectToHTTPS)

var io = socketIo(httpsServer);

// pass express app to routings.js
require("./routings.js")(app);

// create a new handler on new connection
io.on("connection", (socket) => {
    socket.emit("connection");
    require("./handler.js")(socket, io);

});

// save database every 100s 
setTimeout(() => {
    require("./database.js").save();
}, 100000);

// listen to standard http and https ports
httpsServer.listen(443);
httpServer.listen(80);

// redirect http automatically to https
function redirectToHTTPS(req, res) {
    res.writeHead(302, {
        location: "https://" + req.headers.host
    });
    res.end();
}