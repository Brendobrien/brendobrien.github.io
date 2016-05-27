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
      if(localStorage.workouts){
        $state.go('editWorkouts');
      }
      else {
        localStorage.workouts = [{}];
        $state.go('newWorkout');
      }
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
  if(localStorage.workouts){
    $scope.workouts = JSON.parse(localStorage.workouts);
  }
  else {
    $scope.workouts = [];
  }
  // $scope.workouts = Workouts.wos();

  console.log($scope.workoutDefault.edit);

  if($scope.workoutDefault.edit){
    $scope.currentWorkout = $scope.workouts[$scope.workoutDefault.woid];
    console.log($scope.workouts);
    $scope.currentWorkout.startTime =  new Date($scope.currentWorkout.startTime);
    $scope.currentWorkout.endTime =  new Date($scope.currentWorkout.endTime);
    $scope.currentWorkout.endDate =  new Date($scope.currentWorkout.endDate);
    console.log($scope.workouts);
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

    console.log($scope.workouts);

    if(!$scope.workoutDefault.edit){
      $scope.currentWorkout.id = $scope.workouts.length;
      $scope.workouts.push($scope.currentWorkout);
    }

    localStorage.workouts = JSON.stringify($scope.workouts);
  }
})

.controller('editWorkoutsCtrl', function($scope, $state, $window, Workouts, Events, Meals){
  $scope.workoutDefault = Workouts.defaults();
  if(localStorage.workouts){
    $scope.workouts = JSON.parse(localStorage.workouts);
  }
  else {
    $scope.workouts = []
  }
  // $scope.workouts = Workouts.wos();
  $scope.events = Events.all();
  $scope.meals = Meals.all();

  console.info($scope.workouts);
  // $state.go($state.current, {}, {reload: true});
  // $window.location.reload(true)

  $scope.editWorkout = function(workoutId){
    $scope.workoutDefault.edit = true;
    $scope.workoutDefault.woid = workoutId;
    $state.go('newWorkout');
  }

  $scope.deleteWorkout = function(workoutId){
    console.log(workoutId);
    $scope.workouts.splice(workoutId,1);
    localStorage.workouts = JSON.stringify($scope.workouts);
    console.log($scope.workouts);
  }

  $scope.createWorkout = function() {
    $scope.workoutDefault.edit = false;
    $state.go('newWorkout');
  }

  $scope.makeEvents = function(){
    // Translate Date to Google API JSON
    for(i = 0; i < $scope.workouts.length; i++){
      parseEvents(i);
    }

    // DELETE the previous calendar
    // if(localStorage.first) {
    //   deleteCalendar(); 
    // }
    // else {
    //   localStorage.first = "false"
    // }

    // POST a new calendar
    // insertCalendar();
    // TODO: make insert Calendar

    // $scope.events = $scope.events.concat($scope.meals);
    
    // POST events to the Google Calendar API
    for(i = 0; i < $scope.events.length; i++){
      postGAPI(i);
    }
  }

  function parseEvents(i){
    $scope.events[i] = {
      end: 
      {
        dateTime: "",
        timeZone: ""
      },
      start: 
      {
        dateTime: "",
        timeZone: ""
      },
      summary: "",
      recurrence: [
      ]
    };

    // dateTime
    $scope.events[i].end.dateTime = $scope.workouts[i].endTime;
    $scope.events[i].start.dateTime = $scope.workouts[i].startTime;

    // summary
    $scope.events[i].summary = $scope.workouts[i].sport + ": " + $scope.workouts[i].status;
    
    // recurrence
    var endDate = parseEndDate(i);

    $scope.events[i].recurrence[0] = "RRULE:FREQ=WEEKLY;UNTIL="+endDate+";BYDAY="
    for(j = 0; j < $scope.workouts[i].repeat.length; j++){
      if($scope.workouts[i].repeat[j].checked){
        $scope.events[i].recurrence[0] = $scope.events[i].recurrence[0] + $scope.workouts[i].repeat[j].text.substring(0,2)+",";
      }
    }

    // Timezone
    $scope.events[i].start.timeZone = jstz.determine().name();
    $scope.events[i].end.timeZone = jstz.determine().name();
  }

  function parseEndDate(i){
    $scope.workouts[i].endDate =  new Date($scope.workouts[i].endDate);

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

  function deleteCalendar(){
    var yolo = JSON.parse(localStorage.getItem('profile'));
    var yelo = yolo['identities'][0]['access_token'];

    // var header = new Headers();
    // header.append("Access-Control-Allow-Origin", "*");
    // header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars/'+localStorage.calendarId+'?access_token='+yelo, {
      method: "DELETE",
      // headers: header,
      // body: JSON.stringify($scope.events[i]),
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

  function getGAPI() {
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
