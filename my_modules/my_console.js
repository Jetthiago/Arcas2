require("moloader").load("colors, util");

function logWithColor(color, args, isError){
	var log = util.format.apply(this, args);
	if(isError)
		console.error(log[color]);
	else
		console.log(log[color]);
}

function my_console(debuging){
	if (debuging != undefined) this.debuging = debuging;
	else this.debuging = true;
	var that = this;
	this.server = function(){
		arguments[0] = "[server] "+arguments[0];
		logWithColor("green", arguments);
	}

	this.db = function() {
		arguments[0] = "[db] "+arguments[0];
		logWithColor("gray", arguments);
	}

	this.router_server = function(){
		arguments[0] = "[router_server] "+arguments[0];
		logWithColor("gray", arguments);
	}

	this.staticfy = function(){
		if(this.debuging){
			arguments[0] = "[staticfy] "+arguments[0];
			logWithColor("gray", arguments);
		}
	}

	this.sessionne = function(){
		arguments[0] = "[sessionne] "+arguments[0];
		logWithColor("bgBlue", arguments);
	}

	this.log = function(){
		console.log.apply(this, arguments);
	}

	this.info = function(){
		logWithColor("green", arguments);
	}

	this.start = function(){
		logWithColor("bgGreen", arguments);
	}

	this.warn = function(){
		// watch out for this one. Yellow is not working;
		if(arguments[0]) logWithColor("bold", arguments);// observe bold instead of yellow
		this.server = function(){
			arguments[0] = "[server] Warning: " + arguments[0];
			logWithColor("bold", arguments)
		}
		return this;
	}

	this.error = function(){
		var error = {};
		if(arguments[0]) logWithColor("red", arguments, true);
		error.server = function(){
			arguments[0] = "[server] Error: " + arguments[0];
			logWithColor("bgRed", arguments, true);
		};
		error.staticfy = function(){
			arguments[0] = "[staticfy] Error: " + arguments[0];
			logWithColor("magenta", arguments, true);
		};
		error.router_server = function(){
			arguments[0] = "[router_server] Error: " + arguments[0];
			logWithColor("red", arguments, true);
		};
		error.sessionne = function(){
			arguments[0] = "[sessionne] Error: " + arguments[0];
			logWithColor("red", arguments, true);
		};
		error.db = function(){
			arguments[0] = "[db] Error: " + arguments[0];
			logWithColor("red", arguments, true);
		};
		return error;
	}

	this.noticemesenpai = function(){
		logWithColor("random", arguments);
	}

	this.data = function(){
		logWithColor("gray", arguments);
	}

	this.debug = function(){
		if(this.debuging)
			logWithColor("cyan", arguments);
	}

	this.dir = function(){
		console.dir.apply(this, arguments);
	}

	this.clear = function(){
		process.stdout.write("\u001B[2J\u001B[0;0f");
	}

	this.trace = function(){
		console.trace.apply(this, arguments);
	}

	this.assert = function(){
		if (!assertion){
			logWithColor("red", ["AssertionError: false == true"]);
			console.assert(assertion);
		}
	}

	this.time = function(){
		console.time.apply(this, arguments);
	}

	this.timeEnd = function(){
		console.timeEnd.apply(this, arguments);
	}

	/*this. = function(){
		
	}*/
	//return this;
}


/*var my_console = {
	server: function(){
		arguments[0] = "[server] "+arguments[0];
		logWithColor("green", arguments);
	},
	router_server: function(){
		arguments[0] = "[router_server] "+arguments[0];
		logWithColor("gray", arguments);
	},
	staticfy: function(){
		arguments[0] = "[staticfy] "+arguments[0];
		logWithColor("gray", arguments);
	},
	sessionne: function(){
		arguments[0] = "[sessionne] "+arguments[0];
		logWithColor("bgBlue", arguments);
	},
	log: function(){
		console.log.apply(this, arguments);
	},
	info: function(){
		logWithColor("green", arguments);
	},
	start: function(){
		logWithColor("bgGreen", arguments);
	},
	warn: function(){
		logWithColor("yellow", arguments, true);
	},
	error: function(){
		logWithColor("red", arguments, true);
	},
	noticemesempai: function(){
		logWithColor("random", arguments);
	},
	data: function(){
		logWithColor("gray", arguments);
	},
	debug: function(){
		logWithColor("cyan", arguments);
	},
	dir: function(){
		console.dir.apply(this, arguments);
	},
	clear: function(){
		process.stdout.write("\u001B[2J\u001B[0;0f");
	},
	trace: function(){
		console.trace.apply(this, arguments);
	},
	assert: function(assertion){
		if (!assertion){
			logWithColor("red", ["AssertionError: false == true"]);
			console.assert(assertion);
		}
	},
	time: function(){
		console.time.apply(this, arguments);
	},
	timeEnd: function(){
		console.timeEnd.apply(this, arguments);
	}
}*/



module.exports = my_console;