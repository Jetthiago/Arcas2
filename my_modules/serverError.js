
var myConsole = require("./my_console.js"),
	console = new myConsole();

function serverError(err,request,response){
	response.writeHead(err.status || err.code || 500, {"Content-Type": "text/plain"});
	response.write(err.string);
	response.end(function(){
		console.error().server("handled, sended to client: "+ err.string);
	});
}

module.exports = serverError;