var Player   = require('../lib/player.js');
var Database = require('../lib/database.js');
var Playlist = require('../lib/playlist.js');


// var database = Database.db.getInstance('teste');
var player   = Player.create();
var playlist = Playlist.create();

var _   = require('underscore');
var md5 = require('MD5');
var fs  = require('fs');
var AV  = require('av');
var Type = require('type-of-is');
var musicfile = '/home/paulocanedo/Música/Scorpions/Acoustica/02 Always Somewhere.m4a';
// var musicfile = '/home/paulocanedo/Music/Aerosmith/A Little South Of Sanity/11 Sweet Emotion.mp3';
// var musicfile = '/home/paulocanedo/Música/Coldplay/Left Right Left Right Left/06 Viva La Vida.mp3';
// var musicfile = '/home/paulocanedo/Música/Engenheiros do Hawaii/10.000 Destinos - Ao Vivo/01 A Montanha.m4a';

var asset = AV.Asset.fromFile(musicfile);
asset.on('error', function(err) {
		console.log(musicfile);
		console.log(err);
});

asset.get('metadata', function(metadata) {
	if(metadata.lyrics) {
		fs.writeFile('.cache/' + md5(musicfile) + '.lyric', metadata.lyrics.value);
	}

	var elem   = metadata.PIC   || metadata.coverArt;
	var data   = elem.data.data || elem.data;
	var buffer = new Buffer(data);

	if(!metadata.album) {
		return;
	}
	
	var stream = fs.createWriteStream('.cache/' + md5(metadata.album) + '');
	stream.end(buffer);
});