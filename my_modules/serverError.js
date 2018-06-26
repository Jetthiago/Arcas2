
var config = require("../config.json");
var myConsole = require("./my_console.js"),
	console = new myConsole(config.silent, config.debug);

function serverError(err,request,response){
	console.error(err);
	response.writeHead(err.status || err.code || 500, {"Content-Type": "text/plain"});
	response.write(err.string);
	response.end(function(){
		console.error().server("handled, sended to client: "+ err.string);
	});
}

module.exports = serverError;
