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
      $state.go('editWorkouts');
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
  $scope.workoutDefault = Workouts.defaults();
  $scope.workouts = Workouts.wos();

  console.log($scope.workoutDefault.edit);
  console.log($scope.workoutDefault.woid);

  if($scope.workoutDefault.edit){
    $scope.currentWorkout = $scope.workouts[$scope.workoutDefault.woid];
  }
  else {
    $scope.currentWorkout = $scope.workoutDefault;

    $scope.currentWorkout.startTime.setUTCMinutes(0,0,0);
    $scope.currentWorkout.endTime.setUTCHours($scope.currentWorkout.startTime.getUTCHours()+1);
    $scope.currentWorkout.endTime.setUTCMinutes(0,0,0);
  }

  $scope.addWorkout = function(){
    // Reset Default
    // $scope.workoutDefault.id = 0;
    // $scope.workoutDefault.sport = "Baseball";
    // $scope.workoutDefault.status = "Pre-Season (High Intensity)";
    // $scope.workoutDefault.startTime = new Date();
    // $scope.workoutDefault.endTime = new Date();
    // $scope.workoutDefault.endDate = new Date();
    // $scope.workoutDefault.repeat = [
    //   { text: "SUN", checked: false },
    //   { text: "MON", checked: false },
    //   { text: "TUE", checked: false },
    //   { text: "WED", checked: false },
    //   { text: "THU", checked: false },
    //   { text: "FRI", checked: false },
    //   { text: "SAT", checked: false }
    // ];
    // $scope.workoutDefault.edit = false;
    // $scope.workoutDefault.woid = 0;
    // console.log($scope.currentWorkout);

    if(!$scope.workoutDefault.edit){
      $scope.currentWorkout.id = $scope.workouts.length;
      $scope.workouts.push($scope.currentWorkout);
    }
  }
})

.controller('editWorkoutsCtrl', function($scope, $state, Workouts, Events, Meals){
  $scope.workoutDefault = Workouts.defaults();
  $scope.workouts = Workouts.wos();
  $scope.events = Events.all();
  $scope.meals = Meals.all();

  console.log($scope.workouts);

  $scope.editWorkout = function(workoutId){
    $scope.workoutDefault.edit = true;
    $scope.workoutDefault.woid = workoutId;
    $state.go('newWorkout');
  }

  $scope.deleteWorkout = function(workoutId){
    console.log(workoutId);
    $scope.workouts.splice(workoutId,1);
    console.log($scope.workouts);
  }

  $scope.createWorkout = function() {
    $scope.workoutDefault.edit = false;
    $state.go('newWorkout');
  }

  $scope.makeEvents = function(){
    for(i = 0; i < $scope.workouts.length; i++){
      parseEvents(i);
    }

    // $scope.events = $scope.events.concat($scope.meals);

    for(i = 0; i < $scope.events.length; i++){
      postGAPI(i);
    }
  }

  function parseEvents(i){
    $scope.events[i] = {
      end: 
      {
        dateTime: "",
        timeZone: "America/New_York"
      },
      start: 
      {
        dateTime: "",
        timeZone: "America/New_York"
      },
      summary: "",
      recurrence: [
      ]
    };

    $scope.events[i].end.dateTime = $scope.workouts[i].endTime;
    $scope.events[i].start.dateTime = $scope.workouts[i].startTime;
    $scope.events[i].summary = $scope.workouts[i].sport + ": " + $scope.workouts[i].status;
    
    var endDate = parseEndDate(i);

    $scope.events[i].recurrence[0] = "RRULE:FREQ=WEEKLY;UNTIL="+endDate+";BYDAY="
    for(j = 0; j < $scope.workouts[i].repeat.length; j++){
      if($scope.workouts[i].repeat[j].checked){
        $scope.events[i].recurrence[0] = $scope.events[i].recurrence[0] + $scope.workouts[i].repeat[j].text.substring(0,2)+",";
      }
    }    
  }

  function parseEndDate(i){
    var yyyy = $scope.workouts[i].endDate.getFullYear();
    var mm = $scope.workouts[i].endDate.getMonth()+1; //January is 0!
    var dd = $scope.workouts[i].endDate.getDate();
    
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 

    return yyyy+mm+dd+"T170000Z";
    // return "20160701T170000Z";
  }

  function postGAPI(i) {
    var yolo = JSON.parse(localStorage.getItem('profile'));
    var yelo = yolo['identities'][0]['access_token'];
    console.log($scope.events[i]);

    var header = new Headers();
    //header.append("Access-Control-Allow-Origin", "*");
    header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token='+yelo, {
      method: "POST",
      headers: header,
      body: JSON.stringify($scope.events[i]),
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
                    $state.go('login');
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

  $scope.getGAPI = function() {
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
  };
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