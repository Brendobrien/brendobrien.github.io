angular.module('starter.controllers', [])
.controller('LoginCtrl', function($scope, auth, $state, store) {
  function doAuth() {
    auth.signin({
      closable: false,
      // This asks for the refresh token
      // So that the user never has to log in again
      authParams: {
        scope: 'openid offline_access'
      }
    }, function(profile, idToken, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('token', idToken);
      store.set('refreshToken', refreshToken);
      $state.go('newWorkout');
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

  $scope.$on('$ionic.reconnectScope', function() {
    doAuth();
  });

  doAuth();


})

.controller('newWorkoutCtrl', function($scope, Workouts) {
  $scope.workouts = Workouts.all();

  $scope.workouts[0].startTime.setUTCMinutes(0,0,0);
  $scope.workouts[0].endTime.setUTCHours($scope.workouts[0].startTime.getUTCHours()+1);
  $scope.workouts[0].endTime.setUTCMinutes(0,0,0);

  $scope.workouts.push("yolo");

  $scope.addWorkout = function(){
    console.info("Green Room");
    console.log($scope.workouts);
  }
})

.controller('editWorkoutsCtrl', function($scope, Workouts, Events){
  $scope.workouts = Workouts.all();
  $scope.events = Events.all();

  console.log($scope.workouts[0]);

  $scope.postGAPI = function() {
    var yolo = JSON.parse(localStorage.getItem('profile'));
    var yelo = yolo['identities'][0]['access_token'];
    console.log($scope.events[0]);

    var header = new Headers();
    header.append("Access-Control-Allow-Origin", "*");
    header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token='+yelo, {
      method: "POST",
      headers: header,
      body: JSON.stringify($scope.events[0]),
    })
    .then(function(res) {
        if (res.status === 200) {
            res.json()
                .then(function(data) {
                    console.log(data);
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        } else {
            console.error(res); // comes back but not HTTP 200
            res.json()
                .then(function(data) {
                    console.log('not 200', data);
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        }
      })
    .catch(function(err) {
        console.error('network error');
    });
  }
})

.controller('DashCtrl', function($scope, $http) {
  $scope.callApi = function() {
    // Just call the API as you'd do using $http
    var yolo = JSON.parse(localStorage.getItem('profile'));
    var yelo = yolo['identities'][0]['access_token'];
    console.log(yelo);

    var header = new Headers();
    header.append("Access-Control-Allow-Origin", "*");

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token='+yelo, {
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default',
    })
    .then(function(res) {
      console.log("success", res);
      res.json()
        .then(function(data) {
          console.info(data);
        });
    })
    .catch(function(err) {
      console.error("errored", err);
    });

    // $http({
    //   // You can get our Auth0 NodeJS seed project to host
    //   // the secured API from here: https://auth0.com/docs/quickstart/backend/nodejs/
    //   // url: 'http://localhost:3001/secured/ping',
    //   url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token='+yelo,
    //   method: 'GET'
    // }).then(function(yes) {
    //   alert("We got the secured data successfully");
    // }, function(yes) {
    //   alert("Please download the API seed so that you can call it.");
    //   console.log(yes);
    // });
  };
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, auth, store, $state) {
  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };
});
