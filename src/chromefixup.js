var fsShim = function() {};
fsShim.prototype.readFile = function(path, encoding, cb) {
	var reader = new FileReader();
	reader.onerror = function() {
		cb(true, null);
	};
	reader.onload = function(e) {
		cb(false, e.target.result);
	};
	reader.readAsText(path);
};
fsShim.prototype.showOpenDialog = function(
	allowMultiple, chooseDirectories,
	title,
	initial,
	types,
	cb) {
	chrome.fileSystem.chooseFile({
		"acceptsAllTypes": true,
		"suggestedName": title
	},function(fe) {
		
	});
};

//fsShim.prototype.stat = function(path, cb) {
//	
//};

window.brackets = { app: { language: 'en',
_start: new Date().valueOf(),
getElapsedMilliseconds: function() {
	return new Date().valueOf() - window.brackets.app._start;
}
 },
fs: new fsShim() };

var templateSandbox = document.createElement('iframe');
templateSandbox.src = 'sandbox.html';
templateSandbox.style.display = 'none';
window.addEventListener('load',function() {	
	document.body.appendChild(templateSandbox);
}, false);
var loaded = false;
templateSandbox.addEventListener('load', function() {
	loaded = true;
}, false);

var Mustache = {
	render: function(x,y, _onReady) {
		Mustache._onReady = _onReady;
		if (loaded) {
			templateSandbox.contentWindow.postMessage({'do':'render','args':[x,y]}, "*");
		} else {
			templateSandbox.addEventListener('load', function() {
				templateSandbox.contentWindow.postMessage({'do':'render','args':[x,y]}, "*");
			}, false);
		}
	}
};

window.addEventListener('message', function(data) {
	if (data.data['do'] == 'render') {
		$('body').html(data.data['html']);
	    $(brackets).trigger("htmlContentLoadComplete");

	    $(window.document).ready(Mustache._onReady);
	}
});