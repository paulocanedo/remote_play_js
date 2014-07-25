var remoteplayApp = angular.module('remoteplayApp', []);

remoteplayApp.controller('MusicListCtrl', function ($scope, $http) {
	$http.get('/playlist').success(function(data) {
		$scope.musics = data.result.playlist;
	});

	$scope.requestPlay = function(music) {
		$http.get('/play/' + music.id).success(function(data) {
			console.log(data);
		});
	};
});