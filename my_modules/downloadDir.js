/* 
var fs = require("fs");
var path = require("path");
var async = require("async");
*/
var downloadDir = function(myPath){
    var stats, result = 0, newPath;
    for(var i = 0; true; i++){
        newPath = path.join(myPath, i.toString());
        console.log("new path:" + newPath);
        try{
            stats = fs.statSync(newPath);
            if(!stats.isDirectory()){
                result = i;
                break;
            }
        } catch(err){
            result = i;
            break;
        }
    }
    fs.mkdirSync(newPath);
    return newPath;
}

module.exports = downloadDir;