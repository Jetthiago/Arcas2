
var fsLogger = {
    stream: null,
    createStream: function () {
        if(config.fsLogger){
            this.stream = fs.createWriteStream("logs/"+timeStamp("YYYY-MM-DD HH-mm-ss-ms")+".log");
        }
    },
    write: function(){
        if(config.fsLogger){
            var formated = util.format.apply(this, arguments);
            this.stream.write(timeStamp("[YYYY/MM/DD][HH:mm:ss:ms] ") + formated + "\n");
        }
    }
}

module.exports = fsLogger;