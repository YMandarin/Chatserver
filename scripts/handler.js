var database = require("./database.js");

var onlineUserSenders = {};
var onlineUsers = {};

module.exports = function(socket,io){

    function setUser(userId,name){
        onlineUserSenders[userId] = {
            sendMessage: (text,sender,groupId) => {
            if (groupId === undefined){
                socket.emit("chatMessage",sender,text);
            }
            else{
                socket.emit("groupMessage",groupId,sender,text);
            }
            },newChat: (senderId) => socket.emit("newChat",senderId,database.getUserNameById(senderId)),
            newGroup: (groupId,groupName) => socket.emit("newGroup",database.getUsersWithUser(userId),groupId,groupName),
            editGroup: (groupId,groupName) => socket.emit("editGroup",groupId,groupName),
            removeGroup: (groupId) => socket.emit("removeGroup",groupId)
        };
    
        onlineUsers[userId] = name;
    }
    
    console.log("new handler");

    let userId;
    let nickName;

    socket.on("login",(nick,password)=>{
        
        if(database.userExists(nick)){
            
            if(database.checkPasswordByName(nick,password)){
                socket.emit("login",nick);
            }
            else{
                socket.emit("loginError",false,true)
            }
        }
        else{
            socket.emit("loginError",true,false);
        }
    });

    socket.on("createAccount",(nick,password)=>{
        if(!database.userExists(nick) && database.addUser(nick,password)){
            socket.emit("login",nick);
        }
        else{
            socket.emit("creationError");
        }
    });

    socket.on("reLogin",(userID,nick) => {
        userId = Number(userID);
        nickName = nick; 

        setUser(userID,nick);
    });

    socket.on("logOut",()=> {
        delete onlineUsers[userId];
        delete onlineUserSenders[userId];
    });

    socket.on("loadUser", name =>{
        userId = Number(database.getIdByUsername(name));
        nickName = name;
        
        setUser(userId,name)

        socket.emit("loadUser",userId,database.getContacts(userId),Object.assign(database.getUsersWithUser(userId),onlineUsers),database.getGroupsOfUser(userId));
        
    });

    socket.on("sendChatMessage",(text,receiverId)=>{
        if (onlineUserSenders[receiverId] !== undefined){
            onlineUserSenders[receiverId].sendMessage(text,userId);
        }
        database.addUnreadMessage(receiverId,userId);
        database.addChatText(userId,receiverId,text);
    });

    socket.on("sendGroupMessage",(text,groupId)=>{                
        database.getUsersOfGroup(groupId).forEach(e =>{
            if (onlineUserSenders[e] !== undefined && e != userId){
                onlineUserSenders[e].sendMessage(text,userId,groupId);   
            }
            if(e != userId){
                database.addUnreadMessage(e,groupId,true);
            }
        });

        database.addGroupText(userId,groupId,text);
    });

    socket.on("loadChat", chatId =>{
        database.removeUnreadMessage(userId,chatId);
        socket.emit("loadChat",database.getChatData(userId,chatId),chatId);
    });

    socket.on("loadGroup",groupId =>{
        database.removeUnreadMessage(userId,groupId,true);
        socket.emit("loadGroup",database.getGroupData(groupId),groupId);
    });

    socket.on("disconnect",()=>{
        if(userId !== undefined){
            delete onlineUsers[userId];
        }
        
        if(isEmpty(onlineUsers)){            
            database.save();   
        }
    });

    socket.on("getOnlineUser",()=>{

    });

    socket.on("changeNick",(nick,password)=>{
        notTaken = !database.userExists(nick);
        passwordOk = database.checkPasswordById(userId,password);
        
        if(notTaken && passwordOk){
            database.changeNick(userId,nick);
        }

        socket.emit("changeNick",notTaken,passwordOk);
    });

    socket.on("changePasswordCheck",password => socket.emit("changePasswordCheck",database.checkPasswordById(userId,password)));

    socket.on("changePassword", newPassword => database.changePassword(userId,newPassword));

    socket.on("newChat",id => {
        database.newChat(userId,id);        
        if(onlineUserSenders[id]!==undefined){
            onlineUserSenders[id].newChat(userId);
        }
    });

    socket.on("editGroup",(groupId,groupName,userList,description) => {
        console.log("newUser:",Object.keys(userList),database.getUsersOfGroup(groupId));
        let oldGroupMembers = database.getUsersOfGroup(groupId);
        database.editGroup(groupId,groupName,userList,description,userId);
        let newGroupMembers = database.getUsersOfGroup(groupId);
        let all = [...new Set(oldGroupMembers.concat(newGroupMembers))];
        all.forEach(e=>{
            if(onlineUserSenders[e]!=undefined){
                if (!newGroupMembers.includes(e)){
                    console.log("remove:",e);
                    
                    onlineUserSenders[e].removeGroup(groupId);
                }
                else if (oldGroupMembers.includes(e)){
                    console.log("edit:",e);
                    
                    onlineUserSenders[e].editGroup(groupId,groupName);
                }
                else{
                    console.log("new:",e);
                    
                    onlineUserSenders[e].newGroup(groupId,groupName);
                }
            }
        });
    });

    socket.on("newGroup",(groupname,userList,description) => {
        let id = database.newGroup(groupname,userList,description,userId);
        for (e in userList){
            if(e in onlineUserSenders){
                onlineUserSenders[e].newGroup(id,groupname);
            }
        }
    });

    socket.on("chatOnlineUser",()=>{
        let users = database.getUsers();
        let toRemove = database.getChatContacts(userId);
        toRemove.push(userId);
        
        let chatUser = Object.keys(onlineUsers).filter(e => !toRemove.includes(Number(e)));
        let chatOnlineUser = [];
        
        chatUser.forEach(e =>{
            chatOnlineUser.push({[e]:users[e]});
        });
        socket.emit("chatOnlineUser", chatOnlineUser);
    });

    socket.on("newGroupOnlineUser",()=> socket.emit("newGroupOnlineUser",Object.assign(database.getUsersWithUser(userId),onlineUsers))); 

    socket.on("searchDirectly",(target,name)=>{        
        if(database.userExists(name)){
            socket.emit("searchDirectly",true,target,database.getIdByUsername(name),name,)
        }
    });

    socket.on("editGroupOnlineUser",id=>{
        let users = Object.assign({...onlineUsers},database.getUsersWithUser(userId));
        let members = database.getUsersOfGroup(id);
        let member = {};        
        
        for(e of members){            
            member[e] = users[e];
            delete users[e];
        }

        socket.emit("editGroupOnlineUser",member,users);
    });

}

function isEmpty(obj){
    let isEmpty = true;
    for(var key in obj) {
        isEmpty = false;
    }
    return isEmpty;
}