console.log("hi");

var socket = io();
socket.on("connection",()=>{
    console.log("connected");
});

