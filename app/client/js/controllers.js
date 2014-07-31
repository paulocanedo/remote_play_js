var $             = $ || null;
var angular       = angular || null;

var app = angular.module('remoteplayApp', ['ngTable']);

app.controller('MusicListCtrl', function ($scope, $http, $filter, ngTableParams) {
	$http.get('/playlist').success(function(data) {
		$scope.musics = data.result.playlist;
		data = data.result.playlist;

		$("#searchInput").typeahead({
			minLength: 1,
			hint: true,
			highlight: true
		},
		{
			name: 'musics',
			displayKey: 'title',
			source: function(query, process) {
				$http.get('/database/teste/search/' + query).success(function(data) {
					process(data.result.search.musics.slice(0, 8));
				});
			},
			templates: {
				header: '<p class="suggestion_category">Musics</p>',
			}
		},
		{
			name: 'albums',
			displayKey: 'album',
			source: function(query, process) {
				$http.get('/database/teste/search/' + query).success(function(data) {
					process(data.result.search.albums.slice(0, 3));
				});
			},
			templates: {
				header: '<p class="suggestion_category">Albums</p>',
			}
		},
		{
			name: 'artists',
			displayKey: 'artist',
			source: function(query, process) {
				$http.get('/database/teste/search/' + query).success(function(data) {
					process(data.result.search.artists.slice(0, 3));
				});
			},
			templates: {
				header: '<p class="suggestion_category">Artist</p>',
			}
		});

		$scope.tableParams = new ngTableParams({
	        page: 1,            // show first page
	        count: 500,         // count per page
	        sorting: {
	            album: 'asc',     // initial sorting,
	            track: 'asc'
	        }
	    }, {
	    	counts: [],
	        total: data.length, // length of data
	        getData: function($defer, params) {
	            // use build-in angular filter
	            var orderedData = params.sorting() ?
	                                $filter('orderBy')(data, params.orderBy()) :
	                                data;
	            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	        }
	    });
	});

	var playing = false;
	var intervalFnId = -1;

	var checkPlaying = function() {
		$http.get('/current').success(function(data) {
			playing = data.success;
		});
	};

	var updateData = function() {
		if(playing) {
			$http.get('/current').success(function(data) {
				if(data.success) {
					var metadata = data.result.metadata;

					if(metadata.current_time > 0) {
						$("#controlSeek").slider({ 
							max: metadata.duration,
							value: metadata.current_time
						});
					}

					$("#current_music").text(metadata.title + ' (' + metadata.album + ')');
				}
			}).error(function() {
				playing = false;
			});
		} else {
			$("#current_music").text('No music playing');
			clearInterval(intervalFnId);
			intervalFnId = -1;
		}
	};

	var startedPlay = function() {
		playing = true;
		$("#controlPlay").html('<span class="glyphicon glyphicon-pause"></span>');
		// $("#current_music").popover({content: 'Music Title'});

		if(intervalFnId === -1) {
			intervalFnId = setInterval(updateData, 1000);
		}
	};

	$scope.requestPlay = function(music) {
		$http.get('/play/' + music.id).success(function(data) {
			if(data.success) {
				startedPlay();
			}
		});
	};

	var evt_timestamp = 0;
	$('#controlSeek').slider({
		value: 0,
		enabled: false,
		formater: function(value) {
			return 'Music position: ' + value;
		}
	}).on('slide', function(evt) {
		if(evt.timeStamp - evt_timestamp > 1000) {
			$http.get('/seek/' + evt.value);
		}
		evt_timestamp = evt.timeStamp;
	});

	$("#controlPlay").on('click', function() {
		$http.get('/play').success(function(data) {
			if(data.success) {
				startedPlay();
			}
		});
	});

	$("#controlBackward").on('click', function() {
		$http.get('/previous').success(function(data) {
			if(data.success) {
				startedPlay();
			}
		});
	});

	$("#controlForward").on('click', function() {
		$http.get('/next').success(function(data) {
			if(data.success) {
				startedPlay();
			}
		});
	});

	checkPlaying();
	setTimeout(function() { if(playing) { startedPlay(); } }, 300);
});