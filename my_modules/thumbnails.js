
var thumb = nodeThumbnail.thumb;

var thumbnails = function (dir, filepath, callback) {
    callback();
    filepath = path.join(dir ,filepath);
    //console.log("filer":filepath);
    var thumbPath = path.join(dir, "thumbnails");
    if (!fs.existsSync(thumbPath)) {
        fs.mkdirSync(thumbPath);
    }
    thumb({
        source: filepath,
        destination: thumbPath,
        width: config.thumbwidth,
        ignore: true,
        quiet: true,
        suffix: "",
        concurrency: 6
    }, function (files, err) {
        if (err) return console.error(err);
        console.log(files);
    });
}


module.exports = thumbnails