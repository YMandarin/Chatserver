var fs = require("fs");
var path = require("path");
var bcrypt = require("bcrypt");
var root = process.cwd();

const hashRounds = 10

if (!fs.existsSync(mPath("data")))
    fs.mkdirSync(mPath("data"))

// read in database or initialize as empty
var userdata = fs.existsSync(mPath("/data/userdata.json")) ?
    JSON.parse(fs.readFileSync(mPath("/data/userdata.json"))) : {}

var IdList = fs.existsSync(mPath("/data/ID.json")) ?
    JSON.parse(fs.readFileSync(mPath("/data/ID.json"))) : {}

var chat = fs.existsSync(mPath("/data/chats.json")) ?
    JSON.parse(fs.readFileSync(mPath("/data/chats.json"))) : {}

// initialize database
if (IdList.userCount == undefined)
    IdList.userCount = 0
if (IdList.users == undefined)
    IdList.users = {}
if (IdList.groupCount == undefined)
    IdList.groupCount = 0
if (IdList.groups == undefined)
    IdList.groups = {}

if (chat.contacts == undefined)
    chat.contacts = {}
if (chat.data == undefined)
    chat.data = {}


/** create a user in the database with username and password
 * @param {string} username 
 * @param {string} password plaintext
 * @returns 
 */
exports.addUser = function (username, password) {
    if (!exports.userExists(username)) {
        IdList.userCount++;
        Id = IdList.userCount;

        IdList.users[Id] = username;
        bcrypt.hash(password, hashRounds, (err, hash) => {
            userdata[Id] = { n: username, p: hash };
        })
        chat.contacts[Id] = [];

        return true;
    }
    return false;
}

/** check if a user exists in the database
 * @param {string} username 
 * @returns {boolean}
 */
exports.userExists = function (username) {
    let exists = false;

    Object.values(IdList.users).forEach(e => {

        if (e == username) {
            exists = true;
        }
    });

    return exists;
}

/** add a chat between writer and other
 * @param {number} writerId 
 * @param {number} otherId 
 */
exports.addChat = function (writerId, otherId) {
    let { user1, user2 } = sortID(writerId, otherId);

    chat.contacts[writerId].push({ u: otherId });
    chat.contacts[otherId].push({ u: writerId });
    chat.data[`${user1}_${user2}`] = [];
}

/** add a message in the chat between 'writer' and 'other'
 * @param {number} writerId 
 * @param {number} otherId 
 * @param {string} text 
 */
exports.addChatMessage = function (writerId, otherId, text) {

    let { user1, user2 } = sortID(writerId, otherId);

    chat.data[`${user1}_${user2}`].push([writerId, text]);
}

/** create a new group
 * @param {string} groupName 
 * @param {[number]} memberIDs 
 * @param {string} description 
 * @returns {number} the ID of the new group
 */
exports.addGroup = function (groupName, memberIDs, description) {

    IdList.groupCount++;
    let groupId = IdList.groupCount;

    chat.data[groupId] = { n: groupName, u: memberIDs, d: description, t: [] };

    memberIDs.forEach(e => {
        chat.contacts[e].push({ g: groupId });
    });

    return groupId;
}

/** add one or multiple members to a group
 * @param {number} groupId 
 * @param {[number]} newMembersId 
 */
exports.addGroupMembers = function (groupId, newMembersId) {
    chat.data[groupId].u.concat(newMembersId);
}

/** add a message in a group chat
 * @param {number} writerId 
 * @param {number} groupId 
 * @param {number} text 
 */
exports.addGroupMessage = function (writerId, groupId, text) {
    chat.data[groupId].t.push([writerId, text]);
}

/** add an indicator for an unread message in a certain chat or group  
 * @param {number} userId 
 * @param {number} chatId 
 * @param {boolean} isGroup true if the unread message is in a group chat
 */
exports.addUnreadMessage = function (userId, chatId, isGroup) {

    if (isGroup !== undefined && isGroup) {
        chat.contacts[userId].forEach(e => {
            if (e.g != undefined && e.g == chatId) {
                (e.m != undefined) ? e.m++ : e.m = 1;
            }
        });
    }
    else {
        chat.contacts[userId].forEach(e => {
            if (e.u !== undefined && e.u == chatId) {
                (e.m !== undefined) ? e.m++ : e.m = 1;
            }
        });
    }
}

/** remove the indicator for an unread message in a certain chat or group
 * @param {number} userId 
 * @param {number} chatId 
 * @param {boolean} isGroup 
 */
exports.removeUnreadMessage = function (userId, chatId, isGroup) {
    chat.contacts[userId].forEach(e => {
        if (isGroup !== undefined && isGroup) {
            if (e.g !== undefined && e.g == chatId && e.m !== undefined) {
                delete e.m;
            }
        }
        else {
            if (e.u !== undefined && e.u == chatId && e.m !== undefined) {
                delete e.m;
            }
        }
    });
}

/** get the conatct list of a user
 * @param {number} userId 
 * @returns {[number]} a list with contact IDs
 */
exports.getContacts = function (userId) {
    return chat.contacts[userId];
}

/** get all messages of a chat 
 * @param {number} writerId 
 * @param {number} otherId 
 * @returns {[[number,string]]} a list of singletons containing writerID and message text  
 */
exports.getChatData = function (writerId, otherId) {
    let { user1, user2 } = sortID(writerId, otherId);

    return chat.data[`${user1}_${user2}`];
}

/** get all messages of a group chat
 * @param {number} groupId 
 * @returns {[[number,string]]} a list of singletons containing writerID and message text  
 */
exports.getGroupData = function (groupId) {
    return chat.data[groupId];
}

/** get a list of all user IDs
 * @returns [number]
 */
exports.getUsers = function () {
    return IdList.users;
}

/** get a user name by user ID
 * @param {number} userId 
 * @returns {string}
 */
exports.getUserNameById = function (userId) {
    return IdList.users[userId];
}


exports.getUsersWithUser = function (userId) {
    let contacts = [];
    let users = {};
    chat.contacts[userId].forEach(e => {
        if (e.u != undefined) {
            contacts.push(e.u);
        }
        else {
            contacts = contacts.concat(chat.data[e.g].u);
        }
    });

    [...new Set(contacts)].forEach(e => {
        users[e] = IdList.users[e];
    });
    users[userId] = IdList.users[userId];
    return users;
}

exports.getChatContacts = function (userId) {
    let contacts = [];
    console.log(userId);
    chat.contacts[userId].forEach(e => {
        if (e.u != undefined) {
            contacts.push(e.u);
        }
    });

    return contacts;
}

exports.getGroupsOfUser = function (userId) {
    let groups = {};

    chat.contacts[userId].forEach(e => {
        if (e.g !== undefined) {
            groups[e.g] = IdList.groups[e.g];
        }
    });
    return groups;
}

exports.getUsersOfGroup = function (groupId) {
    return chat.data[groupId].u;
}

exports.checkPasswordByName = function (username, password) {

    return bcrypt.compareSync(password, userdata[getIdByUsername(username)].p)
}

exports.checkPasswordById = function (userId, password) {
    return bcrypt.compareSync(password, userdata[userId].p)
}

exports.save = function () {
    fs.writeFileSync(mPath("/data/userdata.json"), JSON.stringify(userdata));
    fs.writeFileSync(mPath("/data/ID.json"), JSON.stringify(IdList));
    fs.writeFileSync(mPath("/data/chats.json"), JSON.stringify(chat));
}

exports.changePassword = function (userId, newPassword) {
    bcrypt.hash(newPassword, hashRounds, (err, hash) => {
        userdata[userId] = { n: username, p: hash };
    })
}

exports.changeNick = function (userId, newNick) {
    userdata[userId].n = newNick;
    IdList.users[userId] = newNick;
}

exports.newChat = function (userId, otherId) {
    chat.contacts[userId].push({ u: Number(otherId) });
    chat.contacts[otherId].push({ u: Number(userId), m: 1 });

    let { user1, user2 } = sortID(userId, otherId);

    chat.data[`${user1}_${user2}`] = [];

}

exports.editGroup = function (groupId, newName, newUserList, newDescription, userId) {
    console.log("editGroup", groupId, newName, newUserList, newDescription, userId);

    let group = chat.data[groupId];

    group.n = newName;
    group.d = newDescription;

    let userList = Object.keys(newUserList);
    let member;
    console.log("userListBefore:", userList);

    group.u.forEach((u, index) => {
        console.log(u, userList.includes(u));

        if (!userList.includes(u)) {
            console.log("remove:", u);

            chat.contacts[u].forEach((e, index) => {
                if (e.g == groupId) {
                    chat.contacts[u].splice(index, 1);
                }
            });
        }
        else {
            userList.splice(userList.indexOf(u), 1);
        }
    });



    for (e of userList) {
        chat.contacts[e].push({ g: groupId });
    }

    group.t.push([0, `${exports.getUserNameById(userId)} changed the group data`]);
    group.u = Object.keys(newUserList);

    console.log("userList:", userList);
    console.log("users:", group.u);

    IdList.groups[groupId] = newName;

    chat.data[groupId] = group;

}

exports.newGroup = function (groupName, groupUserList, groupDescription, creatorId) {
    IdList.groupCount++;
    let groupId = IdList.groupCount;
    IdList.groups[groupId] = groupName;

    chat.data[groupId] = { u: Object.keys(groupUserList), n: groupName, d: groupDescription, t: [[0, `${IdList.users[creatorId]} created the group: "${groupName}"`]] };
    for (e in groupUserList) {
        chat.contacts[e].push({ g: groupId, m: 1 })
    }

    return groupId;
}

exports.getGroups = function () {
    return IdList.groups;
}

function getIdByUsername(username) {
    let ret = -1;

    Object.entries(IdList.users).forEach(e => {
        if (e[1] == username) {
            ret = e[0];
        }
    })
    return ret;
}

function getIdbyGroupname(groupname) {
    let ret = -1;
    Object.entries(IdList.gropus).forEach(e => {
        if (e[1] == groupname) {
            ret = e[0];
        }
    })
    return ret;
}

/** sorts two IDs by numerical value {low,high}
 * @param {number} a 
 * @param {number} b 
 * @returns {number,number}
 */
function sortID(a, b) {
    if (a > b)
        return { a, b }
    else
        return { b, a }
}

/** joins a relative path to the process root path
 * @param {string} relativePath relative path 
 * @returns {string} global path
 */
function mPath(relativePath) {
    return path.join(process.cwd(), relativePath);
}

exports.getIdByUsername = getIdByUsername;
exports.getIdByGroupname = getIdByUsername;

exports.mPath = mPath;




