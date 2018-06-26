/*
Usage: ´routerEntries(router, hb, db, sessionne, console, config, serverError);´
├─router: my_modules/router_server already initialized with response, request and options;
├─hb: my_modules/handlebarsHB.standard;
├─db: mongojs initialized with collection called login or a init. nedb in a object: db={login:nedb};
├─sessionne: initialized with database already assingned;
├─console: custom new console my_modules/my_console;
├─config: file on root only for app name;
└─serverError: error handler to give a response to routerClient, use: sE(data,request,response), data as a ¨createResponse¨ object;
*/
/*
// these variable are already on global object thanks to ¨moloader¨;
var async = require("async");
var formidable = require("formidable");
var createResponse = require("./createResponse.js");
var isAuth = require("./isAuth.js");
var serverError = require("./serverError.js");
*/
/*var moloader = require("moloader");
moloader.load("async, formidable");*/

function routerEntries(router, hb, db, sessionne, console, config) {
    if (config) var appName = config.appName;
    else var appName = "";

    router.get("/image", (request, response, options) => {
        sessionne.checkUser(request, response, (err, auth, user) => {
            isAuth(err, auth, request, response, () => {
                var storage = {
                    url: url.parse(request.url),
                    path: "",
                    query: {}
                }
                storage.query = querystring.parse(storage.url.query);
                if (storage.query.sg == "true") {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.end(hb.image({}));
                } else if (storage.query.glinfo == "true") {
                    genImageInfo(storage.query.path, (err, data) => {
                        if (err) console.error().server(err);
                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.end(JSON.stringify(data));
                    });
                }
            });
        });
    });

    router.get("/video", (request, response, options) => {
        sessionne.checkUser(request, response, (err, auth, user) => {
            isAuth(err, auth, request, response, () => {
                var pathname = path.join(config.xroot, querystring.parse(url.parse(request.url).query).path);
                streamVideo(request, response, pathname);
            });
        });
    });

    router.get("/download/video", (request, response, options) => {
        sessionne.checkUser(request, response, (err, auth, user) => {
            isAuth(err, auth, request, response, () => {
                var pathname = path.join(config.xroot, querystring.parse(url.parse(request.url).query).path);
                pathname = path.join(__dirname, "../", pathname);
                var mimefile = mime.getType(pathname),
                    readStream = null;
                try {
                    readStream = fs.createReadStream(pathname);
                }
                catch (err) {
                    response.writeHead(404);
                    return response.end();
                }
                response.writeHead(200, { "Content-Type": mimefile });
                readStream.pipe(response);
            });
        });
    });

    router.post("/upload", (request, response, options) => {
        form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = __dirname + "/../stuff/uploads";
        form.keepExtensions = true;
        form.on("file", function (field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
        });
        form.on("error", function (err) {
            console.error("An error has occured: \n" + err);
        });
        form.on("end", function () {
            /* var name = fields.title || files.upload.name;
            console.log("name: " + name);
            fs.rename(files.upload.path, __dirname + "/../uploads/" + name, function (err) { if (err) console.log(err) })
            var data = new createResponse(request, response, {
                newUrl: "app",
                message: "completed"
            });
            response.writeHead(data.status, data.contentType);
            response.end(data.string); */
            response.end("success");
        })

        form.parse(request);
    });
}

module.exports = routerEntries;