/* var streamVideo = function (request, response, pathname) {
    var data = { path: pathname },
        type = mime.getType(data.path),
        stats = fs.statSync(__dirname + "/../" + data.path),
        total = stats.size,
        range = request.headers.range,
        start = 0,
        end = total - 1,
        chuncksize = (end - start) + 1;
    if (range) {
        var positions = range.replace(/bytes=/, "").split("-"),£
            start = parseInt(positions[0], 10),
            end = positions[1] ? parseInt(positions[1], 10) : total - 1,
            chuncksize = (end - start) + 1;
    }
    fs.readFile(__dirname + "/../" + data.path, function (err, file) {
        response.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chuncksize,
            "Content-Type": type
        });
        response.end(file.slice(start, end + 1), "binary");
    });
}
 */
var streamVideo = function (request, response, pathname) {
    pathname = path.join(__dirname, "../", pathname);
    fs.stat(pathname, (err, stats) => {
        if (err) {
            response.writeHead(404);
            return response.end();
        }

        var range = request.headers.range,
            size = stats.size,
            start = Number((range || "").replace(/bytes=/, "").split("-")[0]),
            end = size - 1,
            chunckSize = (end - start) + 1;

        response.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + size,
            "Accept-Ranges": "bytes",
            "Content-Length": chunckSize,
            "Content-Type": mime.getType(pathname)
        });
        fs.writeFileSync("test", JSON.stringify({
            range: range,
            size: size,
            start: start,
            end: end,
            chunckSize: chunckSize,
            userAgent: request.headers["user-agent"]
        }, false, 2));
        stream = fs.createReadStream(pathname, { start, end });
        stream.on("open", () => stream.pipe(response));
        stream.on("error", (streamErr) => response.end(streamErr));
    });
}


module.exports = streamVideo;