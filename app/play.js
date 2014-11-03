var Player   = require('../lib/player.js');
var Database = require('../lib/database.js');
var Playlist = require('../lib/playlist.js');


var database = Database.db.getInstance('teste');
var player   = Player.create();
var playlist = Playlist.create();

var _   = require('underscore');
var md5 = require('MD5');
var fs  = require('fs');
var AV  = require('av');
var Type = require('type-of-is');
var musicfile = '/home/paulocanedo/Music/Michael Jackson/Immortal/01 Workin\' Day And Night (Immortal V.m4a';
// var musicfile = '/home/paulocanedo/Música/Scorpions/Acoustica/02 Always Somewhere.m4a';
// var musicfile = '/home/paulocanedo/Music/Aerosmith/A Little South Of Sanity/11 Sweet Emotion.mp3';
// var musicfile = '/home/paulocanedo/Música/Coldplay/Left Right Left Right Left/06 Viva La Vida.mp3';
// var musicfile = '/home/paulocanedo/Música/Engenheiros do Hawaii/10.000 Destinos - Ao Vivo/01 A Montanha.m4a';

// database.append(Database.MUSIC_DIR, function() {database.save();});

database.all().forEach(function(e) {
	var musicfile = e.filename;
	console.log('working on', musicfile);
	

var asset = AV.Asset.fromFile(musicfile);
asset.on('error', function(err) {
		console.log(musicfile);
		console.log(err);
});

asset.get('metadata', function(metadata) {
	var cover_filename = '.cache/' + md5(metadata.artist + metadata.album) + '';

	console.log('metadata on', musicfile);
	// if(metadata.lyrics) {
	// 	fs.writeFile('.cache/' + e.id + '.lyric', metadata.lyrics.value);
	// }

	if(fs.existsSync(cover_filename)) {
		return;
	}

	var elem   = metadata.PIC   || metadata.coverArt;
	if(!elem) return;

	var data   = elem.data.data || elem.data;
	var buffer = new Buffer(data);

	if(!metadata.album) {
		return;
	}
	
	var stream = fs.createWriteStream(cover_filename);
	stream.end(buffer);
});

});