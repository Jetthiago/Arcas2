var codeTable = {};
XHTTP.get("/codetable?router_req=true","json",function(response){
	codeTable = response;
});