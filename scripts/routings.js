path = require("path");
fs = require("fs");

module.exports = function(app){

    app.get("/",(req,res)=>{
        res.sendFile(mPath("/client/html/index.html"));
    });

}

function mPath(_path){
    return path.join(process.cwd(),_path);
}