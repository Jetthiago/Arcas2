/*
    Getting input from command line:
        https://nodejs.org/api/readline.html
*/


var moloader = require("moloader");
moloader.loadPack()
    .load("assert, readline, ./../../config.json, ./../../my_modules/returnNewDb.js");
var installFunctions = require("./installFunctions");
var db = returnNewDb(config);

async.series([
    function (callback) {
        installFunctions.testDb(db, callback);
    },
    function (callback) {
        installFunctions.createAdmin(db, callback);
    },
], function (err, results) {
    assert(err == null, "Unknow error: " + err);
    console.info("Installation ended");
});
