var socket = io();

var userId, users, groups, contacts, activeChat,nickName;
var isGroup = false;

socket.on("connection",()=>{
    console.log("connected");
    if(userId !== undefined){
        socket.emit("reLogin",userId,nickName);
    }
});

function documentLoad(){

    $(".hoveringMenu").hide();

    handleSideBar();

    handleLogin();

    $(document).on("click",".chatSelector",e =>{
        loadChat(e.currentTarget.getAttribute("idval"));
    });

    $(document).on("click",".groupSelector",e =>{
        loadGroup(e.currentTarget.getAttribute("idval"));
    })

    $("#sendInput").on("click",() =>{
        text = $("#mainInput").text();
        $("#mainInput").html("");
        
        if(!text==""){            
            sendMessage(text);
        }
    })

    $("#mainInput").on("keydown",e =>{
        if(e.originalEvent.key === "Enter" && !e.originalEvent.shiftKey){
            $("#sendInput").trigger("click");
            e.preventDefault();
        }
        
    });

    $("#searchInput").on("input",e =>{
        
        $(".chatTitle").each((index,item)=>{
                  
            if (!$(item).text().toUpperCase().includes($("#searchInput").val().toUpperCase())){
                $(item).parent().hide();
            }
            else{
                $(item).parent().show();
            }
        })
    });

}

function loadUser(nickname){
    nick = nickname;
    socket.emit("loadUser",nick);
}

function loadChat(id){
    if(id != activeChat.id){
        socket.emit("loadChat",id);
        
        $(`.activeChat`).removeClass("activeChat").addClass("chat");
        $(`.chatSelector[idval="${id}"]`).removeClass("chat chatWithMessage").addClass("activeChat");
    }
    else if (isGroup){
        socket.emit("loadChat",id);
        
        $(`.activeChat`).removeClass("activeChat").addClass("chat");
        $(`.chatSelector[idval="${id}"]`).removeClass("chat chatWithMessage").addClass("activeChat");
    }
}

function loadGroup(id){
    if(id != activeChat.id){
        socket.emit("loadGroup",id);

        $(`.activeChat`).removeClass("activeChat").addClass("chat");
        $(`.groupSelector[idval="${id}"]`).removeClass("chat chatWithMessage").addClass("activeChat");   
    }
    else if(!isGroup){
        socket.emit("loadGroup",id);

        $(`.activeChat`).removeClass("activeChat").addClass("chat");
        $(`.groupSelector[idval="${id}"]`).removeClass("chat chatWithMessage").addClass("activeChat");   
    }
}

socket.on("loadUser",(id,contactList,userList,groupList)=>{    

    userId=id;
    users = userList;
    groups = groupList;
    contacts = contactList;

    $("#characterName").text(users[userId]);
    
    if (contactList.length > 0){
        
        if (contactList[0].u !== undefined){
            socket.emit("loadChat",contactList[0].u);
        }
        else{
            socket.emit("loadGroup",contactList[0].g);
        }
    }
    $("#chatSelection").html("");
    
    contactList.forEach((e,index)=>{
        
        if(index == 0){
            (e.u !== undefined) ? addChatSelector(e.u,"activeChat"): addGroupSelector(e.g,"activeChat");
        }
        else{
            if(e.m === undefined){
                (e.u !== undefined) ? addChatSelector(e.u,"chat"): addGroupSelector(e.g,"chat");
            }
            else{
                (e.u !== undefined) ? addChatSelector(e.u,"chatWithMessage"): addGroupSelector(e.g,"chatWithMessage");
            }
        }
    })
});

socket.on("loadChat",(chatData,id)=>{    
    isGroup = false;
    activeChat = {data: chatData, id: id};
    loadMessages(chatData,false);

    $("#groupDescription").hide();
    $("#groupName").text(users[id]).css("margin","15px 15px");

    scrollToBottom(0);
});

socket.on("loadGroup",(groupData,id)=>{        
    isGroup = true;
    activeChat = {data: groupData, id: id};
    loadMessages(groupData.t,true);

    $("#groupName").text(groupData.n).css("margin","7px 15px 2px 15px ");
    $(`.groupSelector[idval="${id}"] p`).text(groupData.n);
    $("#groupDescription").text(groupData.d).show();
    
    scrollToBottom(0);
});

socket.on("chatMessage",(chatId,text)=>{        
    if(!isGroup && chatId == activeChat.id){
        addOthersMessage(text,50);
        scrollToBottom(50);
    }
    else{
        $(`.chatSelector[idval="${chatId}"]`).attr("class","chatSelector chatWithMessage");
    }
});

socket.on("adminMessage",(chatId,text,group)=>{
    if(group!=undefined && group){
        if(isGroup && chatId == activeChat.id){
            addAdminMessage(text);
            scrollToBottom(50);
        }
        else{
            $(`.groupSelector[idval="${chatId}"]`).attr("class","chatSelector chatWithMessage");
        }
    }
    else{
        if(!isGroup && chatId == activeChat.id){
            addAdminMessage(text);
            scrollToBottom(50);
        }
        else{
            $(`.chatSelector[idval="${chatId}"]`).attr("class","chatSelector chatWithMessage");
        }
    }
    
});

socket.on("groupMessage",(groupId,writerId,text)=>{
    if (isGroup && groupId == activeChat.id){
        addOthersMessage(text,50,users[writerId]);
        scrollToBottom(50);
    }
    else{
        $(`.groupSelector[idval="${groupId}"]`).attr("class","groupSelector chatWithMessage");
    }
});

socket.on("newChat",(senderId,senderName)=>{    
    users[senderId] = senderName;
    if(activeChat == undefined){
        addChatSelector(senderId,"chat");
        socket.emit("loadChat",senderId);
        $(`.chatSelector[idval="${senderId}"]`).removeClass("chat chatWithMessage").addClass("activeChat");
    }
    else{
        addChatSelector(senderId,"chatWithMessage");
    }

    contacts.push({u:senderId});
});

socket.on("removeGroup",(groupId)=>{
    $(`.groupSelector[idval=${groupId}]`).remove();
    contacts.forEach((e,index) =>{
        if(e.g != undefined && e.g == groupId){
            contacts.splice(index,1);
        }
    });
    if(isGroup && activeChat.id == groupId){
        if (contacts[0].g != undefined){
            loadGroup(contacts[0].g);
        }
        else{
            loadChat(contacts[0].u);
        }
    }
});

socket.on("newGroup",(newUsers,groupId,groupName)=>{
    groups[groupId] = groupName;
    users = newUsers;
    if (activeChat == undefined){
        addGroupSelector(groupId,"chat");
        socket.emit("loadGroup",groupId);
        $(`.groupSelector[idval="${groupId}"]`).removeClass("chat chatWithMessage").addClass("activeChat");
    }
    else{
        addGroupSelector(groupId,"chatWithMessage");
    }
    contacts.push({g:groupId});

});

socket.on("editGroup",(groupId,groupName)=>{    
    if(isGroup && activeChat.id == groupId){
        socket.emit("loadGroup",groupId);
    }
    else{
        $(`.groupSelector[idval="${groupId}"]`).removeClass("chat").addClass("chatWithMessage");
    }
    $(`.groupSelector[idval="${groupId} p"]`).text(groupName);
});

function sendMessage(text){    
    if(!isGroup){
        socket.emit("sendChatMessage",text,activeChat.id);
    }
    else{
        socket.emit("sendGroupMessage",text,activeChat.id);
    }
    addWriterMessage(text,50);
    scrollToBottom(50);
}

function loadMessages(messages, isGroup){
    $("#chatList").html("");

    if(!isGroup){
        messages.forEach((message)=>{
            text = message[1];
            writer = message[0];
            if (userId == writer){
                addWriterMessage(text,0);
            }
            else if(writer == 0){
                addAdminMessage(text);
            }
            else{
                addOthersMessage(text,0);
            }
        });

    }
    else{
        messages.forEach((message)=>{
            writer = message[0];
            text = message[1];
            if (writer == userId){
                addWriterMessage(text,0);
            }
            else if(writer == 0){
                addAdminMessage(text);
            }
            else{
                addOthersMessage(text,0,users[writer])
            }
        });
    }



}

function addWriterMessage(text,animationTime){
    let $message = $(`<div class="message writerMessage"><p>${text}</p></div>`).hide();
    $("#chatList").append($message);
    $message.show(animationTime);
}

function addOthersMessage(text,animationTime,name){ 
    if(name===undefined){
        let $message = $(`<div class="message othersMessage"><p>${text}</p></div>`).hide();
        $("#chatList").append($message);
        $message.show(animationTime);
    }
    else{
        let $message = $(`<div class="message othersMessage"><span class="senderName">${name}</span><p>${text}</p></div>`).hide();
        $("#chatList").append($message);
        $message.show(animationTime);
    }   
}

function addAdminMessage(text){
    $("#chatList").append(`<div class="message adminMessage"><p>${text}</p></div>`);
}

function addChatSelector(chatId, className){    
    $("#chatSelection").append(`<li class="${className} chatSelector" idval="${chatId}"><p class="chatTitle"> ${users[chatId]}</p></li>`);
}

function addGroupSelector(groupId,className){    
    $("#chatSelection").append(`<li class="${className} groupSelector" idval="${groupId}"><p class="chatTitle"> ${groups[groupId]}</p></li>`);
}

function scrollToBottom(time){
    $(".mainField-chat").animate({
        scrollTop:$(".mainField-chat")[0].scrollHeight
    },time);
    //$(".mainField-chat").scrollTop($(".mainField-chat")[0].scrollHeight);
}
