/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';

(function() {
	var Player   = require('../lib/player.js');
	var Database = require('../lib/database.js');
	var Playlist = require('../lib/playlist.js');

	var connect  = require('connect');
	var fs       = require('fs');
	var http     = require('http');
	var u        = require("util");

	var database = Database.db.getInstance('teste');
	var player   = Player.create();
	var playlist = Playlist.create();

	var app = connect();

	(function() {
		database.all().forEach(function(music) {
			playlist.append(music);
		});

		player.setPlaylist(playlist);
	})();

	var executeCommand = function(args) {
		var command = args[1];
		var result = {};

		switch(command) {
			case 'info':
				result.info = require('../package.json');
				break;
			case 'togglePlayback':
				player.togglePlayback();
				break;
			case 'play':
				var music_id = args[2];
				var metadata;
				if(music_id) {
					metadata = database.find(music_id);
				}

				player.stop();
				player.play(metadata);
				break;
			case 'stop':
				player.stop();
				break;
			case 'next':
				player.next();
				break;
			case 'previous':
				player.previous();
				break;
			case 'current':
				result.metadata = playlist.currentMetadata();
				result.metadata.current_time = player.currentTime();

				break;
			case 'seek':
				var position = parseInt(args[2]);
				if(isNaN(position)) {
					throw "position is not a number";
				}

				player.seek(position);
				break;
			case 'playlist':
				result.playlist = playlist.list();
				break;
			case 'list_mfs':
				var path = decodeURIComponent(args.slice(2).join('/'));

				result.list_mfs = Database.db.list_fs(path);
				break;
			case 'volume':
				if(args[2]) {
					var vol = parseInt(args[2]);
					if(isNaN(vol)) {
						throw 'incorrect volume';
					}
					vol = Math.max(0, Math.min(100, vol));
					player.volume(vol);
				}

				result.volume = player.volume();
				break;
			case 'database':
				var dbname = args[2];
				var dbcommand = args[3];

				if(dbname === undefined || dbname.length === 0) {
					result.databases = Database.db.list_db();
				} else {
					var db = Database.db.getInstance(dbname);

					if(dbcommand === undefined || dbcommand.length === 0) {
						result.musics = db.all();
					} else {
						switch(dbcommand) {
							case 'append_all':
								db.append(Database.MUSIC_DIR, function() {db.save();});
								result.warning = 'this is an async command';

								break;
							case 'create':
								result.database_name = dbname;
								db.save();
								break;
						}
					}
				}
				break;
			default:
				throw u.format('command not found: %s', command);
		}

		return result;
	};

	app.use(function(req, res){
		var pathname = req._parsedUrl.pathname;
		var path_splitted = pathname.split('/');

		var success = true;
		var result = {};
		var msg_error;

		try {
			result = executeCommand(path_splitted);
		} catch(e) {
			success = false;
			msg_error = e;
		}

		result = {
			'success': success, 
			'msg_error': msg_error,
			'result': success === true ? result : undefined
		};

		if(pathname.indexOf('/client') === 0) {
			var file = 'app' + pathname;
			if (pathname[pathname.length-1] === '/') {
				file += 'index.htm';
			}

			if(fs.existsSync(file)) {
				res.end(fs.readFileSync(file));
			} else {
				res.end('not found: ' + file);
			}
		} else {
			res.setHeader('content-type', 'application/json');
			res.end(JSON.stringify(result));
		}
	});

	//create node.js http server and listen on port
	console.log('listening on *:3000');
	http.createServer(app).listen(3000);
})();
