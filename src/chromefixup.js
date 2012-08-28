if (window.brackets == undefined) window.brackets = {};
window.brackets.app = {
  language: 'en',
  _start: new Date().valueOf(),
  getElapsedMilliseconds: function() {
	return new Date().valueOf() - window.brackets.app._start;
  },
  openLiveBrowser: function(url, remoteDebugging, callback) {
	  console.log("will try to open " + url);
	  
  },
  openURLInDefaultBrowser: function(callback, url) {
	  window.open(url);
  }
};

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
	render: function(x,y, _onReady, _le) {
		Mustache._onReady = _onReady;
		Mustache._le = _le;
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
	AppInit = Mustache._le;
	if (data.data['do'] == 'render') {
		$('body').html(data.data['html']);
	    AppInit._dispatchReady(AppInit.HTML_READY);

	    $(window.document).ready(Mustache._onReady);
	}
});