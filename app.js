var express=require('express');
var http=require("http");
var app=express();
var server=http.createServer(app);
var socketio=require('socket.io');
var io=socketio(server);
var Filter=require('bad-words');
var helperfunctions=require("./src/utils/messages");
const { generatemessage } = require('./src/utils/messages');

const {addUser, removeUser, getUser, getUsersInRoom}=require("./src/utils/users");


app.use(express.static('public'));

app.get("/getinfo/",function(req,res){
    res.sendFile(__dirname + '/public/chat.html');
})



io.on('connection',function(socket)
{
    socket.on("join",function({username,room},callback)
    {
        var {error,user}=addUser({id:socket.id,username,room});
        if(error)
            callback(error);
        else 
        {
            socket.join(user.room);
            socket.emit("message","Admin",helperfunctions.generatemessage("Welcome"));
            socket.broadcast.to(user.room).emit("message","Admin",helperfunctions.generatemessage(user.username+" has joined the room"));
            io.to(user.room).emit("roomdata",
            {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    socket.on("sendmessage",function(message,callback)
    {
        var user=getUser(socket.id);
        var filter=new Filter();
        if(filter.isProfane(message))
          callback("Badwords are Prohibited");
        else 
        {
            io.to(user.room).emit("message",user.username,helperfunctions.generatemessage(message));
            callback();
        }
    })

    socket.on('sendLocation',function(location,callback)
    {
        var user=getUser(socket.id);
        var location_url="https://google.com/maps?q="+location.latitude+","+location.longitude;
        socket.to(user.room ).broadcast.emit("locationmessage",user.username,generatemessage(location_url));
        callback();
    })

    socket.on("disconnect",function()
    {
        var user=removeUser(socket.id);
        if(user)
        {
            io.to(user.room).emit("message","Admin",helperfunctions.generatemessage(user.username+" has left the chat"));
            io.to(user.room).emit("roomdata",{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(3000);