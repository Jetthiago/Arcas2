// Coded by Thiago Marques

// loading modules;
var moloader = require("moloader");
moloader.verbose = false;
moloader.load("fs, path, url, querystring")
	.loadDir("./my_modules","router_server.js")
	.loadPack();

// ultility variables;
var Staticfy = staticfy;
var Cookies = cookies;
var console = new myConsole();
/*
@ request: request from client
@ response: response to client
@ options{
	#static: path to static files;
}
*/
var routerServer = function(request,response,options){
	if(!options) var options = {static: "./"};
	this.request = request;
	this.response = response;
	this.options = options;
	this.events = {
		get: {},
		post: {}
	};
	this.eventsClient = {
		get: {},
		post: {}
	}
	this.initStack = [];
	staticfy = new Staticfy(options.static);
}
var proto = routerServer.prototype;

function addEvent(env, elm, meth, pathname, callback){
	if(typeof pathname != "string") return console.error("pathname must be a string");
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	pathname = new String(pathname);
	pathname = pathname.replace("/", "_");
	env[elm][meth] = callback;
	return env.elm;
}


// callback receive request and response and it must return it back;
// example: router.get("/", function(request, response, options));
proto.get = function(pathname, callback){
	if(typeof pathname != "string") return console.error("pathname must be a string");
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	pathname = new String(pathname);
	pathname = pathname.replace("/", "_");
	this.events.get[pathname] = callback;
}

proto.post = function(pathname, callback){
	if(typeof pathname != "string") return console.error("pathname must be a string");
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	pathname = new String(pathname);
	pathname = pathname.replace("/", "_");
	this.events.post[pathname] = callback;
}

proto.getClient = function(pathname, callback){
	if(typeof pathname != "string") return console.error("pathname must be a string");
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	pathname = new String(pathname);
	pathname = pathname.replace("/", "_");
	this.eventsClient.get[pathname] = callback;
}

proto.postClient = function(pathname, callback){
	if(typeof pathname != "string") return console.error("pathname must be a string");
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	pathname = new String(pathname);
	pathname = pathname.replace("/", "_");
	this.eventsClient.post[pathname] = callback;
}

// will run at the begin of the request processing receiving (request, response, options);
proto.run = function(callback){
	if(typeof callback != "function") return console.error("callback must be a function returnig (request, response, options)");
	this.initStack[initStack.length] = callback;
}

// executed at the end of events declaration;
proto.end = function(){
	var requestURL = url.parse(this.request.url),
		query = querystring.parse(requestURL.query),
		eventsData = {getKeys: [], postKeys: []},
		eventsClientData = { getKeys: [], postKeys: []},
		staticRequest = true;
	// executing function given on .run();
	for(var i = 0; i < this.initStack.length; i++){ this.initStack[i](this.request, this.response, this.options); }
	// getting keys from methods;
	if(this.request.method.toLowerCase() == "get"){
		requestURL.pathname = requestURL.pathname.replace("/","_");
		// if it is a request from browser custom router;
		if(query.router_req){
			for(var key in this.eventsClient.get){ eventsClientData.getKeys[eventsClientData.getKeys.length] = key; }
			for(var foo = 0; foo < eventsClientData.getKeys.length; foo++){
				if(eventsClientData.getKeys[foo] == requestURL.pathname){
					this.eventsClient.get[requestURL.pathname](this.request,this.response,this.options);
					staticRequest = false;
					break;
				}
			}
		} else {
			for(var key in this.events.get){ eventsData.getKeys[eventsData.getKeys.length] = key; }
			for(var foo = 0; foo < eventsData.getKeys.length; foo++){
				if(eventsData.getKeys[foo] == requestURL.pathname){
					this.events.get[requestURL.pathname](this.request,this.response,this.options);
					staticRequest = false;
					break;
				}
			}
		}
	// on post method;
	} else if(this.request.method.toLowerCase() == "post"){
		requestURL.pathname = requestURL.pathname.replace("/","_");
		// if it is a request from browser custom router;
		if(query.router_req){
			for(var key in this.eventsClient.post){ eventsClientData.postKeys[eventsClientData.postKeys.length] = key; }
			for(var foo = 0; foo < eventsClientData.postKeys.length; foo++){
				if(eventsClientData.postKeys[foo] == requestURL.pathname){
					this.eventsClient.post[requestURL.pathname](this.request,this.response,this.options);
					staticRequest = false;
					break;
				}
			}
		} else {
			for(var key in this.events.post){ eventsData.postKeys[eventsData.postKeys.length] = key; }
			for(var foo = 0; foo < eventsData.postKeys.length; foo++){
				if(eventsData.postKeys[foo] == requestURL.pathname){
					this.events.post[requestURL.pathname](this.request,this.response,this.options);
					staticRequest = false;
					break;
				}
			}
		}
	}
	if(staticRequest) staticfy.serve(this.request,this.response);
	if(!staticRequest) {
		console.router_server("request for :"+requestURL.pathname);
	};
}


module.exports = exports = routerServer;

function isJSON(string){
	try{
		var result = JSON.parse(string);
	} catch(e){
		return e;
	} return result;
}

Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {         
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};
/*
if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}*/