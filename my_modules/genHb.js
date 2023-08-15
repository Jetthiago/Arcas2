var regVideo = /video/,
    regImage = /image/;

module.exports = {
    app: function (request, response) {
        var hb = handlebarsHb,
            callback = false,
            public = {
                rootpath: path.resolve(__dirname + "/../" + xroot), // string containig the standard root path;
                url: url.parse(request.url), // url object;
                pathname: "", // requested's directory pathname or the root path (is the path that the client is asking for);
                query: {}, // request's query;
                dirpath: "", // requested's directory pathname or the root path (is the path that the client is asking for, BUT for the fs);
                pagename: "", // used in the title;
                arrPath: [], // fs dirpath splited array;
                arrRoot: [], // aux to remove __dirname stuff;
                dirFilesRaw: [] // names of the files inside the 'dirpath';
            },
            hbData = {
                dirname: "/",
                dirs: [],
                files: [],
                parents: []
            };
        public.query = querystring.parse(public.url.query);
        if (public.query.path) {
            public.query.path = decodeURIComponent(public.query.path);
            public.pathname = public.query.path;
            public.dirpath = path.join(public.rootpath, public.query.path);
        } else {
            public.pathname = "";
            public.dirpath = path.resolve(public.rootpath);
        }
        var arr = public.dirpath.split("\\"),
            arrAux = public.rootpath.split("\\");
        public.arrPath = arr.slice(arrAux.length - 1, arr.length);
        public.arrRoot = arrAux;
        if (public.query.path) {
            public.pagename = arr[arr.length - 1];
            hbData.dirname = public.pagename;
        } else {
            public.pagename = "App";
            hbData.dirname = "Index";
        }
        if (typeof response == "function") {
            callback = response;
        }
        // provide the parents paths to the data file, with each directory to the requested;
        function provParents() {
            var pathname = public.pathname;
            if (pathname != "") {
                pathname = pathname.split("\\");
                var pathConcat = "",
                    paths = [];
                for (var i = 0; i < pathname.length; i++) {
                    pathConcat = path.join(pathConcat, pathname[i]);
                    paths[i] = { path: "#/app?path=" + pathConcat, name: "/" + pathname[i] }
                }
                paths.unshift({ path: "#/app", name: public.arrRoot[public.arrRoot.length - 1] })
                return paths;
            }
            else {
                return [{ path: "#/app", name: public.arrRoot[public.arrRoot.length - 1] + "/" }];
            }
        }
        hbData.parents = provParents();
        var funcs = [
            function (next) {
                fs.readdir(public.dirpath, (err, files) => {
                    if (err) return next(err);
                    public.dirFilesRaw = files;
                    next(null, files);
                });
            },
            function (next) {
                function statAndGenInfo(filename, nexty) {
                    var holder = {},
                        pathhandled = path.join(public.dirpath, filename);
                    fs.stat(pathhandled, (err, stats) => {
                        if (err) return nexty(err);
                        // check every element to see if it is a file or a directory;
                        var classe = "directory";
                        if (stats.isFile()) classe = "file";
                        holder.class = classe;

                        // creates a object for every dir item with a path for it and a name to show;
                        holder.name = filename;
                        var joined = encodeURIComponent(path.join(public.pathname, filename));
                        if (classe == "directory" && holder.name != "thumbnails") { // thumbnails exception;
                            // open a new directory;
                            holder.path = "#/app?path=" + joined;
                            hbData.dirs.push(holder);
                        } else if (classe == "file") {
                            if (regImage.test(mime.getType(filename))) {
                                //thumbnails(public.dirpath, filename, function () {
                                    // show the image hbs;
                                    holder.path = "/image?path=" + joined + "&sg=true";
                                    holder.image = true;
                                //});
                            } else if(regVideo.test(mime.getType(filename))) {
                                // show the video "hbs";
                                holder.path = "/video?path=" +  joined;
                                holder.video = true;
                            } else {
                                // show the normal file;
                                holder.path = joined;
                            }
                            hbData.files.push(holder);
                        }
                        //if (public.dirpath == "/") var obj = { path: public.dirpath + filename, name: filename };
                        nexty(null, holder);
                    });
                }
                async.mapSeries(public.dirFilesRaw, statAndGenInfo, function (err, result) {
                    if (err) return next(err);
                    // comparison method that returns a function given which item needs to be sorted;
                    /*
                    // old sorting;
                    function compareSon(item) {
                        return function (a, b) {
                            a = a[item]; b = b[item];
                            return a.localeCompare(b);
                        }
                    }
                    */
                    // alphabetically sorts the arrays containg the info about the dir;
                    function compareSon(item) {
                        return function (a, b) {
                            a = a[item]; b = b[item];
                            return String(a).localeCompare(b, undefined, {numeric: true, sensitivity: "base"});
                        }
                    }
                    hbData.dirs.sort(compareSon("name"));
                    hbData.files.sort(compareSon("name"));
                    

                    /* hbData.dirs = arraySortBy(hbData.dirs, item => item.name);
                    hbData.files = arraySortBy(hbData.files, item => item.name); */
                    for (var i = 0; i < hbData.files.length; i++) {
                        if (hbData.files[i].image){
                            hbData.files[i].path += "&in=" + i;
                        }
                    }
                    //hbData.dir = [].concat(hbData.dirs).concat(hbData.files); // old legacy;
                    next(null, result);
                });
            }
        ];
        async.series(funcs, (err, results) => {
            if (!callback) {
                if (err) return serverError(err, request, response);
                var data = new createResponse(request, response, {
                    title: appName + " - " + public.pagename,
                    html: hb.app(hbData)
                });
                response.writeHead(data.status, data.contentType);
                response.end(data.string);
            } else {
                if (err) return callback(err);
                callback(null, hbData);
            }
        });
    }
}

