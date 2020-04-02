var socket = io();
socket.on("connection",()=>{
    console.log("connected");
});

$(window).on("load",()=>{

    handleLogin();

    console.log("hi");

});
