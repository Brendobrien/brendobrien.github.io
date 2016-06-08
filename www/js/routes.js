angular.module('brainbuild.routes', [])

.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('login', {
		url: "/login",
		templateUrl: "templates/login.html",
		controller: 'LoginCtrl'
	})

	.state('sidemenu',{
		url: "/sidemenu",
		templateUrl: "templates/sidemenu.html",
		controller: "SidemenuCtrl",
		abstract: true
	})

	.state('sidemenu.schedule', {
		url: "/schedule",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/schedule.html",
				controller: 'ScheduleCtrl'
			}
		}
	})

	.state('sidemenu.snack', {
		url: "/snack",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/snack.html",
			}
		}
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');
})
