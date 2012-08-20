chrome.experimental.app.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {top: 0, left: 0, width: 800, height: 600});
});