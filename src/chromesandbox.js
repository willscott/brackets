window.addEventListener('message', function(m) {
	if (m.data['do'] == 'render') {
		var resp = Mustache.render(m.data['args'][0], m.data['args'][1]);
		m.source.postMessage({'do':'render','html':resp},"*");
	} else {
		return 0;
	}
});