window.brackets = { app: { language: 'en',
_start: new Date().valueOf(),
getElapsedMilliseconds: function() {
	return new Date().valueOf() - window.brackets.app._start;
}
 }};

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
	    LoadEvents._dispatchEvent(LoadEvents.HTML_CONTENT_LOAD_COMPLETE);

	    $(window.document).ready(Mustache._onReady);
	}
});