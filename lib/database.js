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
	var musicdir = '/home/paulocanedo/Music';
	var database_dir = 'database';

	exports.DATABASE_DIR = basedir + '/' + database_dir;
	exports.MUSIC_DIR = musicdir;

	var walk    = require('walk');
	var fs      = require('fs');
	var u       = require('util');
	var _       = require('underscore');
	var s       = require('string');
	var md5     = require('MD5');
	var AV      = require('av');
	var request = require('request');
	var path    = require('path');

	var init = function(name) {
		var music_parser = require('./tag_parser/p_taglib.js').parser.getInstance();

		var database_name = name;
		var filepath = u.format('%s/%s/%s.json', basedir, database_dir, database_name);

		var js_database = [];

		var appendFile = function(file, callback) {
			var found =_.findWhere(js_database, {filename: file});
			if(found) {
				return;
			}
			music_parser.parse(file, js_database, callback);
		};

		return {
			all: function() {
				return _.extend(js_database);
			},
			musics: function(artist, album) {
				if(artist === undefined && album == undefined) {
					return _.extend(js_database);
				}

				var musics = _.filter(js_database, function(elem) {
					var t1 = artist === undefined ? true : elem.artist == artist;
					var t2 = album  === undefined ? true : elem.album  == album;

					return t1 && t2;
				});

				if(artist !== undefined) {
					var albums_names = Object.keys(_.groupBy(musics, 'album'));
					var albums = [];
					albums_names.forEach(function(alb_name) {
						var album_musics = _.filter(musics, function(e) { return e.album == alb_name; });
						var item = {
							artist_name: artist, 
							album_name: alb_name,
							musics: album_musics
						};
						console.log(item.album_name);
						albums.push(item);
					});
					return albums;
				}

				return musics;
			},
			artists: function() {
				var artists_norepeat = {};
				var artists_collection = [];

				js_database.forEach(function(elem) {
					if(artists_norepeat[elem.artist] === undefined && elem.artist.indexOf("&") <= 0) {
						var item = {};
						item.name = elem.artist;
						item.fanArt = elem.fanArt;
						artists_norepeat[elem.artist] = 1;
						artists_collection.push(item);
					}
				});
				return artists_collection;
			},
			fetch_artists_fanArt: function(artists) {
				var artists_norepeat = {};

				js_database.forEach(function(elem) {
					if(artists_norepeat[elem.artist] === undefined) {
						artists_norepeat[elem.artist] = 1;
						if(elem.fanArt !== undefined) {
							return;
						}

						request('http://www.theaudiodb.com/api/v1/json/1/search.php?s=' + elem.artist, function (error, response, body) {
						    if (!error && response.statusCode == 200) {
						        var data = JSON.parse(body);
						        if(data.artists != null) {
						        	elem.fanArt = data.artists[0].strArtistFanart;
						        } else {
						        	elem.fanArt = null;
						        }
						     }
						});
					}
				});
			},
			albums: function() {
				var albums_norepeat = {};
				var albums_collection = [];

				js_database.forEach(function(elem) {
					if(albums_norepeat[elem.album] === undefined) {
						var item = {};

						item.name = elem.album;
						item.coverArt = elem.coverArt;
						albums_norepeat[elem.album] = 1;
						albums_collection.push(item);
					}
				});
				return albums_collection;
			},
			find: function(id) {
				return _.find(js_database, function(elem) {
					return ''+id === elem.id;
				});
			},
			searchAlbum: function(album, artist) {

			},
			// create_album_cache: function(hash) {
			// 	var albums = _.groupBy(js_database, 'album');
			// 	var keys = Object.keys(albums);

			// 	var key = keys.find(function(elem) {
			// 		return md5(elem) == hash;
			// 	});

			// 	if(albums.key != undefined) {
			// 		var album = albums.key;
			// 		var musicfile = album.filename;

			// 		var asset = AV.Asset.fromFile(musicfile);
			// 		asset.get('metadata', function(metadata) {
			// 			if(metadata.lyrics) {
			// 				fs.writeFile('.cache/' + md5(musicfile) + '.lyric', metadata.lyrics.value);
			// 			}

			// 			var elem   = metadata.PIC   || metadata.coverArt;
			// 			var data   = elem.data.data || elem.data;
			// 			var buffer = new Buffer(data);

			// 			if(!metadata.album) {
			// 				return;
			// 			}
						
			// 			var stream = fs.createWriteStream('.cache/' + md5(metadata.album) + '');
			// 			stream.end(buffer);
			// 		});
			// 	}
			// },
			search: function(query) {
				if(!query) throw 'query param is required';

				query = query.toLowerCase();
				var musics = _.filter(js_database, function(elem) {
					var q2 = elem.title || '';
					q2 = q2.toLowerCase();
					
					return q2.indexOf(query) >= 0;
				});
				musics = _.map(musics, function(elem) {
					return {id: elem.id, title: elem.title, album: elem.album};
				});

				var albums = _.filter(js_database, function(elem) {
					var q2 = elem.album || '';
					q2 = q2.toLowerCase();

					return q2.indexOf(query) >= 0;
				});
				var albums2 = {};
				albums2 = _.map(albums, function(elem) {
					return {music_id: elem.id, album: elem.album};
				});
				albums2 = _.uniq(albums2, function(elem) {
					return elem.album;
				});

				var artists = _.filter(js_database, function(elem) {
					var q2 = elem.artist || '';
					q2 = q2.toLowerCase();

					return q2.indexOf(query) >= 0;
				});
				var artists2 = {};
				artists2 = _.map(artists, function(elem) {
					return {music_id: elem.id, artist: elem.artist};
				});
				artists2 = _.uniq(artists2, function(elem) {
					return elem.artist;
				});

				return {
					musics: musics,
					albums: albums2,
					artists: artists2
				};
			},
			name: function() {
				return database_name;
			},
			save: function() {
				fs.writeFileSync(filepath, JSON.stringify(js_database));
			},
			load: function() {
				js_database = require(filepath);
			},
			append: function(filepath, callback) {
				var stat = fs.statSync(filepath);
				if(stat.isFile()) {
					appendFile(filepath, callback);
				} else {
					var walker = walk.walk(filepath, {followLinks: false, filters: ['.mp3', '.m4a']});
					var files = [];
					walker.on('file', function(root, fileStats, next) {
						if (fileStats.name[0] !== '.' && _.contains(['.mp3', '.m4a'], path.extname(fileStats.name))) {
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
				if(fs.existsSync(filepath)) {
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
		list_fs: function(directory) {
			directory = directory || '';

			var result = fs.readdirSync(u.format('%s/%s', musicdir, directory));
			return result;
		},
		list_db: function() {
			var directory = basedir + '/' + database_dir;

			var result = fs.readdirSync(directory);
			result = _.filter(result, function(file) {
				return s(file).endsWith('.json');
			});

			result.forEach(function(a, b) {
				result[b] = a.slice(0, -('.json'.length));
			});

			return result;
		}
	};
})();

exports.db = database;