
var addZeros = function (str, spaces) {
    var len = str.length;
    if (len < spaces) {
        for (var j = 0; j < (spaces - len); j++) {
            str = "0" + str;
        }
    }
    return str;
}

var interator = function (pre, pos, start, end, spaces) {
    start = parseInt(start);
    end = parseInt(end);
    spaces = parseInt(spaces);
    var createdURLs = []; // (string);
    var interval = (end - start) + 1;
    for (var i = 0; i < interval; i++) {
        createdURLs[createdURLs.length] = pre + addZeros(String(start + i), spaces) + pos;
    }
    return createdURLs;
}

module.exports = interator;