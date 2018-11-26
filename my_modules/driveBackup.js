// source: https://developers.google.com/drive/api/v3/quickstart/nodejs

var readline = require('readline');
var { google } = require('googleapis');
var SCOPES = ['https://www.googleapis.com/auth/drive.file'];
var TOKEN_PATH = 'token.json';
var myConsole = require("./my_console.js");
var myconsole = new myConsole();

var driveBackup = {
    folders: {
        arcas2: false,
        logs: false,
        dbs: false
    },
    init: function (callback) {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            authorize(JSON.parse(content), callback);
        });
    },
    service: function (auth) {
        var that = this;
        this.drive = google.drive({ version: 'v3', auth });
        this.verifyFolders(() => {
            that.send();
        });
    },
    verifyFolders: function (verifyCallback) {
        var pageToken = null;
        var that = this;
        
        function verifyFunc(query, name, callback) {
            async.doWhilst(function (callback) {
                that.searchFiles(query, name, callback);
            }, function () {
                return !!pageToken;
            }, function (err) {
                if (err) {
                    // Handle error
                    callback(err);
                    console.error(err);
                } else {
                    if (!that.folders[name]) {
                        var fileMetadata = {
                            'name': name,
                            'mimeType': 'application/vnd.google-apps.folder',
                            'parents': [that.folders.arcas2]
                        };
                        that.drive.files.create({
                            resource: fileMetadata,
                            fields: 'id'
                        }, function (err, file) {
                            if (err) {
                                // Handle error
                                callback(err);
                                console.error(err);
                            } else {
                                console.log(name + ' folder Id: ', file.data.id);
                                that.folders[name] = file.data.id;
                            }
                        });
                    }
                }
                pageToken = null;
                callback();
            });
        }

        async.doWhilst(function (callback) {
            that.searchFiles("name='arcas2'", "arcas2", callback);
        }, function () {
            return !!pageToken;
        }, function (err) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                if (!that.folders.arcas2) {
                    var fileMetadata = {
                        'name': 'arcas2',
                        'mimeType': 'application/vnd.google-apps.folder'
                    };
                    that.drive.files.create({
                        resource: fileMetadata,
                        fields: 'id'
                    }, function (err, file) {
                        if (err) {
                            // Handle error
                            console.error(err);
                        } else {
                            console.log('Arcas folder Id: ', file.data.id);
                            that.folders.arcas2 = file.data.id;
                        }
                    });
                }
            }
            async.series([(callback) => {
                verifyFunc("name='logs' and parents in '" + that.folders.arcas2 + "'", "logs", () => {
                    callback();
                });
            }, (callback) => {
                verifyFunc("name='dbs' and parents in '" + that.folders.arcas2 + "'", "dbs", () => {
                    callback();
                });
            }], verifyCallback);
        });
    },
    send: function () {
        var that = this;
        var dirLogs = fs.readdirSync("logs");
        var dirLogsData = [];
        var dirDbs = fs.readdirSync("dbs");
        var dirDbsData = [];
        for(var i = 0; i < dirLogs.length; i++){
            var name = dirLogs[i];
            dirLogsData[i] = {
                name: name,
                parents: this.folders.logs,
                pathname: "logs/"+name
            }
        }
        for (var i = 0; i < dirDbs.length; i++) {
            var name = dirDbs[i];
            dirDbsData[i] = {
                name: name,
                parents: this.folders.dbs,
                pathname: "dbs/" + name
            }
        }

        function readDir() {
            function sendFile(data, callback) {
                var pathname = data.pathname
                var fileMetadata = {
                    'name': data.name,
                    parents: [data.parents]
                };
                var media = {
                    mimeType: mime.getType(pathname),
                    body: fs.createReadStream(pathname)
                }
                that.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }, (err, file) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, file.data.id);
                    }
                })
            }

            async.mapSeries(dirLogsData, sendFile, (err, results) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(results);
                    async.mapSeries(dirDbsData, sendFile, (err, results) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(results);
                        }
                    });
                }
            });
        }
        readDir();
    },
    searchFiles: function (query, name, callback) {
        var that = this;
        this.drive.files.list({
            q: query,
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive',
            pageToken: this.pageToken
        }, function (err, res) {
            if (err) {
                // Handle error
                console.error(err);
                callback(err)
            } else {
                res.data.files.forEach(function (file) {
                    that.folders[name] = file.id
                    console.log(query + "> found id: " + file.id);
                });
                that.pageToken = res.nextPageToken;
                callback();
            }
        });
    }
}
// uncomment here to enable the cloud backup
/* 
driveBackup.init((auth) => {
    driveBackup.service(auth);
    scheduleBackup(auth);
});
 */
function scheduleBackup(auth) {
    var date = new Date();
    var nextChange = new Date();
    var hours = date.getHours();
    var timeout = 0;
    if (hours >= 5 && hours < 14) {
        nextChange.setHours(14);
        nextChange.setMinutes(0);
    } else if (hours >= 14 && hours < 22) {
        nextChange.setHours(22);
        nextChange.setMinutes(0);
    } else {
        nextChange.setHours(5);
        nextChange.setMinutes(0);
        nextChange.setDate(date.getDate() + 1);
    }
    timeout = nextChange.getTime() - date.getTime();
    //console.log("timeout: " + timeout + " nextchange: " + nextChange.getHours());
    setTimeout(function () {
        driveBackup.service(auth);
        scheduleBackup(auth);
    }, timeout);
}



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var { client_secret, client_id, redirect_uris } = credentials.installed;
    var oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

module.exports = driveBackup;