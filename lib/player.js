/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';

exports.create = function() {
	var AV = require('av');
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