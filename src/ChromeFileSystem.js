if (window.brackets == undefined) window.brackets = {};
window.brackets.fs = {
	HARD_CODED_FILES: {
		"/": function() { return window.brackets.fs._fs; },
		"": function() { return window.brackets.fs._fs; },
		"/../.git/HEAD": function() {
			var entry = brackets.fs.statEntry({isDirectory: false, isFile: true});
			entry.data = "empty";
			return entry;
		},
		"/../../.git/HEAD": function() {
			var entry = brackets.fs.statEntry({isDirectory: false, isFile: true});
			entry.data = "empty";
			return entry;
		},
		"/extensions/default": function() {
			var entry = brackets.fs.statEntry({isDirectory: true, isFile: false});
			entry.entries = [];
			return entry;
		},
		"/extensions/user": function() {
			var entry = brackets.fs.statEntry({isDirectory: true, isFile: false});
			entry.entries = [];
			return entry;
		}
	},
	
	statEntry: function(file) {
		return {
			isDirectory: function() { return file.isDirectory; },
			isFile: function() { return file.isFile; },
		};
	},
	init: function() {
		webkitRequestFileSystem(window.PERSISTENT, 1024*1024*5, function(fs) {
			fs.isFile = false;
			fs.isDirectory = true;
			brackets.fs._fs = fs.root;
		});
	},
	
	// callback(err, data)
	// data = {mtime, isDirectory(), isFile}
	stat: function(path, callback) {
//		console.log("stat requested for " + path);
		if (brackets.fs.HARD_CODED_FILES[path] != undefined) {
			callback(0, brackets.fs.HARD_CODED_FILES[path]());
			return;
		}
		brackets.fs._fs.getFile(path, {create: false}, function(file) {
			file.getMetadata(function(md) {
				var stats = window.brackets.fs.statEntry(file);
				stats.mtime = md.modificationTime;
				callback(0, stats);
			})
		}, function(err) {
			console.log("Stat for " + path + " failed as " + err.code);
			callback(err.code, null);
		});
	},
	// callback(err, data)
	readFile: function(path, encoding, callback) {
		if (path[0] == "/") {
			path = path.substr(1);
		}
		console.log('asked to read ' + path);
		if (brackets.fs.HARD_CODED_FILES[path] != undefined) {
			var result = brackets.fs.HARD_CODED_FILES[path]().data;
			callback(0, result);
			return;
		}
		brackets.fs._fs.getFile(path, {}, function(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();
				reader.onloadend = function(e) {
					callback(0, e.target.result);
				}
				reader.onerror = function(err) {
					console.log("read error: " + err.code);
					callback(err.code, null);
				}
				reader.readAsText(file);
			}, function(err) {
				callback(err.code, null);
			});
		}, function(err) {
			console.log("read of " + path + " failed with code" + err.code);
			callback(err.code, null);
		})
	},
	// callback(err, list)
	// list = [path]
	readdir: function(path, callback) {
		console.log("asked to readdir " + path);
		var p = path;
		if (p.lastIndexOf("/") == p.length - 1) {
			p = p.substr(0,p.lastIndexOf("/"));
		} 
		if (p.length && brackets.fs.HARD_CODED_FILES[p] != undefined) {
			var result = brackets.fs.HARD_CODED_FILES[p]().entries;
			if (result != undefined) {
				callback(0, result);
				return;
			}
		}

		brackets.fs._fs.getDirectory(path, {}, function(dir) {
			var reader = dir.createReader();
			var entries = [];
			var doread = function() {
			  reader.readEntries(function(results) {
				if (!results.length) {
					callback(0, entries);
				} else {
					for(var i = 0; i < results.length; i++) {
						entries.push(results[i].name);
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
			console.warn("error getting directory for " + path);
			callback(err, null);
		});
	},
	// callback(err)
	writeFile: function(path, contents, encoding, callback) {
		if (path[0] == "/") {
			path = path.substr(1);
		}
		brackets.fs.stat(path, function(err, file) {
			var options = {};
			if (err == brackets.fs.ERR_NOT_FOUND) {
				options.create = true;
			} else {
				options.create = false;
			}
			brackets.fs._fs.getFile(path, options, function(file) {
				if (!options.create) {
					file.remove(function() {
						brackets.fs.writeFile(path, contents, encoding, callback);
					}, function(err) {
						callback(err.code);
					});
				}
				file.createWriter(function(writer) {
					writer.onwriteend = function() {
						callback(0);
					};
					writer.onerror = function(err) {
						console.log("write err" + err.code)
						callback(err.code);
					};
					console.log(contents);
					var blob = new Blob([contents], {type:"text/plain"});
					writer.write(blob);
				});
			}, function(err) {
				console.warn("get file failed with error " + err.code);
				callback(err.code);
			});
		});
	},
	// callback(err, data)
	showOpenDialog: function(allowMultiple, chooseDirectories, title, initial, types, callback) {
		console.log("show open dialog requested.");
		if (chooseDirectories) {
			callback(0, "/");
		} else {
			callback(0, []);
		}
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
