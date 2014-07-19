/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';


var database = (function() {
	var instances = [];
	var basedir  = 'work';
	var musicdir = '/home/paulocanedo/Música';
	var database_dir = 'database';

	var walk   = require('walk');
	var fs     = require('fs');
	var u      = require('util');
	var _      = require('underscore');

	var init = function(name) {
		var music_parser = require('./tag_parser/p_taglib.js').parser.getInstance();

		var database_name = name;
		var path = u.format('%s/%s/%s.json', basedir, database_dir, database_name);

		var js_database = [];

		var appendFile = function(file, callback) {
			var found =_.findWhere(js_database, {filename: file});
			if(found) {
				return;
			}

			music_parser.parse(file, js_database, callback);
		};

		return {
			find: function(id) {
				var result = null;

				js_database.every(function(elem) {
					if(''+id === elem.id) {
						result = elem;
						return false;
					}
					return true;
				});
				
				return result;
			},
			name: function() {
				return database_name;
			},
			save: function() {
				fs.writeFileSync(path, JSON.stringify(js_database));
			},
			load: function() {
				js_database = require(path);
			},
			append: function(path, callback) {
				var stat = fs.statSync(path);
				if(stat.isFile()) {
					appendFile(path, callback);
				} else {
					var walker = walk.walk(path, {followLinks: false, filters: ['.mp3', '.m4a']});
					var files = [];
					walker.on('file', function(root, fileStats, next) {
						if (fileStats.name[0] !== '.') {
							var file = u.format('%s/%s', root, fileStats.name);
							files.push(file);
						}
						next();
					});

					walker.on('end', function() {
						for(var i=0; i<files.length; i++) {
							var file = files[i];

							appendFile(file, (i === files.length -1) ? callback : undefined);
						}
					});
				}
			},
			init: function() {
				if(fs.existsSync(path)) {
					this.load();
				}
				return this;
			}
		}.init();
	};
	return {
		getInstance: function(name) {
			if(!instances[name]) {
				instances[name] = init(name);
			}

			return instances[name];
		},
		list: function(directory) {
			directory = directory || '';

			var result = fs.readdirSync(u.format('%s/%s', musicdir, directory));
			return result;
		}
	};
})();

// var db = database.getInstance('teste');
// db.append('/home/paulocanedo/Música/', function() { db.save(); });

exports.db = database;