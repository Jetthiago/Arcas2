/* 
This module creates a new directory following the 
order of other existing directories. 
It is used when a user makes a request to download several
files whilst not giving a name to the new directory.
*/
var genDirectories = function(myPath){
    var stats, result = 0, newPath;
    for(var i = 0; true; i++){
        newPath = path.join(myPath, i.toString());
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

module.exports = genDirectories;
