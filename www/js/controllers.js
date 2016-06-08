angular.module('brainbuild.controllers', [])

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
      $state.go('sidemenu.schedule');
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

  $scope.$on('$ionic.reconnectScope', function() {
    doAuth();
  });

  doAuth();
})

.controller('SidemenuCtrl', function($scope, auth, store, $state) {

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };
})

.controller('ScheduleCtrl', function($scope, $state, GoogleEvents, IonicEvents) {
  $scope.googleEvents = GoogleEvents.all();

  $scope.getEvents = function(){
    getGAPI();
  };

  function getGAPI() {
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];

    var header = new Headers();
    header.append("Access-Control-Allow-Origin", "*");

    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token='+token, {
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default',
    })
    .then(function(res) {
      if (res.status === 200) {
            res.json()
                .then(function(data) {
                    findBrainbuild(data);
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        } else {
            console.error(res); // comes back but not HTTP 200
            res.json()
                .then(function(data) {
                    console.log('not 200', data);
                    if (data.error.code === 401){
                      $state.go('login');
                    }
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        }
    })
    .catch(function(err) {
      console.error("errored", err);
    });
  };

  function findBrainbuild(data) {
    console.log(data);

    for(var i = 0; i < data.items.length; i++){
      var title = data.items[i].summary.toString();
      var endTitle = title.search("(Brainbuild)");

      console.log(endTitle)

      if(endTitle >= 0){
        var calendarId = data.items[i].id;
        console.log(calendarId);
      }
    }

    listBrainbuildEvents(calendarId);
  }

  function listBrainbuildEvents(calendarId){
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];

    var header = new Headers();
    header.append("Access-Control-Allow-Origin", "*");

    fetch('https://www.googleapis.com/calendar/v3/calendars/'+calendarId+'/events?access_token='+token, {
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default',
    })
    .then(function(res) {
      if (res.status === 200) {
            res.json()
                .then(function(data) {
                    parseEvents(data);
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        } else {
            console.error(res); // comes back but not HTTP 200
            res.json()
                .then(function(data) {
                    console.log('not 200', data);
                    if (data.error.code === 401){
                      $state.go('login');
                    }
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        }
    })
    .catch(function(err) {
      console.error("errored", err);
    });
  }

  function parseEvents(data){
    $scope.$apply(function(){
      $scope.googleEvents = data.items
    })

    for(var i = 0; i < $scope.googleEvents.length; i++){
      // console.log($scope.googleEvents[i].summary);
      if($scope.googleEvents[i].recurrence){
        var dayIndex = $scope.googleEvents[i].recurrence[0].search("BYDAY=")
        // console.log(dayIndex);

        if(dayIndex>=0 && dayIndex){
          // console.log($scope.googleEvents[i].recurrence[0].substring(dayIndex+6));
          $scope.googleEvents[i].dayRepeat = $scope.googleEvents[i].recurrence[0].substring(dayIndex+6);
        }
      }
      else{
        $scope.googleEvents[i].dayRepeat = "";
      } 

      console.log($scope.googleEvents[i].dayRepeat);
    }

    $scope.$apply(function(){
      $scope.googleEvents = $scope.googleEvents;
      localStorage.googleEvents = JSON.stringify(data.items);
    });
  }
})