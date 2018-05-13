var moloader = require("moloader");
moloader.verbose = false;
moloader.load("./../../config.json")
    .loadPack()
    .loadDir("./my_modules");
//
var db = returnNewDb(config);
var exampleRevenue = [null, 100.0, 150.0, null, 500.0, null],
    exampleRevenue2 = [null, 100.2, 150.2, null, 500.2, null];
var date = new Date();
var public = {
    //query: { year: date.getFullYear(), month: date.getMonth() },
    query: {year: 2018, month: 0},
    document: {}
}

async.series([
    function(callback) {
        db.tables.findOne(public.query, function(err, document) {
            delete document["_id"];
            console.log(document);
            for(var i = 0; i < document.revenue.length; i++){
                document.revenue[i].day = exampleRevenue;
                document.revenue[i].night = exampleRevenue2;
            }
            public.document = document;
            callback(err, document);
        });
    },
    function(callback) {
        db.tables.update(public.query, public.document, callback);
    }
], function(err, result) {
    console.log(result);
});
