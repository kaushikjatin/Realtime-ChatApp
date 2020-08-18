var users=[];

var addUser=function({id,username,room})
{
    username=username.trim().toLowerCase();
    room=room.trim().toUpperCase();


    if(!username || !room)
      return {
          error:"Username and room are required!"
      }

    var existinguser=users.find(function(user)
    {
        return (user.username===username && user.room===room);
    });

    if(existinguser)
     return {
         error:"User already in use"
     }

     var user={id,username,room};
     users.push(user);

     return {user};

}


var removeUser=function(id)
{
    var index=users.findIndex(function(user)
    {
        return user.id===id;
    })

    if(index!==-1)
      return users.splice(index,1)[0];
}


var getUser=function(id)
{
    var user=users.find(function(user)
    {
        if(user.id===id)
          return user;
    })

    return user;
}

var getUsersInRoom=function(room)
{
    room=room.trim().toUpperCase();
    var usersinroom=users.filter(function(user)
    {
        return user.room===room;
    })
    return usersinroom;
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}