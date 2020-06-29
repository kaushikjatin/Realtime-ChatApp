var generatemessage=function(text)
{
    return {
        text:text,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generatemessage:generatemessage
}