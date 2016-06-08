angular.module('brainbuild.services', [])

.factory('GoogleEvents', function(){
	if(localStorage.googleEvents){
		var googleEvents = JSON.parse(localStorage.googleEvents);
	}
	else {
		var googleEvents = [{summary:"yes"}];
	}

	return {
		all: function(){
			return googleEvents;
		}
	}
})

.factory('IonicEvents', function(){
	var ionicEvents = [];

	return {
		all: function(){
			return ionicEvents;
		}
	}
})