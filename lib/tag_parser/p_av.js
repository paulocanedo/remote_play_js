var parser = (function() {
	var instance;

	var init = function() {
		var AV = require('av');
		var _  = require('underscore');

		return {
			parse: function(file, collection, callback) {
				var asset = AV.Asset.fromFile(file);

				asset.on('error', function(err) {
						console.log(file);
						console.log(err);
				});

				asset.get('metadata', function(metadata) {
					var elem = _.pick(metadata, 'title', 'artist', 'albumArtist', 'album', 'genre');
					elem.filename = file;
					elem.id = _.uniqueId();

					collection.push(elem);
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