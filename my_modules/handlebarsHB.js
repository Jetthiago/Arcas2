
require("moloader").load("fs, handlebars, guidom");

var hB = guidom.compileDir("./templates");

module.exports = hB;