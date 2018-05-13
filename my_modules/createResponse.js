var responseModel = {
	html: String,
	title: String,
	newUrl: String,
	auth: Number, // encoded usernamerandip
	user: String,
	contentType: Object,
	status: Number,
	message: String,
	error: String
}
var Cookies = require("cookies");
var config = require("../config.json");
var keygrip = config.keygrip;
function createResponse(request,response,input){
	var cookies = new Cookies(request,response,{keys: keygrip});
	this.html = input.html || responseModel.html();
	this.title = input.title || responseModel.title();
	this.newUrl = input.newUrl || responseModel.newUrl();
	if(input.auth){
		this.auth = input.auth;
		cookies.set("auth", input.auth, {signed: true, httpOnly: true});
	} else {
		this.auth = cookies.get("auth",{signed:true}) || 0;
	}
	if(input.user){
		this.user = input.user;
		cookies.set("user", input.user, {signed: true, httpOnly: true});
	} else {
		this.user = cookies.get("user",{signed:true}) || "";
	}
	this.user = input.user || responseModel.user();
	this.status = input.status || responseModel.status(200);
	this.contentType = input.contentType || {"Content-Type": "application/json"};
	this.error = input.error || responseModel.error();
	this.string = JSON.stringify(this);
	return this;
}
var proto = createResponse.prototype;
/*
proto.setHtml = function(html){
	if(typeof html == typeof responseModel.html()) this.html = html;
}
proto.setTitle = function(title){
	if(typeof title == typeof responseModel.title()) this.title = title;
}
proto.setNewUrl = function(newUrl){
	if(typeof newUrl == typeof responseModel.newUrl()) this.newUrl = newUrl;
}
proto.setAuth = function(auth){
	if(typeof auth == typeof responseModel.auth()) this.auth = auth;
}
proto.setUser = function(user){
	if(typeof user == typeof responseModel.user()) this.user = user;
}
proto.setStatus = function(status){
	if(typeof status == typeof responseModel.status()) this.status = status;
}*/
proto.stringify = function(){
	this.string = JSON.stringify(this);
	return this.string;
}

module.exports = createResponse;