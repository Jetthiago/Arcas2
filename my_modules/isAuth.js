/*
// test with box drawing:
Receives the auth from sessionne.checkUser and handle errors, unauthorized request or else:
└─arguments: (err, auth, request, response, input, callback);
  ├─err: if null, the code continues, else serverError is called;
  ├─auth: number from sessionne;
  ├─input: can be a object for ¨createResponse¨ or a callback;
  │ ├─input as object is a convenience for callbacks that just need to respond with no handling
  │ └─ but as just a request for a resource that is protected from unauthorized request;
  └─callback: if input is a object then callback is called;
*/

var myConsole = require("./my_console.js"),
	console = new myConsole();

function isAuth(err, auth, request, response, input, callback) {
	if (typeof input == "function") callback = input;
	if (err) {
		var data = new createResponse(request, response, {
			error: err,
			status: 500,
			html: "Auth error"
		});
		serverError(data, request, response);
	} else if (typeof input == "function" && (auth == 0 || auth == -1)) {
		var data = new createResponse(request, response, {
			newUrl: "login",
			status: 403
		});
		console.server("user denied, sending it to login page");
		response.writeHead(data.status, data.contentType);
		response.end(data.string);
	} else if (typeof input == "object" && (auth == 0 || auth == -1)) {
		var data = new createResponse(request, response, input);
		console.server("providing page to user to login or singup");
		response.writeHead(data.status, data.contentType);
		response.end(data.string);
	} else if (typeof input == "object" && (auth != 0 || auth != -1) && input.newUrl == -1) {
		delete input.newUrl;
		var data = new createResponse(request, response, input);
		response.writeHead(data.status, data.contentType);
		response.end(data.string);
	} else if (typeof input == "object" && (auth != 0 || auth != -1)) {
		var data = new createResponse(request, response, {
			newUrl: "app"
		});
		response.writeHead(data.status, data.contentType);
		response.end(data.string);
	} else {
		callback(true);
	}
}


module.exports = isAuth;