var parser = (function() {
	var instance;

	var init = function() {
		var mm = require('musicmetadata');
		var fs = require('fs');
		var _  = require('underscore');
		
		return {
			parse: function(file, collection, callback) {
				var parser = mm(fs.createReadStream(file));
				parser.on('metadata', function(metadata) {
					var elem = _.pick(metadata, 'title', 'artist', 'albumArtist', 'album', 'genre');
					elem.filename = file;
					elem.id = _.uniqueId();

					collection.push(elem);
					if(callback) { callback(); }
				});

				parser.on('done', function(err) {
					if(err) {
						console.log(file);
						console.log(err);
					}
				});
			}
		};
	};

	return {
		getInstance: function() {
			if(!instance) {
				instance = init();
			}

			return instance;
		}
	};
})();

exports.parser = parser;