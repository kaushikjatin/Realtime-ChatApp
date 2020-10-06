var socket=io()
var messageformbutton=document.getElementById("button");
var messageforminput=document.getElementById("inputmessage");
var messageform=document.getElementById("message_form");
var sendlocationbutton=document.getElementById("send-location")
var locationmessagetemplate=document.getElementById('location-message-template').innerHTML;
var messagetemplate=document.getElementById('message-template').innerHTML;
var myownmessagetemplate=document.getElementById('my-own-message-template').innerHTML;
var adminmessagetemplate=document.getElementById('admin-message-template').innerHTML;
var messages=document.getElementById('messages');
var sidebartemplate=document.getElementById('sidebar-template').innerHTML;
var sidebar=document.getElementById('sidebar')

var {username , room}=Qs.parse(location.search,{ignoreQueryPrefix:true}); // as this donot have concept of ockets so the data the URL is taken out by Qs.pare() and location.search9) refers to that data in URL.

socket.on("message",function(sendername,message)
{

    var html;
    if(username.trim().toLowerCase()===sendername)
    {
        html=Mustache.render(myownmessagetemplate,
            {
                username:"Myself",
                message:message.text,
                createdAt:moment(message.createdAt).format("hh:mm a")
            })
    }
    else if(sendername.trim().toLowerCase()==='admin')
    {
        console.log("came here");
        html=Mustache.render(adminmessagetemplate,
            {
                username:"Admin",
                message:message.text,
                createdAt:moment(message.createdAt).format("hh:mm a")
            })
    }
    else 
    {
        html=Mustache.render(messagetemplate,
            {
                username:sendername,
                message:message.text,
                createdAt:moment(message.createdAt).format("hh:mm a")
            })
    }

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
    // offset height of any element return elementsize + padding + border...but not margin......so you can see that for finding the size
    // of new element we will be explixitly adding th margin...
    var newmessage=messages.lastElementChild;
    var newmessgestyles=getComputedStyle(newmessage);
    var messageheight=newmessage.offsetHeight+ parseInt(newmessgestyles.marginBottom);


    // scrollheight property returns the elementsize + padding..but exclude the border,margin,scrollbrs etc......
    var containerheight=messages.scrollHeight;// here scrollheight will give the sum of heights of all the messages in our DOM.
    var scrooloffset=messages.offsetHeight + messages.scrollTop;  // visibleheight + scroolfromtop

    if(containerheight - messageheight <=scrooloffset)
    {
        console.log(messages.scrollTop);
        messages.scrollTop=messages.scrollHeight;
        console.log(messages.scrollTop);
    }

}

