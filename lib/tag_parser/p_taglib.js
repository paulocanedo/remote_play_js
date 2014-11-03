var parser = (function() {
	var instance;

	var init = function() {
		var taglib = require('taglib');
		var _      = require('underscore');
		var md5    = require('MD5');

		return {
			parse: function(file, collection, callback) {
				taglib.read(file, function(err, tag, audioProperties) {
					if(!err) {
						var metadata = tag;
						metadata.duration = audioProperties.length * 1000;

						var elem = metadata;
						elem.filename = file;
						elem.id = _.uniqueId();
						elem.coverArt = 'http://192.168.0.201:3000/client/cover_art/' + md5(elem.artist + elem.album);

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