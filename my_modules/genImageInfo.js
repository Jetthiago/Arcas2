Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

var regxp = {
    image: /image\//
},
    probe = probeImageSize;
module.exports = function genImageInfo(pathname, callback) {
    var data = { items: [], actual: { name: "", index: 0 } },
        pathnameArray = pathname.split("\\"),
        filename = pathnameArray.pop(),
        parentDirectory = pathnameArray.toString().replace(/\,/g, "/"),
        temp = {
            "items": [
                {
                    src: '05.jpg',
                    w: 600,
                    h: 400
                },
                {
                    src: 'https://placekitten.com/1200/900',
                    w: 1200,
                    h: 900
                }
            ]
        }
    //console.log("> generating image data, vars:\n pathnameArray: "+pathnameArray+";\n filename: "+filename+";\n parentDirectory: "+parentDirectory+";");
    function iterateSize(pathname, next) {
        //console.log("> interating size:\n pathname: " + pathname);
        pathname = path.join(__dirname, "/..", config.xroot, parentDirectory, pathname);
        //console.log(" mod pathname: " + pathname);
        var input = fs.createReadStream(pathname);
        // causing error on name resolving;
        probe(input, function (err, resu) {
            input.destroy();
            //console.log("> probe data:\n err: "+err+";\n resu: "+resu);
            next(err, resu);
        });
    }
    fs.readdir(path.join(__dirname, "/..", config.xroot, parentDirectory), function (err, dir) {
        if (err) return callback(err);
        for (var i = 0; i < dir.length; i++) {
            var mimename = mime.getType(dir[i]);
            if (!regxp.image.test(mimename)) {
                dir[i] = undefined;
            }
        }
        var midRoot = path.join("../", parentDirectory);
        dir.clean(undefined);
        async.mapSeries(dir, iterateSize, function (err, results) {
            if (err) return //console.log("[ERROR] "+err)
            results.clean(null);
            for (var i = 0; i < results.length; i++) {
                data.items[i] = {
                    src: encodeURIComponent(path.join(midRoot, dir[i])) + "?from_root=true",
                    w: results[i].width,
                    h: results[i].height,
                    title: dir[i],
                    msrc: encodeURIComponent(path.join(midRoot, "thumbnails", dir[i])) + "?from_root=true"
                };
            }
            //var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: "base"});
            function compareSon(item) {
                return function (a, b) {
                    a = a[item]; b = b[item];
                    return String(a).localeCompare(b, undefined, {numeric: true, sensitivity: "accent"});
                }
            }
            data.items.sort(compareSon("src")); 
            
            
            /* 
            // old sorting
            data.items = arraySortBy(data.items, item => item.src); */
            data.actual.name = filename;
            data.actual.index = dir.indexOf(filename);
            callback(null, data);
        });
    });
}