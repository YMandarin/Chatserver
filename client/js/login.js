function handleLogin(){
    

    let nickError = $("#loginNickErrorMessage");
    let passwordError = $("#loginPasswordErrorMessage");

    nickError.hide();
    passwordError.hide();

    let createAccount = false;

    $("#loginInputPassword2").hide();

    $("#main").css("filter", "blur(4px)");

    $("#loginButton").on("click",()=>{
        let nick = $("#loginInputNick").val();
        let password = $("#loginInputPassword").val();

        if(!createAccount){
            if(checkInput(nick,password)){
                socket.emit("login",nick,password); 
            }
        }
        else{
            let password2 = $("#loginInputPassword2").val();

            if(checkInput(nick,password)){
                if(password === password2){
                    socket.emit("createAccount",nick,password); 
                }
                else{
                    passwordError.show(100);
                    passwordError.text("passwords must be identical");
                }
            }
        }
    });

    $("#loginCreateAccount").on("click",()=>{
        if(!createAccount){
            $("#loginInputPassword2").show();
            createAccount = true;
            $("#loginCreateAccount").text("login");
            $("#loginButton").text("create Account");
        }
        else{
            $("#loginInputPassword2").hide();
            createAccount = false;
            $("#loginCreateAccount").text("create Account");
            $("#loginButton").text("login");
        }
        
    });

    $("#loginInputNick").on("keydown",(e)=>{
        if(e.originalEvent.key != "Enter"){
            nickError.hide();
        }
    });

    $("#loginInputPassword").on("keydown",(e)=>{
        if(e.originalEvent.key != "Enter"){
            passwordError.hide();
        }
        else{
            $("#loginButton").trigger("click");
        }
    });

    $("#loginInputPassword2").on("keydown",(e)=>{
        if(e.originalEvent.key != "Enter"){
            passwordError.hide();
        }
        else{
            $("#loginButton").trigger("click");
        }
    });


    socket.on("login",(nick)=>{
        loadUser(nick);
        nickName = nick;
        $("#loginScreen").hide();
        $("#main").css("filter", "none");
    });

    socket.on("loginError",(nick,password)=>{
        if (nick){
            nickError.show(100);
            nickError.text("This nick is not taken. Create an account!")
        }
        else if (password){
            passwordError.show(100);
            passwordError.text("incorrect password");
        }
    });

    socket.on("creationError",()=>{
        nickError.show();
        nickError.text("nick already taken");
    })

    function checkInput(nick,password){
        let ret = true;

        if (removeWhitespace(nick)==""){
            nickError.show(100);
            nickError.text("the nick can't be empty");
            ret = false;
        }
        
        if (removeWhitespace(password)==""){
            passwordError.show(100);
            passwordError.text("the password can't be empty");
            ret = false;
        }
        return ret;
    }
}

function removeWhitespace(string){
    return string.replace(/ /g,"");
}

function reLogin(){
    let nickError = $("#loginNickErrorMessage");
    let passwordError = $("#loginPasswordErrorMessage");

    nickError.hide();
    passwordError.hide();

    $("#main").css("filter", "blur(4px)");


    $("#loginScreen").show();
}