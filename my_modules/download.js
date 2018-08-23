/*var https = require("https"),
	http = require("http"),
	fs = require("fs")*/

var regSSL = /https/;

function save(response,file,callback){
	response.pipe(file);
	file.on("finish", function(){
		file.close(callback);
	});
}

function getDestFile(dest, pathUrl, response){
	var pathUrl = decodeURI(url.parse(pathUrl).pathname);
	pathUrl = pathUrl.split("/");
	pathUrl = pathUrl[pathUrl.length - 1];
	var thisMime = mime.getType(pathUrl);
	if (!thisMime) thisMime = "." + mime.getExtension(response.headers["content-type"]);
	else thisMime = "";
	var name = pathUrl + thisMime;
	if(!dest){
		dest = path.join(download.defaultDest, name);
	} else {
		var tempDir = fs.existsSync(path.join(download.defaultDest, dest));
		if(!tempDir){
			fs.mkdirSync(path.join(download.defaultDest, dest));
		}
		dest = path.join(download.defaultDest, dest, name);
	}
	var stream;
	try {
		stream = fs.createWriteStream(dest);
	} catch (error) {
		console.error("failed at stream");
	}
	return stream;
}

var download = {
	get: function(pathUrl, dest, callback){
		if(typeof(dest) == "function"){
			callback = dest;
			dest = undefined;
		}
		if(regSSL.test(pathUrl)){
			var request = https.get(pathUrl, function(response){
				file = getDestFile(dest, pathUrl, response);
				save(response,file,callback);
			}).on("error", function(err){
				fs.unlink(dest);
				if(callback) callback(err.message);
			});
		} else {
			var request = http.get(pathUrl, function(response){
				file = getDestFile(dest, pathUrl, response);
				save(response,file,callback);
			}).on("error", function(err){
				fs.unlink(dest);
				if(callback) callback(err.message);
			});
		}
	},
	defaultDest: "download"
}
module.exports = download;