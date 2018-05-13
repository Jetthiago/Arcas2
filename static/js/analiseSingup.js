function checkMatch(){
	var confpass = $("input[name=confpass]")[0],
		pass = $("input[name=pass]")[0],
		alert = $("#alert-confpass");
	if(pass.value.length < confpass.value.length){
		alert.removeClass("hidden");
	} else if(pass.value.length > confpass.value.length){
		if(pass.value == confpass.value){
			alert.addClass("hidden");
		} else {
			alert.removeClass("hidden");
		}
	}
	if(pass.value.length == confpass.value.length){
		if(pass.value == confpass.value){
			alert.addClass("hidden");
		} else {
			alert.removeClass("hidden");
		}
	}
	if(confpass.value.length == 0){
		alert.addClass("hidden");
	}
}
$(function(){
	$("input[name=pass]").change(checkMatch);
	$("input[name=confpass]").change(checkMatch);
})

// - https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms/Data_form_validation