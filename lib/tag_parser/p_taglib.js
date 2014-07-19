var parser = (function() {
	var instance;

	var init = function() {
		var taglib = require('taglib');
		var _      = require('underscore');

		return {
			parse: function(file, collection, callback) {
				taglib.read(file, function(err, tag, audioProperties) {
					if(!err) {
						var metadata = tag;
						metadata.duration = audioProperties.length * 1000;

						var elem = metadata;
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