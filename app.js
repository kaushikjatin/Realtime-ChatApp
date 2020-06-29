var express=require('express');
var http=require("http");
var app=express();
var server=http.createServer(app);
var socketio=require('socket.io');
var io=socketio(server);
var Filter=require('bad-words');
var helperfunctions=require("./src/utils/messages");
const { generatemessage } = require('./src/utils/messages');

app.use(express.static('public'));


io.on('connection',function(socket)
{
    socket.emit("message",helperfunctions.generatemessage("Welcome"));
    socket.broadcast.emit("message",helperfunctions.generatemessage("New User Has Joined"))
    socket.on("sendmessage",function(message,callback)
    {
        var filter=new Filter();
        if(filter.isProfane(message))
          callback("Badwords are Prohibited");
        else 
        {
            io.emit("message",helperfunctions.generatemessage(message));
            callback();
        }
    })

    socket.on('sendLocation',function(location,callback)
    {
        var location_url="https://google.com/maps?q="+location.latitude+","+location.longitude;
        socket.broadcast.emit("locationmessage",generatemessage(location_url));
        callback();
    })

    socket.on("disconnect",function()
    {
       io.emit("message",helperfunctions.generatemessage("User has left the chat"))
    })
})

server.listen(3000);