
var moloader = require("moloader");
moloader.load("async, nedb, cookies, formidable");
var fsdb = new nedb({filename: "dbs/runtime", autoload: true}),
	regIp = /\:\:ffff\:/,
	Cookies = cookies,
	config = require("../config.json"),
	myConsole = require("./my_console"),
	console = new myConsole(),
	keygrip = config.keygrip,
	key = config.key;
function sessionne(db){
	this.db = db;
}
var proto = sessionne.prototype;

proto.addUser = function(request, response, initCall){
	var form = new formidable.IncomingForm();
	var cookies = new Cookies(request,response,{keys: keygrip});
	var that = this;
	async.waterfall([
		function parseForm(callback){
			form.parse(request,function(formErr,fields){
				callback(formErr, fields);
			});
		},
		function findLogin(fields, callback){
			fields.pass = new String(fields.pass).hashCode();
			console.sessionne("tring to find "+fields.user+" with pass "+fields.pass);
			that.db.login.findOne({"user": fields.user, "pass": fields.pass}, function(dbErr,user){
				if(dbErr){
					callback(dbErr);
				} else {
					console.sessionne("database finded: "+JSON.stringify(user));
					if(user != null) user.user = fields.user;
					callback(null, user);
				}
			});
		},
		function checkValidUser(user, callback){
			if(user == null){
				console.sessionne("login user not found");
				callback(null, 0);
			} else {
				that.checkUser(request,response,function(checkErr,auth){
					if(checkErr){
						callback(checkErr);
					} else if(auth == -1 || auth == 0){
						// user not found on fsdb, time to add it to auth database;
						console.sessionne("adding "+user.user+" to auth database");
						var genAuth = that.generateAuth(request,user.user);
						fsdb.insert(genAuth, function(fsdbErr, doc){
							console.sessionne("genAuth: "+JSON.stringify(genAuth));
							if(fsdbErr) {
								callback(fsdbErr);
							} else {
								console.sessionne("user accepted and created: "+JSON.stringify(doc,undefined,2));
								callback(null,doc);
							}
						});
					} else {
						// user already on auth database;
						console.sessionne("user "+user.user+" already on auth database");
						callback(null,{
							auth:auth,
							user:user.user,
							ip:that.clientIpFunc(request)
						});
					}
				});
			}
		}
		],
		function endCall(err,results){
			if(err){
				console.error().sessionne(err);
				if(initCall) initCall(err);
			} else {
				if(initCall) initCall(null,results);
			}
		});
}

proto.removeUser = function(request, response, callback){
	var ip = this.clientIpFunc(request),
		date = new Date(0),
		cookies = new Cookies(request,response,{keys: keygrip}),
		user = cookies.get("user",{signed: true}),
		auth = cookies.get("auth",{signed: true}),
		cookiesStatus = {removedUser: false, removedAuth: false};
	console.sessionne("cookies set to expire: "+date);
	console.sessionne("user on cookies: "+user+" auth on cookies: "+auth);
	if(user){
		cookies.set("user",user, {signed: true, expires: date});
		cookiesStatus.removedUser = user;
	}
	if(auth){
		cookies.set("auth",auth, {signed: true, expires: date});
		auth = parseInt(auth)
		cookiesStatus.removedAuth = auth;
	}
	fsdb.remove({auth: auth},{multi: true}, function(err,numRemoved){
		console.sessionne("fsdb response: "+numRemoved+" error? "+err);
		if(err){
			callback(err);
		} else if(numRemoved == 0){
			callback(null, numRemoved);
		} else {
			callback(null, cookiesStatus);
		}
	});
}

proto.checkUser = function(request, response, callback){
	var ip = this.clientIpFunc(request),
		cookies = new Cookies(request,response,{keys: keygrip}),
		user = cookies.get("user",{signed: true}),
		auth = cookies.get("auth",{signed: true});
	console.sessionne("user: "+JSON.stringify(user)+" auth: "+auth);
	if(auth) auth = parseInt(auth);
	if(user == undefined || auth == undefined || user == "" || auth == 0){
		console.sessionne("user denied, not logged");
		callback(null,-1);
	} else {
		var cookies = new Cookies(request, response, {});
		fsdb.findOne({user: user, ip: ip},function(err,doc){
			if(err){
				console.error().sessionne("error on finding user on auth database");
				callback(err)
			} else if(doc == null){
				console.sessionne("fsdb user denied");
				callback(null,0,"");
				/*console.sessionne("wrong user");
				response.writeHead(200, {"Content-Type": "aplication/json"});
				response.write(JSON.stringify({newUrl: "login"}));
				response.end();*/
			} else {
				console.sessionne("fsdb user accepted "+auth);
				callback(null,auth,user);
			}
		});
	}
}

proto.generateAuth = function(request, user, key){
	// uncomment this line when ready;
	//if(!key) var key = Math.floor((Math.random() * 10000)+1);
	var ip;
	if(typeof request == "string") request.replace(regIp,"");
	else ip = this.clientIpFunc(request);
	return {
		auth: parseInt(new String(user+key+this.clientIpFunc(request)).hashCode()),
		user: user,
		ip: ip,
		key: key
	};
}

proto.clientIpFunc = function(request){
	var ipclient = request.connection.remoteAddress;
	ipclient = ipclient.replace(regIp,"");
	return ipclient;
}

module.exports = sessionne