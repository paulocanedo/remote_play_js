/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';

exports.create = function() {
	var fs  = require('fs');
	var md5 = require('MD5');
	var AV  = require('av');
	require('mp3');
	require('aac');
	require('alac');

	var player = null;
	var playlist = null;
	var _volume = 100;

	var root;

	var checkPlayer = function() {
		if(!player) {
			throw 'not playing';
		}
	};

	return {
		genCache: function(metadata) {
			var asset = AV.Asset.fromFile(metadata.filename);
			asset.get('metadata', function(m) {
				if(m.lyrics && m.lyrics.value) {
					fs.writeFile('.cache/' + metadata.id + '.lyric', m.lyrics.value);
				}

				var elem   = m.PIC   || m.coverArt;
				if(!elem) {
					return;
				}
				if(!elem.data) {
					return;
				}

				var data   = elem.data.data || elem.data;
				var buffer = new Buffer(data);

				if(!metadata.album) {
					return;
				}
				var coverArtFile = '.cache/' + md5(metadata.album) + '';
				if(fs.existsSync(coverArtFile)) {
					return;
				}
				
				var stream = fs.createWriteStream(coverArtFile);
				stream.end(buffer);
			});
		},
		play: function(metadata) {
			metadata = metadata || playlist.next();
			if(metadata === null) {
				this.stop();

				throw "nothing to play";
			}

			player = AV.Player.fromFile(metadata.filename);
			player.on('end', this.next);
			player.once('error', function(e) { throw e;});

			player.volume = _volume;
			player.play();
		},
		togglePlayback: function() {
			player.togglePlayback();
		},
		stop: function() {
			if(player) {
				player.stop();
			}
		},
		seek: function(timestamp) {
			player.seek(timestamp);
		},
		currentTime: function() {
			checkPlayer();
			return player.currentTime;
		},
		next: function() {
			if(player && player.playing) {
				root.stop();
			}

			root.play(playlist.next());
		},
		volume: function(vol) {
			if(vol !== undefined) {
				_volume = Math.min(100, Math.max(0, vol));
				if(player) {
					player.volume = vol;
				}
			}
			return _volume;
		},
		previous: function() {
			if(player && player.playing) {
				this.stop();
			}

			this.play(playlist.previous());
		},
		setPlaylist: function(_playlist, autoplay) {
			autoplay = autoplay || false;
			playlist = _playlist;
		},
		init: function() {
			return root = this;
		}
	}.init();
};