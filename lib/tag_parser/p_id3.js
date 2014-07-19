var parser = (function() {
	var instance;

	var init = function() {
		var id3 = require('id3js');
		var _   = require('underscore');

		return {
			parse: function(file, collection, callback) {
				id3({ file: file, type: id3.OPEN_LOCAL }, function(err, metadata) {
					if(!err) {
						var elem = _.pick(metadata, 'title', 'artist', 'album', 'year');
						elem.filename = file;
						elem.id = _.uniqueId();

						collection.push(elem);
					}
					if(callback) { callback(); }
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