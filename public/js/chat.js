var socket=io()
var messageformbutton=document.getElementById("button");
var messageforminput=document.getElementById("inputmessage");
var messageform=document.getElementById("message_form");
var sendlocationbutton=document.getElementById("location")
var locationmessagetemplate=document.getElementById('location-message-template').innerHTML;
var messagetemplate=document.getElementById('message-template').innerHTML;
var messages=document.getElementById('messages');

socket.on("message",function(message)
{
    var html=Mustache.render(messagetemplate,
        {
            message:message.text,
            createdAt:moment(message.createdAt).format("hh:mm a")
        })
    messages.insertAdjacentHTML('beforeend',html)
})

socket.on("locationmessage",function(url)
{
    var html=Mustache.render(locationmessagetemplate,
        {
            message:url.text,
            createdAt:moment(url.createdAt).format("hh:mm a")
        })
    messages.insertAdjacentHTML('beforeend',html)
})

messageform.addEventListener("submit",function(event)
{
    event.preventDefault();
    messageformbutton.setAttribute("disabled","disabled");

    var message=messageforminput.value;
    socket.emit("sendmessage",message,function(error)
    {
        messageformbutton.removeAttribute("disabled");
        messageforminput.value="";
        messageforminput.focus();
        if(error)
          console.log(error);
        else 
          console.log("Message was successfully delivered");
    });
})

sendlocationbutton.addEventListener("click",function()
{
    if(!navigator.geolocation)
        return alert("Geolocation is not supported to your browser");
    else 
    {
        sendlocationbutton.setAttribute("disabled","disabled");
        navigator.geolocation.getCurrentPosition(function(position)
        {
            location_of_client={
                latitude:position.coords.latitude,
                longitude:position.coords.longitude
            };

            socket.emit("sendLocation",location_of_client,function()
            {
                sendlocationbutton.removeAttribute('disabled');
                console.log("Location Shared");
            });
        })
    }
        
})