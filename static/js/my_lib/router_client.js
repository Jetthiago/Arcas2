var requestModel = {
	isPost: Boolean,
	post: Object,
	url: String,
	auth: Number, // 
	user: String,
	status: Number,
	contentType: String,
	type: String
},
regexp = {
	query: /\?/
}

var router_client = {
	createRequest: function(input){
		var that = this;
		var newRequest = function(inputData){
			var url;
			if(inputData.url){
				url = inputData.url.replace("#","");
				if(url) {
					if(regexp.query.test(url)){
						url += "&router_req=true";
					} else {
						url += "?router_req=true";
					}
					
				}
			}
			this.isPost = inputData.isPost || false;
			this.post = inputData.post || requestModel.post();
			if(url){
				this.url = url;
			} else {
				if(regexp.query.test(location.hash)){
					this.url = new String(location.hash).replace("#", "") + "&router_req=true";
				} else {
					this.url = new String(location.hash).replace("#", "") + "?router_req=true";
				}
			}
			this.auth = that.auth.get().auth || requestModel.auth();
			this.user = that.auth.get().user || requestModel.user();
			this.status = inputData.status || requestModel.status(200);
			this.contentType = inputData.contentType || requestModel.contentType();
			this.type = inputData.type || requestModel.type();
		}
		var request = new newRequest(input);
		/*consReq = request;
		consReq.post = null;
		console.info("Sending request: "+JSON.stringify(consReq,undefined,"\t"));*/
		var xhttp = XHTTP;
		if(request.isPost){
			/*$.ajax({
				type: "POST",
				url: request.url,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				data: request.post,
				async: true,
				sucess: router_client.handleResponse,
				error: function(xhr, status, error){return console.error(error)}
			});*/
			console.debug("posting");
			xhttp.post(request, "json", this.handleResponse);
		} else {
			xhttp.get(request, "json", this.handleResponse);
			//xhttp.ajax(request, this.handleResponse);
		}
	},
	auth: {get: function(){return {auth: 0, user: ""}}},
	handleResponse: function(response,callback){
		if(typeof response == "string") response = JSON.parse(response);
		//console.debug(response);
		// smartify this status line, most likely with a callback;
		if(response.status == 403) router_client.hashHandler("/login");
		if(response.html) document.getElementById('body').innerHTML = response.html;
		if(response.title) document.title = response.title;
		if(response.auth){
			if(router_client.auth.get().auth != response.auth){
				router_client.auth = null;
				router_client.auth = new doAuth(response);
				router_client.changeLoginState(true);
			}
		} else {
			router_client.auth = {get: function(){return {auth: 0, user: ""}}}
			router_client.changeLoginState(false);
		}
		//console.debug("my auth: "+router_client.auth.get().auth);
		router_client.loadScripts();
		if(response.newUrl){
			if (location.hash == ("#/" + response.newUrl)){
				router_client.reload();
			} else {
				hasher.setHash(response.newUrl);
			}
		}
		if(response.message){
			// simple message, fades away
		}
		if(response.error){
			// error message, promp with button
		}
		if(callback) callback(response);
		setTimeout(function () {
			$("input")[0].focus();
		}, 100);
	},
	changeLoginState: function(logged){
		console.log("logged: "+logged)
		if(logged){
			$(".logout").removeClass("hidden");
			$(".login").addClass("hidden");
			$(".singup").addClass("hidden");
		} else {
			$(".logout").addClass("hidden");
			$(".login").removeClass("hidden");
			$(".singup").removeClass("hidden");
		}
	},
	reload: function(){
		router_client.hashHandler(location.hash);
	},
	watch: function(){
		hasher.changed.add(this.hashHandler);
		hasher.initialized.add(this.hashHandler);
		hasher.init();
		//hasher.setHash("foo");
	},
	hashHandler: function(newHash, oldHash){
		if(newHash){
			//var xhttp = XHTTP;
			//xhttp.get(newHash+"?router_req=true", "json", router_client.handleResponse);
			var request = {
				url: newHash,
				type: "get"
			}
			$(".active").removeClass("active");
			$(".navbar-brand").removeClass("navbar-brand-active");
			switch (request.url) {
				case "login": 
					$("#login").addClass("active");
					break;
				case "singup":
					$("#singup").addClass("active");
					break;
				case "downloaded":
					$("#navbar-downloaded").addClass("active");
					break;
				case "uploaded":
					$("#navbar-uploaded").addClass("active");
					break;
				case "configurations":
					$("#navbar-configurations").addClass("active");
					break;
				case "app":
					$(".navbar-brand").addClass("navbar-brand-active");
					break;
			
				default:
					//
					break;
			}
			router_client.createRequest(request);
		}
	},
	loadScripts: function(){
		var scripts = $("#body").find("script");
		for(var i = 0; i < scripts.length; i++){
			eval(scripts[i].text);
			if(scripts[i].src) $.getScript(scripts[i].src);
		}
	},
	getQuery: function(name){
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for(var i = 0; i < vars.length; i++){
			var pair = vars[i].split("=");
			if(decodeURIComponent(pair[0]) == name){
				console.log("Query " + name + " found");
				return decodeURIComponent(pair[1]);
			}
		}
		return false
	},
	setQuery: function(input, value){
		if(!value){
			var key = Object.keys(input)[0],
				value = input[key];
			window.location.search += "&"+key+"="+value;
		} else {
			if(typeof input == "string"){
				window.location.search += "&"+key+"="+value;
			}
		}
	},
	submiter: {
		post: function(event){
			event.preventDefault();
			var form = $("#body").find("form"),
				formArray = form.serializeArray(),
				canCont = true;
			for(var i = 0; i < formArray.length; i++){
				if(!formArray[i].value){
					$("input[name="+formArray[i].name+"]").addClass("error");
					canCont = false;
				} else {
					$("input[name="+formArray[i].name+"]").removeClass("error");
				}
			}
			if(canCont){
				router_client.createRequest({
					isPost: true,
					post: form.serialize()
				});
			}
		},
		postNoValidation: function (event) {
			event.preventDefault();
			var form = $("#body").find("form");
			router_client.createRequest({
				isPost: true,
				post: form.serialize()
			});
		}
	},
	event: {
		// methods declaration;
	}
}

var _ = PrivateParts.createKey();
function doAuth(response){
	_(this).auth = response.auth;
	_(this).user = response.user;
}
doAuth.prototype.get = function(){
	var out = {auth: _(this).auth, user: _(this).user};
	return out;
}
function doAuthAlt(response){
	this.auth = response.auth;
	this.user = response.user;
}
doAuthAlt.prototype.get = function(){
	var out = {auth: this.auth, user: this.user};
	return out;
}

if(location.hash == "") location.hash = "/login"
router_client.watch();
//hasher.setHash("landing"); // sets homepage on "/" request;
String.prototype.hashCode = function() {
	var hash = 0, i, chr, len;
	if(this.length === 0) return hash;
	if(this.toString() == "undefined") return hash;
	for(i = 0, len = this.length; i < len; i++){
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash;
};

/*
@hasher: 
	- https://github.com/millermedeiros/hasher/
@xhttp: 
	- http://www.w3schools.com/xml/ajax_intro.asp
	- http://www.w3schools.com/xml/dom_httprequest.asp
	- https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
@form: 
	- https://developer.mozilla.org/en-US/docs/Web/API/FormData

*/

// POST example
/*var http = new XMLHttpRequest();
var url = "get_data.php";
var params = "lorem=ipsum&name=binny";
http.open("POST", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        alert(http.responseText);
    }
}
http.send(params);*/