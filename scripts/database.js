var fs = require("fs");
var path = require("path");

var root = process.cwd();

function mPath(_path){
    return path.join(root,_path);
}

var userdata = JSON.parse(fs.readFileSync(mPath("/data/userdata.json")));
var users = JSON.parse(fs.readFileSync(mPath("/data/users.json")));
var chat = JSON.parse(fs.readFileSync(mPath("/data/chats.json")))

exports.addUser = function(username,password){
    if (!(username in users.values())){
        Id = users.Current;
        users.Current++;
        userdata[Id] = {n:username,p:password}
        return true;
    }
    return false;
}

exports.userExists = function(username) {
    if (username in Object.values(users)){
        return true;
    }
    return false;
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

exports.addGroup = function(groupName,usersId) {
    chat.data[groupName] = {u:usersId,t:[]};

    users.forEach((e)=>{
        chat.contacts[e].push({n:groupName});
    });
}

exports.addGroupText = function(writerId,groupName,text){
    chat.data[groupName].t.push([writerId,text]);
}

exports.getContacts = function(userId) {
    return chat.contacts[user];
}

exports.getChatText = function(writerId,otherId){
    let user1,user2;
    if (writerID>otherId){
        user2 = writerId;
        user1 = otherId;
    } else {
        user1 = writerId;
        user2 = otherId;
    }

    return chat.data[`${user1}_${user2}`];
}

exports.getGroupText = function(groupName){
    return chat.data[groupName];
}

exports.getUsers = function(){
    return users;
}

exports.checkPasswordByName = function(username,password){
    return userdata[getIdByUsername(user)].p === password
}

exports.checkPasswordById = function(userId,password){
    return userdata[userId].p === password
}

function getIdByUsername(username){
    return Object.values(users).find(key => users[key]===username)
}

exports.getIdByUsername = getIdByUsername;

exports.mPath = mPath;