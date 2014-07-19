var Player   = require('../lib/player.js');
var Database = require('../lib/database.js');
var Playlist = require('../lib/playlist.js');


var database = Database.db.getInstance('teste');
var player   = Player.create();
var playlist = Playlist.create();


// var asset = database.find(1);
playlist.append(database.find(1));
playlist.append(database.find(2));
playlist.append(database.find(3));
playlist.append(database.find(4));
// playlist.setRepeat(true);

player.setPlaylist(playlist);
// player.next();


	// player.play();
	// player.stop();
	// player.stop();
// setTimeout(function() {
// 	player.stop();
// 	// player.seek(10000);
// }, 1000);

player.next();

setTimeout(function() {
	player.next()
}, 2000);

setTimeout(function() {
	player.next();
}, 4000);

setTimeout(function() {
	player.seek(95000);
}, 6000);

// player.play(asset);
// player.play();