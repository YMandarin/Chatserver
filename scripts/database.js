var fs = require("fs");
var path = require("path");

var root = process.cwd();

function mPath(_path){
    return path.join(root,_path);
}

var userdata = JSON.parse(fs.readFileSync(mPath("/data/userdata.json")));
var IdList = JSON.parse(fs.readFileSync(mPath("/data/ID.json")));
var chat = JSON.parse(fs.readFileSync(mPath("/data/chats.json")));

exports.addUser = function(username,password){
    if (!exports.userExists(username)){
        IdList.userCount++;
        Id = IdList.userCount;

        IdList.users[Id] = username;

        userdata[Id] = {n:username,p:password};
        chat.contacts[Id] = [];
        
        return true;
    }
    return false;
}

exports.userExists = function(username) {
    let exists = false;
    
    Object.values(IdList.users).forEach(e =>{
        
        if(e == username){                
            exists = true;
        }
    });
    
    return exists;
}

exports.addChat = function(writerId,otherId) {
    let user1,user2;
    if (writerId>otherId){
        user2 = writerId;
        user1 = otherId;
    } else {
        user1 = writerId;
        user2 = otherId;
    }

    chat.contacts[writerId].push({u:otherId});
    chat.contacts[otherId].push({u:writerId});
    chat.data[`${user1}_${user2}`] = [];
}

exports.addChatText = function(writerId,otherId,text){

    let user1,user2;
    if (writerId>otherId){
        user2 = writerId;
        user1 = otherId;
    } else {
        user1 = writerId;
        user2 = otherId;
    }

    chat.data[`${user1}_${user2}`].push([writerId,text]);
}


exports.addGroup = function(groupName,memberIDs,description) {
    
    chat.groupCount++;
    let groupId = IdList.groupCount;

    chat.data[groupId] = {u:memberIDs,d:description,t:[]};

    memberIDs.forEach(e =>{
        chat.contacts[e].push({g:groupId});
    });

    return groupId;
}

exports.addGroupMembers = function(groupId,newMembersId){
    chat.data[groupId].u.concat(newMembersId);
}

exports.addGroupText = function(writerId,groupId,text){
    chat.data[groupId].t.push([writerId,text]);
}

exports.addUnreadMessage = function(userId,chatId,isGroup){
    
    if(isGroup !== undefined && isGroup){        
        chat.contacts[userId].forEach(e =>{    
            if(e.g != undefined && e.g == chatId){
                (e.m != undefined) ? e.m++ : e.m = 1;
            }
        });
    }
    else{
        chat.contacts[userId].forEach(e =>{
            if(e.u !== undefined && e.u == chatId){
                (e.m !== undefined) ? e.m++ : e.m = 1;
            }
        });
    }
}

exports.removeUnreadMessage = function(userId,chatId,isGroup){
    chat.contacts[userId].forEach(e =>{
        if(isGroup !== undefined && isGroup){
            if(e.g !== undefined && e.g == chatId && e.m !== undefined){                
                delete e.m;
            }
        }
        else{
            if(e.u !== undefined && e.u == chatId && e.m !== undefined){
                delete e.m;
            }
        }
    });
}

exports.getContacts = function(userId) {
    return chat.contacts[userId];
}

exports.getChatData = function(writerId,otherId){
    let user1,user2;
    if (writerId>otherId){
        user2 = writerId;
        user1 = otherId;
    } else {
        user1 = writerId;
        user2 = otherId;
    }

    return chat.data[`${user1}_${user2}`];
}

exports.getGroupData = function(groupId){    
    return chat.data[groupId];
}

exports.getUsers = function(){
    return IdList.users;
}

exports.getUserNameById = function(userId){
    return IdList.users[userId];
}

exports.getUsersWithUser = function(userId){    
    let contacts = [];
    let users = {};
    chat.contacts[userId].forEach(e=>{
        if(e.u != undefined){
            contacts.push(e.u);
        }
        else{            
            contacts = contacts.concat(chat.data[e.g].u);
        }
    });        

    [...new Set(contacts)].forEach(e=>{
        users[e] = IdList.users[e];
    });
    users[userId] = IdList.users[userId];    
    return users;
}

exports.getChatContacts = function(userId){
    let contacts = [];

    chat.contacts[userId].forEach(e=>{
        if(e.u != undefined){
            contacts.push(e.u);
        }
    });

    return contacts;
}

exports.getGroupsOfUser = function(userId){
    let groups = {};

    chat.contacts[userId].forEach(e =>{
        if(e.g !== undefined){
            groups[e.g] = IdList.groups[e.g];
        }
    });
    return groups;
}

exports.getUsersOfGroup = function(groupId){
    return chat.data[groupId].u;
}

exports.checkPasswordByName = function(username,password){

    return userdata[getIdByUsername(username)].p === password
}

exports.checkPasswordById = function(userId,password){
    return userdata[userId].p === password
}

exports.save = function(){
    fs.writeFileSync(mPath("/data/userdata.json"),JSON.stringify(userdata));
    fs.writeFileSync(mPath("/data/ID.json"),JSON.stringify(IdList));
    fs.writeFileSync(mPath("/data/chats.json"),JSON.stringify(chat));
}

exports.changePassword = function(userId,newPassword){    
    userdata[userId].p = newPassword;    
}

exports.changeNick = function(userId,newNick){
    userdata[userId].n = newNick;
    IdList.users[userId] = newNick;
}

exports.newChat = function(userId,otherId){
    chat.contacts[userId].push({u:Number(otherId)});
    chat.contacts[otherId].push({u:Number(userId),m:1});

    let user1,user2;

    if(userId > otherId){
        user2 = userId;
        user1 = otherId;
    }
    else{
        user2 = otherId;
        user1 = userId;
    }

    chat.data[`${user1}_${user2}`] = [];

}

exports.editGroup = function(groupId,newName,newUserList,newDescription,userId){
    console.log("editGroup",groupId,newName,newUserList,newDescription,userId);
    
    let group = chat.data[groupId];

    group.n = newName;
    group.d = newDescription;
    
    let userList = Object.keys(newUserList);
    let member;
    console.log("userListBefore:",userList);
    
    group.u.forEach((u,index)=>{
        console.log(u,userList.includes(u));
        
        if(!userList.includes(u)){
            console.log("remove:",u);
            
            chat.contacts[u].forEach((e,index) =>{
                if(e.g == groupId){
                    chat.contacts[u].splice(index,1);
                }
            });
        }
        else{
            userList.splice(userList.indexOf(u),1);
        }
    });
    
    

    for (e of userList){
        chat.contacts[e].push({g:groupId});
    }
    
    group.t.push([0,`${exports.getUserNameById(userId)} changed the group data`]);
    group.u = Object.keys(newUserList);

    console.log("userList:",userList);
    console.log("users:",group.u);

    IdList.groups[groupId] = newName;

    chat.data[groupId] = group;

}

exports.newGroup = function(groupName,groupUserList,groupDescription,creatorId){
    IdList.groupCount++;
    let groupId = IdList.groupCount;
    IdList.groups[groupId] = groupName;

    chat.data[groupId] = {u:Object.keys(groupUserList), n: groupName, d:groupDescription, t:[[0,`${IdList.users[creatorId]} created the group: "${groupName}"`]]};
    for (e in groupUserList){
        chat.contacts[e].push({g:groupId,m:1})
    }

    return groupId;
}

exports.getGroups = function(){
    return IdList.groups;
}

function getIdByUsername(username){
    let ret = -1;

    Object.entries(IdList.users).forEach(e =>{
        if(e[1]==username){
            ret = e[0];
        }
    })
    return ret;
}

function getIdbyGroupname(groupname){
    let ret = -1;
    Object.entries(IdList.gropus).forEach(e =>{
        if(e[1]==groupname){
            ret = e[0];
        }
    })
    return ret;
}

exports.getIdByUsername = getIdByUsername;
exports.getIdByGroupname = getIdByUsername;

exports.mPath = mPath;