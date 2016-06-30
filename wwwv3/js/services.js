angular.module('brainbuild.services', [])

.factory('GoogleEvents', function(){
	var googleEvents = [];

	var date = new Date();	

	return {
		all: function(){
			return googleEvents;
		},
		date: function(){
			return date;
		}
	}
})
