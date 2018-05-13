var galery, galeryData;
var requestPathname = location.pathname + "?glinfo=true&path=" + lib.parseQuery().path;

lib.requestXhttp(requestPathname, "Object", function (imgData) {
	galeryData = imgData;
	var pswpElement = document.querySelectorAll(".pswp")[0],
		items = imgData.items,
		options = {
			index: imgData.actual.index,
			tapToClose: false, // test this;
			closeOnScroll: false,
			closeOnVerticalDrag: false,
			pinchToClose: false,
			escKey: false,
			focus: true,
			history: false,
			preload: [2, 3]
		};

	galery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
	galery.init();
	function backgroundGalery() {
		var reload = document.getElementById("reload");
		reload.href = document.location.href;
	}
	backgroundGalery();
});

