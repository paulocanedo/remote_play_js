var $             = $ || null;
var angular       = angular || null;

var app = angular.module('remoteplayApp', ['ngTable']);

app.controller('MusicListCtrl', function ($scope, $http, $filter, ngTableParams) {
	$http.get('/playlist').success(function(data) {
		$scope.musics = data.result.playlist;
		data = data.result.playlist;

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
			});
		} else {
			clearInterval(intervalFnId);
			intervalFnId = -1;
		}
	};

	var startedPlay = function() {
		playing = true;
		$("#controlPlay").html('<span class="glyphicon glyphicon-pause"></span>');
		if(intervalFnId !== -1) {
			intervalFnId = setInterval(updateData, 1000);
		}
	};

	$scope.requestPlay = function(music) {
		$http.get('/play/' + music.id).success(function(data) {
			if(data.success) {
				startedPlay();
			} else {
				console.log('fail playing music');
			}
		});
	};

	checkPlaying();
	setTimeout(function() { if(playing) { startedPlay(); } }, 300);
	$('#controlSeek').slider({
		value: 0,
		enabled: false,
		formater: function(value) {
			return 'Music position: ' + value;
		}
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
});