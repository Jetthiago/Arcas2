// Coded by Thiago Lopes <jetthiago@hotmail.com>
require("moloader").load("fs, path, url, mime, zlib, compressible, ./../../config.json");
var console = new myConsole(config.silent, config.debug);

var staticfy = function (directory) {
	if (!directory) directory = "./"
	this.directory = directory;
}

// heavy processign with high memory usage but come with file compression, so the file travels faster;
staticfy.prototype.serve = function (request, response, options) {
	var parsedUrl = url.parse(request.url),
		namefile = path.join(this.directory, decodeURIComponent(parsedUrl.pathname)),
		acceptEncoding = request.headers["accept-encoding"];
	if (!acceptEncoding) acceptEncoding = "";
	if (querystring.parse(url.parse(request.url).query).from_root == "true") {
		namefile = path.join(__dirname, "../", config.xroot, config.xroot, decodeURIComponent(parsedUrl.pathname));
	}
	var mimefile = mime.getType(namefile);

	function sucess(data, contentEncod) {
		if (!contentEncod) var headers = { "Content-Type": mimefile };
		else var headers = { "Content-Type": mimefile, "Content-Encoding": contentEncod, "Cache-Control": "no-cache, no-store, must-revalidate" };
		response.writeHead(200, headers);
		response.end(data, function () {
			console.staticfy("GET " + namefile);
		});
	}

	fs.readFile(namefile, function (err, file) {
		if (err) {
			console.error().staticfy("request failed, cant find: " + namefile);
			response.writeHead(404);
			return response.end();
		}
		var options = { level: 8 }
		if (compressible(mimefile)) {
			if (acceptEncoding.match(/\bdeflate\b/)) {
				sucess(zlib.deflateSync(file, options), "deflate");
			} else if (acceptEncoding.match(/\bgzip\b/)) {
				sucess(zlib.gzipSync(file, options), "gzip");
			} else {
				sucess(file);
			}
		} else {
			sucess(file);
		}
	});
}

// light processing with low memory usage;
staticfy.prototype.stream = function (request, response, options) {
	var parsedUrl = url.parse(request.url),
		namefile = path.join(this.directory, parsedUrl.pathname),
		mimefile = mime.getType(namefile),
		readStream = null;
	try {
		readStream = fs.createReadStream(namefile);
	}
	catch (err) {
		response.writeHead(404);
		return response.end(function () {
			console.error().staticfy("request failed, cant find: " + namefile);
		});
	}
	response.writeHead(200, { "Content-Type": mimefile });
	readStream.pipe(response);
	console.staticfy("request ended for :" + namefile);
}

module.exports = exports = staticfy;