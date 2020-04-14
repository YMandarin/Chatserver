var sideBarActive = false;
var sideBarChangedGroupCreation = false;
var groupUser = {u1:{},u2:{}};
var sideBarOpen = "";

function handleSideBar(){
    $(".sideBar").hide();

    hideAllParts();

    setSideBarScrollSize();

    $("#sideBarCloseButton").on("click",()=>{
        sideBarActive = false;
        sideBarOpen = "";
        $(".sideBar").hide(100);
    });

    let characterMenuOpened = false;

    $("#characterMenu").on("click",()=>{
        characterMenuOpened = !characterMenuOpened;

        if(characterMenuOpened){
            $(".hoveringMenu").show(100);

            setTimeout(()=>{
                $("#main").one("click",()=>{
                    $(".hoveringMenu").hide(100);
                });
            },1);

        }
    });

    $(".hoveringMenuButton:contains('Profile')").on("click",()=>{
        showAccount();
        showSideBar();
    });
    $(".hoveringMenuButton:contains('Log out')").on("click",()=>{
        reLogin();
        socket.emit("logOut");
    });
    $(".hoveringMenuButton:contains('New chat')").on("click",()=>{
        showCreateChat();
        showSideBar();
    });

    $("#characterNewChat").on("click",()=>{
        showCreateChat();
        showSideBar();
    })

    $("#characterName").on("click",()=>{
        showAccount();
        showSideBar();
    })

    $("#sideBarCreateGroupButton").on("click",()=>{
        showCreateGroup();
    });

    $("#sideBarNewChatButton").on("click",()=>{
        showCreateChat();
    });

    $("#sideBarGroupCreationNext").on("click",()=>{
        sideBarOpen = "groupSecond";

        setSideBarScrollSize();

        if(sideBarChangedGroupCreation){
            $("#sideBarTitle").text("Name");
        }
        else{
            $("#sideBarTitle").text("set Name and Description");
        }
        if(Object.keys(groupUser.u1).length > 0){
            $("#sideBarGroupCreation").hide();
            $("#sideBarGroupCreationSecond").show();
        }
        else{
            $("#sideBarMemberError").show();
            $("#sideBarMemberError").text("group needs a member");
            setSideBarScrollSize();
        }
        
    });

    $("#sideBarGroupCreationSecondBackButton").on("click",(e)=>{
        sideBarOpen = "group";
        $("#sideBarGroupCreation").show();
        $("#sideBarGroupCreationSecond").hide();

        if(sideBarChangedGroupCreation){
            $("#sideBarTitle").text("Member");
        }
        else{
            $("#sideBarTitle").text("add Member");
        }
    });

    $("#sideBarCreateGroup").on("click",()=>{
        
        if($("#sideBarGroupNameInput").val() != ""){
            $(".sideBar").hide(100);
            sideBarOpen = "";
            if(sideBarChangedGroupCreation){
                $("#groupName").text($("#sideBarGroupNameInput").val());
                $(`.groupSelector[idval="${activeChat.id}"] p`).text($("#sideBarGroupNameInput").val());
                groups[activeChat.id] = $("#sideBarGroupNameInput").val();
                
                $("#groupDescription").text($("#sideBarGroupDescription").text());
                socket.emit("editGroup",activeChat.id,$("#sideBarGroupNameInput").val(),groupUser.u1,$("#sideBarGroupDescription").text());
            }
            else{
                groupUser.u1[userId] = nickName;
                $(".activeChat").removeClass("activeChat").addClass("chat");
                activeChat = undefined;
                socket.emit("newGroup",$("#sideBarGroupNameInput").val(),groupUser.u1,$("#sideBarGroupDescription").text());
            }
        }
        else{
            $("#sideBarGroupNameError").show();
            $("#sideBarGroupNameError").text("name can't be empty");
            setSideBarScrollSize();
        }
    });

    $("#sideBarGroupNameInput").on("keydown",()=>{
        $("#sideBarGroupNameError").hide();
        setSideBarScrollSize();
    })

    $("#groupName").on("click",()=>{
        if(isGroup){
            showEditGroup();
        }
    });

    $("#sideBarNick").on("keydown",()=>{
        $("#sideBarCheckPassword").show(100);
        $("#sideBarCheckNickError").hide(100);
    });

    $("#sideBarCheckPasswordInput").on("click",()=>{
        $("#sideBarCheckPasswordError").hide(100);
    });

    $("#sideBarSaveCheckPassword").on("click",()=>{
        let nick = $("#sideBarNick").val();
        let password = $("#sideBarCheckPasswordInput").val();

        if(removeWhitespace(nick) == ""){
            sideBarShowError("#sideBarCheckNickError","nick can't be empty");
        }
        if(removeWhitespace(nick)==""){
            sideBarShowError("#sideBarCheckPasswordError","password can't be empty");
        }
        else if(removeWhitespace(nick) != ""){
            socket.emit("changeNick",nick,password);
        }
        
    });

    $("#sideBarChangePassword").on("click",()=>{
        $("#sideBarPasswordOld").show(100);
    });

    $("#sideBarSaveOldPassword").on("click",()=>{
        password = $("#sideBarOldPassword").val();
        if(removeWhitespace(nick) == ""){
            sideBarShowError("#sideBarNewPasswordError","password can't be empty");
        }
        else{
            socket.emit("changePasswordCheck",password);
        }
    });

    $("#sideBarSaveNewPassword").on("click",()=>{
        password = $("#sideBarOldPassword").val();
        password2 =$("#sideBarNewPassword").val();
        if (removeWhitespace(password)==""){
            sideBarShowError("#sideBarNewPasswordError","password can't be empty");
        }
        else if (password !== password2){
            sideBarShowError("#sideBarNewPasswordError","passwords must be identical");
        }
        else{
            socket.emit("changePassword",password);
            $("#sideBarPasswordNew").hide(100);
            $("#sideBarPasswordOld").hide(100);
            $("#sideBarOldPassword").val("");
            $("#sideBarNewPassword").val("");
        }
    });

    $("#sideBarOldPassword").on("keydown",()=>{
        $("#sideBarNewPasswordError").hide(100);
    });

    $("#sideBarNewPassword").on("keydown",()=>{
        $("#sideBarNewPasswordError").hide(100);
    });

    $("#sideBarCreateGroupSearchInput").on("input", event =>{        
        for (e of $(".sideBarPossibleUser")){
            if(!e.innerText.toUpperCase().includes($("#sideBarCreateGroupSearchInput").val().toUpperCase())){
                $(e).hide(10);
            }
            else{
                $(e).show(10);
            }
        }
    });

    $("#sideBarCreateGroupSearchInput").on("keydown",event =>{
        if(event.originalEvent.key == "Enter"){
            $(".sideBarPossibleUser").hide(10);
            socket.emit("searchDirectly","group",$("#sideBarCreateGroupSearchInput").val())
        }
    });

    $("#sideBarCreateGroupSearchButton").on("click",()=>{
        $(".sideBarPossibleUser").hide(10);
        socket.emit("searchDirectly","group",$("#sideBarCreateGroupSearchInput").val())
    });

    $("#sideBarNewChatSearchInput").on("input",()=>{        
        for (e of $(".sideBarChatOnlineUser")){            
            if(!e.innerText.toUpperCase().includes($("#sideBarNewChatSearchInput").val().toUpperCase())){
                $(e).hide(10);
            }
            else{
                $(e).show(10);
            }
        }
    });

    $("#sideBarNewChatSearchInput").on("keydown",event=>{
        if(event.originalEvent.key == "Enter"){                        
            socket.emit("searchDirectly","chat",$("#sideBarNewChatSearchInput").val())
        }
    });

    $(document).on("click",".sideBarAddPossibleUser",e=>{

        let id = $(e.currentTarget).parent().attr("idval");
        
        $(`.sideBarPossibleUser[idval="${id}"]`).remove();
        
        addNewGroupMember(id,users[id]);

        delete groupUser.u2[id];
        groupUser.u1[id] = users[id];

        $("#sideBarMemberError").hide();
        setSideBarScrollSize();
    });

    $(document).on("click",".sideBarRemovePossibleUser",e =>{

        let id = $(e.currentTarget).parent().attr("idval");

        $(`.sideBarAddedUser[idval="${id}"]`).remove();
        addPossibleOnlineUser(id,users[id]);
        
        delete groupUser.u1[id];
        groupUser.u2[id] =  users[id];
        setSideBarScrollSize();
    });

    $(document).on("click",".sideBarChatOnlineUser",e =>{
        let id = $(e.currentTarget).attr("idval");
        let created = false;        
        for (contact of contacts){
            if(contact.u != undefined && String(contact.u) == String(id)){
                created = true;
            }
        }
        if(!created){
            socket.emit("newChat",id);
            users[id] = $(e.currentTarget).text();
            addChatSelector(id,"chat");
            contacts.push({u:id});
        }

        if(activeChat == undefined){
            socket.emit("loadChat",id);
            $(`.chatSelector[idval="${id}"]`).removeClass("chat chatWithMessage").addClass("activeChat");
        }
        else{
            $(`.chatSelector[idval=${id}]`).trigger("click");
        }
        
        $(".sideBar").hide(100);
        sideBarActive = false;        
    });

    socket.on("changeNick",(nick,password) =>{
        if(nick && password){
            users[userId] = $("#sideBarNick").val();
            $("#characterName").text($("#sideBarNick").val());
            $("#sideBarCheckPassword").hide(100);
        }
        else{
            if(!nick){
                sideBarShowError("#sideBarCheckNickError","nick taken");
            }
            if(!password){
                sideBarShowError("#sideBarCheckPasswordError","password wrong");
            }
        }
    });

    socket.on("changePasswordCheck",ok=>{
        if(ok){
            $("#sideBarOldPassword").attr("placeholder","insert new password");
            $("#sideBarOldPassword").val("");
            $("#sideBarSaveOldPassword").hide();
            $("#sideBarPasswordNew").show(100);
        }
        else{
            sideBarShowError("#sideBarNewPasswordError","password wrong");
        }
    });

    socket.on("chatOnlineUser",onlineUser =>{

        $("#sideBarOnlineUserList").html("");
        onlineUser.forEach(e=>{
            addChatOnlineUser(Object.keys(e)[0],Object.values(e)[0]);
        });
        setSideBarScrollSize();
    });

    socket.on("newGroupOnlineUser",onlineUser =>{
        users = {...onlineUser};
        delete onlineUser[userId];
        groupUser.u2 = {...onlineUser};

        $("#sideBarPossibleGroupMember").html("");
        $("#sideBarNewGroupMember").html("");

        for ([id,name] of Object.entries(onlineUser)){
            addPossibleOnlineUser(id,name);
        }
    });

    socket.on("editGroupOnlineUser",(groupMembers,onlineUser)=>{        
        users = Object.assign(users,{...onlineUser},{...groupMembers});
        
        groupUser.u2 = {...onlineUser};
        groupUser.u1 = {...groupMembers};

        $("#sideBarPossibleGroupMember").html("");
        $("#sideBarNewGroupMember").html("");

        for ([id,name] of Object.entries(onlineUser)){
            addPossibleOnlineUser(id,name);
        }

        for ([id,name] of Object.entries(groupMembers)){
            addNewGroupMember(id,name);
        }
    });

    socket.on("searchDirectly",(found,target,id,name)=>{   
        if(id != userId){
            if(found){
                users[id] = name;
                if(target=="group"){
                    if($(`.sideBarPossibleUser:contains("${name}")`).length == 0 && $(`.sideBarAddedUser:contains("${name}")`).length == 0){
                        addPossibleOnlineUser(id,name);
                    }
                    
                }
                else{
                    if($(`#sideBarOnlineUserList:contains("${name}")`).length == 0){
                        addChatOnlineUser(id,name);
                    }
                }
            }
        }     
    });

    $(window).on("resize",setSideBarScrollSize);
}

function setSideBarScrollSize(){
    if(sideBarActive){
        if (sideBarOpen == "group"){
            addedMembers = $("#sideBarNewGroupMember");
            possibleMembers = $("#sideBarPossibleGroupMember");

            addedMembersHeight = addedMembers[0].scrollHeight;
            possibleMembersHeight = possibleMembers[0].scrollHeight;
            
            if ($("#sideBarMemberError").is(":hidden")){
                subtract = 50 + 36*2 + 68;
            }
            else{
                subtract = 50 + 36*2 + 68 + 14.7;
            }

            height = $(window).height()- subtract;
            if($(window).height()<380){
                height = 380-subtract;
            }

            if(addedMembersHeight + possibleMembersHeight >= height){
                if(addedMembersHeight >= height/2 && possibleMembersHeight >= height/2){
                    addedMembers.css("max-height",`${height/2}px`);
                    possibleMembers.css("max-height",`${height/2}px`);
                }
                else if(addedMembersHeight >= height/2 && possibleMembersHeight < height/2){
                    addedMembers.css("max-height",`${height - possibleMembersHeight}px`);
                }
                else{            
                    possibleMembers.css("max-height",`${height - addedMembersHeight}px`);
                }
            }
        }

        else if (sideBarOpen == "chat"){
            userList = $("#sideBarOnlineUserList");
            let subtract = 50 + 40 + 52
            height = $(window).height() - subtract;
            if($(window).height() < 380){
                height = 380 - subtract;
            }

            if(userList[0].scrollHeight>= height){
                userList.css("max-height",`${height}px`);
            }
        }
        
        else if (sideBarOpen == "groupSecond"){
            
            
            
            let subtract = 0;
            if ($("#sideBarGroupNameError").is(":hidden")){
                subtract = 260;
            }
            else{
                subtract = 280;
            }

            let height = $(window).height();
            if (height < 380){
                height = 380;
            }
            
            $("#sideBarGroupDescription").css("max-height",`${height - subtract}px`);
        }
    }
}

function showSideBar(){
    $(".sideBarErrorMessage").hide();
    sideBarActive = true;
    $(".sideBar").show(100);    
}

function showAccount(){
    hideAllParts();
    $("#sideBarAccount").show();
    $("#sideBarCheckPassword").hide();

    $("#sideBarAccount .sideBarErrorMessage").hide();

    $("#sideBarPasswordOld").hide();
    $("#sideBarPasswordNew").hide();

    $("#sideBarTitle").text("Account");

    $("#sideBarNick").val(users[userId]);

    sideBarOpen = "account";
}

function showCreateChat(){
    socket.emit("chatOnlineUser");
    hideAllParts();
    $("#sideBarChatCreation").show(100);
    setTimeout(setSideBarScrollSize,2);

    $("#sideBarTitle").text("New chat");

    sideBarOpen = "chat";
}

function showCreateGroup() {
    socket.emit("newGroupOnlineUser");
    hideAllParts();
    $("#sideBarGroupCreation").show(100);
    setTimeout(setSideBarScrollSize,2);

    $("#sideBarTitle").text("add Member");
    
    $("#sideBarCreateGroupSearchInput").val("");
    $("#sideBarGroupNameInput").val("");
    $("#sideBarGroupDescription").text("");

    if(sideBarChangedGroupCreation){
        sideBarChangedGroupCreation = false;
        $("#sideBarCreateGroup").html('Create group<svg width="18" height="13" ><path d="M0 7 L17 7 L8 12 M17 7 L8 1"/></svg>');
        $("#sideBarNewChatButton").show();
    }

    sideBarOpen = "group";
}

function showEditGroup(){
    sideBarChangedGroupCreation = true;
    $(".sideBar").show(100);
    sideBarActive = true;
    hideAllParts();
    $("#sideBarGroupCreation").show();
    $("#sideBarTitle").text("Member");
    $("#sideBarNewChatButton").hide();

    $("#sideBarGroupMemberError").hide();
    $("#sideBarGroupNameError").hide();

    $("#sideBarMemberError").hide();
    $("#sideBarCreateGroup").text("save");
    
    socket.emit("editGroupOnlineUser",activeChat.id);
    
    $("#sideBarGroupNameInput").val(groups[activeChat.id]);
    $("#sideBarGroupDescription").text(activeChat.data.d);
    
}

function hideAllParts(){
    $("#sideBarAccount").hide();
    $("#sideBarChatCreation").hide();
    $("#sideBarGroupCreation").hide();
    $("#sideBarGroupCreationSecond").hide();
}

function addChatOnlineUser(id,name){
    $("#sideBarOnlineUserList").append(`<div class="sideBarOnlineUser sideBarChatOnlineUser" idval="${id}">${name}</div>`);
}

function addPossibleOnlineUser(id,name){
    $("#sideBarPossibleGroupMember").append(`<div class="sideBarOnlineUser sideBarPossibleUser" idval="${id}"><p>${name}</p><svg height="14" width="14" class="sideBarAddPossibleUser"><path d="M 7 0 L 7 14 M 0 7 L 14 7"/></svg></div>`);
}

function addNewGroupMember(id,name){
    $("#sideBarNewGroupMember").append(`<div class="sideBarOnlineUser sideBarAddedUser" idval="${id}"><p>${name}</p><svg height="14" width="14" class="sideBarRemovePossibleUser"><path d="M 0 7 L 14 7"/></svg></div>`);
}

function sideBarShowError(element,message){
    $(element).show(100);
    $(element).text(message);
}

