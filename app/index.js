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

	var connect = require('connect');
	var http    = require('http');
	var u       = require("util");

	var app = connect();

	var database = Database.db.getInstance('teste');
	var player   = Player.create();
	var playlist = Playlist.create();

	(function() {
		playlist.append(database.find(1));
		playlist.append(database.find(2));
		playlist.append(database.find(3));
		playlist.append(database.find(4));

		player.setPlaylist(playlist);
	})();

	var executeCommand = function(args) {
		var command = args[1];
		var metadata, current_time, playlist_out, list_mfs, volume;

		switch(command) {
			case 'togglePlayback':
				player.togglePlayback();
				break;
			case 'play':
				player.play();
				break;
			case 'next':
				player.next();
				break;
			case 'previous':
				player.previous();
				break;
			case 'current':
				metadata = playlist.currentMetadata();
				current_time = player.currentTime();

				break;
			case 'seek':
				var position = parseInt(args[2]);
				if(isNaN(position)) {
					throw "position is not a number";
				}

				player.seek(position);
				break;
			case 'playlist':
				playlist_out = playlist.list();
				break;
			case 'list_mfs':
				var path = decodeURIComponent(args.slice(2).join('/'));

				list_mfs = Database.db.list(path);
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


				volume = player.volume();
				break;
			default:
				throw u.format('command not found: %s', command);
		}

		return {
			'metadata': metadata,
			'current_time': current_time,
			'playlist': playlist_out,
			'list_mfs': list_mfs,
			'volume': volume
		};
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
			'current_time': result.current_time,
			'metadata': result.metadata, 
			'playlist': result.playlist,
			'list_mfs': result.list_mfs,
			'volume': result.volume,
			'msg_error': msg_error
		};

		res.setHeader('content-type', 'application/json');
		res.end(JSON.stringify(result));
	});

	//create node.js http server and listen on port
	http.createServer(app).listen(3000);
})();
