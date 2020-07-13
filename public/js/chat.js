var socket=io()
var messageformbutton=document.getElementById("button");
var messageforminput=document.getElementById("inputmessage");
var messageform=document.getElementById("message_form");
var sendlocationbutton=document.getElementById("send-location")
var locationmessagetemplate=document.getElementById('location-message-template').innerHTML;
var messagetemplate=document.getElementById('message-template').innerHTML;
var messages=document.getElementById('messages');
var sidebartemplate=document.getElementById('sidebar-template').innerHTML;
var sidebar=document.getElementById('sidebar')

var {username , room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

socket.on("message",function(username,message)
{
    var html=Mustache.render(messagetemplate,
        {
            username:username,
            message:message.text,
            createdAt:moment(message.createdAt).format("hh:mm a")
        })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})


socket.on("locationmessage",function(username,url)
{
    var html=Mustache.render(locationmessagetemplate,
        {
            username:username,
            message:url.text,
            createdAt:moment(url.createdAt).format("hh:mm a")
        })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})


socket.on("roomdata",function({room,users})
{
    const html=Mustache.render(sidebartemplate,
        {
            room:room,
            users:users
        })
    sidebar.innerHTML=html;
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

socket.emit("join",{username,room},function(error)
{
    if(error)
    {
        alert(error);
        location.href="/";
    }
});


var autoscroll=function()
{
    var newmessage=messages.lastElementChild;
    var newmessgestyles=getComputedStyle(newmessage);
    var messageheight=newmessage.offsetHeight+ parseInt(newmessgestyles.marginBottom);

    var containerheight=messages.scrollHeight;
    var scrooloffset=messages.offsetHeight + messages.scrollTop;  // visibleheight + scroolfromtop

    if(containerheight - messageheight <=scrooloffset)
    {
        console.log(messages.scrollTop);
        messages.scrollTop=messages.scrollHeight;
        console.log(messages.scrollTop);
    }

}

