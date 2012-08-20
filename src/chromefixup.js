window.brackets = { app: { language: 'en' } };

var templateSandbox = document.createElement('browser');
templateSandbox.src = 'sandbox.html';
templateSandbox.style.display = 'none';
document.head.appendChild(templateSandbox);
