if (window.brackets == undefined) window.brackets = {};
window.brackets.fs = {
	init: function() {
		webkitRequestFileSystem(window.PERSISTENT, 1024*1024*5, function(fs) {
			brackets.fs._fs = fs.root;
		});
	},
	
	// callback(err, data)
	// data = {mtime, isDirectory(), isFile}
	stat: function(path, callback) {
		console.log("stat requested for " + path);
		if (path == "/" || path == "") {
			callback(false, brackets.fs._fs);
			return;
		}
		brackets.fs._fs.getFile(path, {create: false}, function(file) {
			callback(false, file);
		}, function(err) {
			console.log("Stat for " + path + " failed as " + err.code);
			console.warn(err);
			callback(err, null);
		});
	},
	// callback(err, data)
	readFile: function(path, encoding, callback) {
		
	},
	// callback(err, list)
	// list = [path]
	readdir: function(path, callback) {
		brackets.fs._fs.getDirectory(path, {}, function(dir) {
			var reader = dir.createReader();
			var entries = [];
			var doread = function() {
			  reader.readEntries(function(results) {
				if (!results.length) {
					callback(false, entries);
				} else {
					for(var entry in results) {
						entries.push(entry.name);
					}
					doread();
				}
			  }, function(err) {
				  console.warn("error reading directory entries for " + path);
				  callback(err, null);
			  });
		    };
			doread();
		}, function(err) {
			console.lwarn("error getting directory for " + path);
			callback(err, null);
		});
	},
	// callback(err)
	writeFile: function(path, contents, encoding, callback) {
		stat(path, function(err, file) {
			var options = {};
			if (err = brackets.fs.ERR_NOT_FOUND) {
				options.create = true;
			} else {
				options.create = false;
			}
			brackets.fs._fs.getFile(path, options, function(file) {
				file.createWriter(function(writer) {
					writer.onwriteEnd = function() { callback(false); };
					writer.onerror = function(err) {
						console.log("write failed with exception " + err);
						callback(err);
					};
					writer.write(contents);
				});
			});
		})
	},
	// callback(err, data)
	showOpenDialog: function(allowMultiple, chooseDirectories, title, initial, types, callback) {
		console.log("show open dialog requested.");
		callback(false, "/");
	},
	
	// Populate brackets.fs with expected error codes.
	NO_ERROR: 0,
	ERR_NOT_FOUND: FileError.NOT_FOUND_ERR,
	ERR_UNKNOWN: FileError.SECURITY_ERR,
	ERR_INVALID_PARAMS: FileError.SECURITY_ERR,
	ERR_CANT_READ: FileError.NOT_READABLE_ERR,
	ERR_UNSUPPORTED_ENCODING: FileError.SYNTAX_ERR,
	ERR_CANT_WRITE: FileError.NO_MODIFICATION_ALLOWED_ERR,
	ERR_OUT_OF_SPACE: FileError.QUOTA_EXCEEDED_ERR,
	PATH_EXISTS_ERR: FileError.PATH_EXISTS_ERR,
};

window.brackets.fs.init();
