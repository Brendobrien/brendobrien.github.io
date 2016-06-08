angular.module('brainbuild.services', [])

.factory('GoogleEvents', function(){
	if(localStorage.googleEvents){
		var googleEvents = JSON.parse(localStorage.googleEvents);
	}
	else {
		var googleEvents = [];
	}

	if(localStorage.date){
		var date = JSON.parse(localStorage.date);
	}
	else {
		var date = new Date();
	}

	return {
		all: function(){
			return googleEvents;
		},
		date: function(){
			return date;
		}
	}
})
