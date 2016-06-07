angular.module('brainbuild.services', [])

.factory('Events', function(){
	var events = ["yes"];

	return {
		all: function(){
			return events;
		}
	}
})