/*
├	└	─
XHTTP.get
├─path: can be a ¨newRequest¨ object or a string of the pathname;
├─type: pass a 'json' string to return a parsed JSON to the callback or pass a function to return the responseText to the callback;
└─callback: if a function as already passed to type, this arg doesnt exits anymore;

XHTTP.post
├─input: needs to be a ¨newRequest¨ object or {url: (path to post), post: (can be a object or a querystring, mime will be handled)}
├─type: pass a 'json' string to return a parsed JSON to the callback or pass a function to return the responseText to the callback;
└─callback: if a function as already passed to type, this arg doesnt exits anymore;

XHTTP.ajax
├─request: can be a ¨newRequest¨ object or {type: (http method), url: (pathname), contentType: (mime)}, the full body of the object will be send to server;
└─callback: called only if the request was a success;

XHTTP.getSync
└─path: self-explanatory;

XHTTP.postSync
├─path: self explanatory;
└─post: data to be sent to server, only accepts querystrings;
*/

function handleResponse(method, path, type, xhttp, callback){
	if(xhttp.status == 200){
		console.log("Navigated to "+path.replace("?router_req=true",""));
		if(type == "json"){
			callback(isJSON(xhttp.responseText));
		} else {
			callback(xhttp.responseText);
		}
	} else if(xhttp.status == 403){
		console.warn("Authorization failed going to login page");
		if(type == "json"){
			callback(isJSON(xhttp.responseText));
		} else {
			callback(xhttp.responseText);
		}
	} else {
		console.error("Can\'t "+method+" "+path+" err: "+xhttp.status);
		if(type == "json"){
			callback({status: xhttp.status, html: "Page not avaliable sorry. Error: "+xhttp.status+" "+isJSON(xhttp.responseText).html});
		} else {
			callback("Page not avaliable sorry. Error: "+xhttp.status+" "+xhttp.responseText);
		}
	}
}
function handleStateChange(method, path, type, xhttp, callback){
	switch (xhttp.readyState){
		case 0: // created .open();
		case 1: // .open() called;
		case 2: // .send() called, headers and status avaliable;
		case 3: // downloading, responseText holds partial data;
		break;
		case 4: // completed;
		handleResponse(method, path, type, xhttp, callback);
		break;
		default: error();
	}
}

function isJSON(string){
	try{
		var result = JSON.parse(string);
	} catch(e){
		return e;
	} return result;
}

var XHTTP = {
	/*_-_-_-_-_-_-_-_-_-_-XHTTP_-_-_-_-_-_-_-_-_-_-*/
	textXhttp: null,
	jsonXhttp: null,
	get: function(path,type,callback){
		if(typeof path == "object"){
			var req = path;
			path = req.url;
		}
		if(typeof type == "function") {
			callback = type;
			type = undefined;
		}
		var xhttp = new XMLHttpRequest();		
		xhttp.onreadystatechange = function(){
			handleStateChange("get", path, type, xhttp, callback)
		};
		xhttp.open("GET", path, true);
		xhttp.send();
	},
	post: function(input, type, callback){
		if(typeof input == "object"){
			var req = input;
			input = req.url;
		} /*else {
			input = input.replace("#","");
		}*/
		if(typeof type == "function") callback = type;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			handleStateChange("post", input, type, xhttp, callback)
		};
		xhttp.open("POST", input, true);
		if(typeof req.post == "string") xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
		else if(typeof req.post == "object") {
			xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
			req.post = JSON.stringify(req.post);
		}
		//if(!req) var req = {};
		xhttp.send(req.post);
	},
	ajax: function(request, callback){
		$.ajax({
			type: request.type,
			url: request.url,
			contentType: request.contentType,
			data: request,
			async: true,
			sucess: callback,
			error: function(xhr, status, error){return console.error(error)}
		});
	},
	getSync: function(path){
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", path, false);
		xhttp.send(null);
		if(xhttp.status == 200){
			return xhttp.responseText;
		} else {
			console.error("Can\'t get "+path+" err: "+xhttp.status);
			return "Page not avaliable, error: "+xhttp.status;
		}
	},
	postSync: function(path,form){
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", path, false);
		xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=utf-8");
		xhttp.send(form);
		if(xhttp.status == 200){
			return xhttp.responseText;
		} else {
			console.error("Can\'t post "+path+" err: "+xhttp.status);
			return "Page not avaliable, error: "+xhttp.status;
		}
	}/*,
	requestXhttpSync: function(name,result){
		if(!result) result = "Object";
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", name, false);
		xhttp.send(null);
		if(xhttp.status == 200){
			if(result == "Object"){
				return this.isJSON(xhttp.responseText);
			}
			else if(result == "String"){
				return xhttp.responseText;
			}
		}
	},
	requestXhttp: function(name,type,callback){
		if(!type) type = "Object" // or String or NonJSON
		var xhttp = new XMLHttpRequest(),
			that = this;
		function handlerResponse(status, text){
			console.log("File received, named: "+name);
			if(status == 200){
				that.textXhttp = text;
				if(type != "NonJSON")
					var parsed = JSON.parse(text);
			}

			if(callback) {
				if(type == "Object")
					callback(parsed);
				else if(type == "String")
					callback(text);
				else if(type == "NonJSON")
					callback(text);
			}
		}
		function handlerStateChange(){
			switch (xhttp.readyState){
				case 0: // unitialized
				case 1: // loading
				case 2: // loaded
				case 3: // interactive
				break;
				case 4: // completed
				handlerResponse(xhttp.status, xhttp.responseText);
				break;
				default: error();
			}
		}
		xhttp.onreadystatechange = handlerStateChange;
		xhttp.open("GET", name, true);
		xhttp.send();
	},
	testXhttp: function(text){
		if(!text) console.log(this.requestXhttpAsync("../xhttp/menu/9200.txt", "String"));
		console.log(text);
	}*/
}

/*function updateProgress(evt) 
{
   if (evt.lengthComputable) 
   {  //evt.loaded the bytes browser receive
      //evt.total the total bytes seted by the header
      //
     var percentComplete = (evt.loaded / evt.total)*100;  
     $('#progressbar').progressbar( "option", "value", percentComplete );
   } 
}  

function sendreq(evt) 
{  
    var req = new XMLHttpRequest(); 
    $('#progressbar').progressbar();    
    req.onprogress=updateProgress;
    req.open('GET', 'test.php', true);  
    req.onreadystatechange = function (aEvt) {  
        if (req.readyState == 4) 
        {  
             //run any callback here
        }  
    };  
    req.send(); 
}*/