var lib = {
	textXhttp: null,
	jsonXhttp: null,
	requestXhttpSync: function(name,result){
		if(!result) result = "Object";
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", name, false);
		xhttp.send(null);
		if(xhttp.status == 200){
			if(result == "Object"){
				return this.isJSON(xhttp.responseText);
			}
			else if(result == "String"){
				return xhttp.responseText;
			}
		}
	},
	requestXhttp: function(name,type,callback){
		if(!type) type = "Object" // or String or NonJSON
		var xhttp = new XMLHttpRequest();
		function handlerResponse(status, text){
			console.log("File received, named: "+name);
			if(status == 200){
				lib.textXhttp = text;
				if(type != "NonJSON")
					var parsed = JSON.parse(text);
			}

			if(callback) {
				if(type == "Object")
					callback(parsed);
				else if(type == "String")
					callback(text);
				else if(type == "NonJSON")
					callback(text);
			}
		}
		function handlerStateChange(){
			switch (xhttp.readyState){
				case 0: // unitialized
				case 1: // loading
				case 2: // loaded
				case 3: // interactive
				break;
				case 4: // completed
				handlerResponse(xhttp.status, xhttp.responseText);
				break;
				default: error();
			}
		}
		xhttp.onreadystatechange = handlerStateChange;
		xhttp.open("GET", name, true);
		xhttp.send(null);
	},
	testXhttp: function(text){
		if(!text) console.log(this.requestXhttpAsync("../xhttp/menu/9200.txt", "String"));
		console.log(text);
	},
	getCookie: function (cname){
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) == 0) {
			    return c.substring(name.length, c.length);
			}
		}
		return null;
	},
	parseQuery: function(qs) {
	    qs = qs || location.search.slice(1);

	    var pairs = qs.split('&');
	    var result = {};
	    pairs.forEach(function(pair) {
	        var pair = pair.split('=');
	        var key = pair[0];
	        var value = decodeURIComponent(pair[1] || '');

	        if( result[key] ) {
	            if( Object.prototype.toString.call( result[key] ) === '[object Array]' ) {
	                result[key].push( value );
	            } else {
	                result[key] = [ result[key], value ];
	            }
	        } else {
	            result[key] = value;
	        }
	    });

	    return JSON.parse(JSON.stringify(result));
	}
}