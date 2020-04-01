path = require("path");
fs = require("fs");

module.exports = function(app){

    app.get("/",(req,res)=>{
        res.sendFile(mPath("/client/html/index.html"));
    });

    app.get("/source/:type/:file",(req,res)=>{
        res.send(fs.readFileSync(mPath(`client/${req.params.type}/${req.params.file}`)));
    });

}

function mPath(_path){
    return path.join(process.cwd(),_path);
}