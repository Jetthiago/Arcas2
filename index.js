// Coded by Thiago Marques <jetthiago@hotmail.com>

// loading dependencies;
var moloader = require("moloader");
moloader.verbose = false;
moloader.loadPack()
	.load("http, url, path, fs, os, dns, querystring")
	.loadDir("./my_modules");

// assining variables;
var config = require("./config.json");
var Staticfy = staticfy;
	staticfy = new Staticfy("./static");
var Cookies = cookies;
var Router = routerServer;
var hb = handlebarsHb;
// assining database;
var db = returnNewDb(config);
var Sessionne = sessionne;
sessionne = new Sessionne(db);

// loading configuration;
var port = config.port;
var keygrip = config.keygrip;
global["silent"] = config.silent;
global["xroot"] = config.xroot;
global["appName"] = config.appName;
global["codeTable"] = require("./codeTable.json");

var console = new myConsole(config.silent, config.debug);

// handling functions;
function dberror(err,callback){
	if(new String(err.message).search("first connection")){
		db = {};
		db.login = new nedb({filename: "dbs/login", autoload: true});
		sessionne.db = db;
	}
	if(callback) callback();
	console.warn().server("error on mongodb, changing to nedb...");
}

// starting server;
var server = http.createServer(function(request, response){
	var router = new Router(request,response,{static: "./static", db: db});
	routerBasics(router, hb, db, sessionne, console, config);
	routerEntries(router, hb, db, sessionne, console, config);

	router.end();
});

dns.lookup(os.hostname(), {all:true, family: 4}, function(err, add, fam){
	server.listen(port,function(){console.start("Single-Page-Vanilla serving locally at http://"+add[add.length - 1].address+":"+port+"/")});
});

/*var exceptionOccured = false;
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    exceptionOccured = true;
    process.exit();
});
process.on('exit', function(code) {
    if(exceptionOccured) console.log('Exception occured');
    else console.log('Kill signal received');
    process.exit();
});
process.on("SIGINT", function(code){
	console.log("Possible Ctrl+C received");
	process.exit();
});
process.on("SIGTERM", function(code){
	console.log("Termination requeried");
	process.exit();
});*/

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


/* process.on("SIGUSR1", function() {
	process.exit();
});
process.on("SIGUSR2", function() {
	process.exit();
});
process.on("SIGINT", function() {
	process.exit();
}); 
process.on("SIGTERM", function(code) {
	process.exit();
});
process.on("SIGHUP", function() {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
	process.exit();
});
process.on("SIGQUIT", function () {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
	process.exit();
});
process.on("SIGKILL", function() {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
});
process.on("exit", function(params) {
	fs.writeFileSync("test", "mili:" + new Date().getMilliseconds());
}); */
// https://github.com/jtlapp/node-cleanup