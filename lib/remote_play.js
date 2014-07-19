/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';
var AV = require('av');
require('mp3');

exports.awesome = function() {
	var player = AV.Player.fromFile("/home/paulocanedo/Desktop/a.mp3");

	player.on('metadata', function(data) {
		console.log(data.title);
	});

	player.play();

	return player;
};
