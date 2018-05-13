// mongojs and nedb already loaded;

var returnNewDb = function(config){
    var db = {};
    if (config.databaseMode == "mongodb") {
        db = mongojs(config.database, config.collections);
        db.on("error", function (err) {
            dberror(err);
        });
    } else if (config.databaseMode == "nedb") {
        for (var i = 0; i < config.collections.length; i++) {
            var colleName = config.collections[i];
            db[colleName] = new nedb({ filename: "dbs/" + colleName, autoload: true });
        }
    }
    return db;
}

module.exports = returnNewDb;