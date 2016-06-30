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

	.state('sidemenu.practice', {
		url: "/practice",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/practice.html",
			}
		}
	})

	.state('sidemenu.recovery', {
		url: "/recovery",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/recovery.html",
			}
		}
	})

	.state('sidemenu.meal', {
		url: "/meal",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/meal.html",
			}
		}
	})

	.state('sidemenu.breakfast', {
		url: "/breakfast",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/breakfast.html",
				controller: "MealCtrl"
			}
		}
	})

	.state('sidemenu.lunch', {
		url: "/lunch",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/lunch.html",
				controller: "MealCtrl"
			}
		}
	})

	.state('sidemenu.dinner', {
		url: "/dinner",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/dinner.html",
			}
		}
	})

	.state('sidemenu.sleep', {
		url: "/sleep",
		views: {
			'side-menu-bb': {
				templateUrl: "templates/sleep.html",
			}
		}
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');
})
