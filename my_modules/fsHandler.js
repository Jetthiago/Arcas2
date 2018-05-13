var regCssroot = /\.cssroot/,
    regVideoxroot = /xroot/,
    pathroot = __dirname + "/../" + ""//config.root;

var handler = {
    get: function (parsedUrl) {
        var parsedUrl = url.parse(request.url),
            pathname = decodeURI(parsedUrl.pathname),
            query = querystring.parse(parsedUrl.query),
            filepath = path.join(pathroot, pathname),
            servHtml = false;

        if (regCssroot.test(filepath)) filepath = __dirname + "/../templates/css/" + parsedUrl.pathname.replace(regCssroot, ".css");
        if (regVideoxroot.test(filepath)) {
            filepath = filepath.replace("xroot", "");
            servHtml = true;
        }

        try { var stat = fs.statSync(filepath); }
        catch (err) { var stat = false; }
    },
    isFileSync: function(path){
		return fs.statSync(path).isFile();
	},
	isDirectorySync: function(path){
		return fs.statSync(path).isDirectory();
	}
}

module.exports = handler;