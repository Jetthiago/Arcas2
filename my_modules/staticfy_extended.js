/*
- pseudo
	- fileinfo: {
		- content
		- [mime]
		- [code]// ¨200¨ default
	}
*/


var staticfyExtended = {
	pseudo: function(request,response,fileinfo){
		if(!fileinfo.mime) fileinfo.mime = "text/plain";
		if(!fileinfo.code) fileinfo.code = 200;
		if(typeof fileinfo.content == "string") {
			response.writeHead(fileinfo.code, {"Content-Type": fileinfo.mime});
			response.end(fileinfo.content);
		}
	},
	codeTable: function(request,response){
		var fileinfo = {
			content: JSON.stringify(global.codeTable),
			mime: "application/json"
		}
		this.pseudo(request,response,fileinfo);
	}
}

module.exports = staticfyExtended;