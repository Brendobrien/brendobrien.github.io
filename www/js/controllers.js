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
        $state.go('workoutsList');
      }
      else {
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

.controller('newWorkoutCtrl', function($scope, $state, Workouts) {
  // load factories
  $scope.workoutDefault = Workouts.defaults();
  $scope.workouts = Workouts.wos();

  $scope.workoutDefault.startTime.setUTCMinutes(0,0,0);
  $scope.workoutDefault.endTime.setUTCHours($scope.workoutDefault.startTime.getUTCHours()+1);
  $scope.workoutDefault.endTime.setUTCMinutes(0,0,0);

  $scope.currentWorkout = angular.copy($scope.workoutDefault);

  $scope.addWorkout = function(){
    $scope.currentWorkout.woId = $scope.workouts.length;
    $scope.workouts.push($scope.currentWorkout);

    for(i = 0; i < $scope.workouts.length; i++){
      $scope.workouts[i].woId = i;
    }
    localStorage.workouts = JSON.stringify($scope.workouts);
    $state.go('workoutsList');
  }
})

.controller('editWorkoutCtrl', function($scope, $state, $stateParams, Workouts) {
  console.log($state);
  console.log($stateParams.woId);
  $scope.currentWorkout = Workouts.get($stateParams.woId);

  // avoid parsing problems
  $scope.currentWorkout.startTime =  new Date($scope.currentWorkout.startTime);
  $scope.currentWorkout.endTime =  new Date($scope.currentWorkout.endTime);
  $scope.currentWorkout.endDate =  new Date($scope.currentWorkout.endDate);

  $scope.changeWorkout = function(){
    // console.log(woId);
    $state.go('workoutsList');
  }
})

.controller('workoutsListCtrl', function($scope, $state, $window, Workouts, Events, Meals){
  // load factories 
  $scope.workoutDefault = Workouts.defaults();
  $scope.workouts = Workouts.wos();
  $scope.events = Events.all();
  $scope.meals = Meals.all();

  $scope.editWorkout = function(workoutId){
    console.log(workoutId);
    $state.go('editWorkout', {woId:workoutId});
  }

  $scope.deleteWorkout = function(workoutId){
    $scope.workouts.splice(workoutId,1);
    for(i = 0; i < $scope.workouts.length; i++){
      $scope.workouts[i].woId = i;
    }
    localStorage.workouts = JSON.stringify($scope.workouts);
  }

  $scope.createWorkout = function() {
    $state.go('newWorkout');
  }

  $scope.refreshWorkouts = function(){
    for(i = 0; i < $scope.workouts.length; i++){
      $scope.workouts[i].woId = i;
    }
    localStorage.workouts = JSON.stringify($scope.workouts);
    // $state.go($state.current, {}, {reload: true});
  }

  $scope.makeEvents = function(){
    // Translate Date to Google API JSON
    for(i = 0; i < $scope.workouts.length; i++){
      parseEvents(i);
    }

    // DELETE the previous calendar
    if(localStorage.calendarId) {
      deleteCalendar(); 
    }

    // POST a new calendar
    insertCalendar();
    // TODO: make insert Calendar

    // $scope.events = $scope.events.concat($scope.meals);
    
    // POST events to the Google Calendar API
    // for(i = 0; i < $scope.events.length; i++){
    //   postGAPI(i);
    // }
  }

  $scope.deleteCalendarButton = function(){
    deleteCalendar();
  }

  $scope.insertCalendarButton = function(){
    insertCalendar()
    // .then(function(res){
    //   colorCalendar(res)
    // });
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
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];
    var calid = localStorage.getItem('calendarId');

    // var brainbuild = {
    //   calendarId: calid
    // };

    // var header = new Headers();
    //header.append("Access-Control-Allow-Origin", "*");
    // header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars/'+calid+'?access_token='+token, {
      method: "DELETE",
      // headers: header,
      // body: JSON.stringify(brainbuild),
    })
    .then(function(res) {
        if (res.status === 204) {
          console.log(res);
          localStorage.removeItem("calendarId");
        } else {
            console.error(res); // comes back but not HTTP 200
            res.json()
                .then(function(data) {
                    console.log('not 204', data);
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
        console.error('network error');
    });
  }

  function insertCalendar(){
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];

    var brainbuild = {
      summary: "Brainbuild"
    };

    var bbcolor = {
      backgroundColor: "#ff3800",
      foregroundColor: "#ffffff",
      selected: true
    };

    var calid;

    var header = new Headers();
    header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars?access_token='+token, {
      method: "POST",
      headers: header,
      body: JSON.stringify(brainbuild),
    })
    .then(function(res) {
        if (res.status === 200) {
            res.json()
                .then(function(data) {
                    console.log(data);
                    
                    localStorage.calendarId = data.id;

                  //   fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/'+data.id+'?colorRgbFormat=true&access_token='+token, {
                  //     method: "PUT",
                  //     headers: header,
                  //     body: JSON.stringify(bbcolor),
                  //   })
                  //   .then(function(res) {
                  //     if (res.status === 200) {
                  //         res.json()
                  //             .then(function(data) {
                  //                 console.log(data);

                  //                 for(i = 0; i < $scope.events.length; i++){
                  //                   postGAPI(i);
                  //                 }

                  //                 // window.location.href = 'https://calendar.google.com/';
                  //             })
                  //             .catch(function(parseErr) {
                  //                 console.error(parseErr);
                  //             });
                  //     } else {
                  //         console.error(res); // comes back but not HTTP 200
                  //         res.json()
                  //             .then(function(data) {
                  //                 console.log('not 200', data);
                  //                 if (data.error.code === 401){
                  //                   $state.go('login');
                  //                 }
                  //             })
                  //             .catch(function(parseErr) {
                  //                 console.error(parseErr);
                  //             });
                  //     }
                  //   })
                  // .catch(function(err) {
                  //     console.error('network error');
                  // })

                  for(i = 0; i < $scope.events.length; i++){
                    postGAPI(i);
                  }

                  window.location.href = 'https://calendar.google.com/';
                })
                .catch(function(parseErr) {
                    console.error(parseErr);
                });
        } 
        else {
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
        console.error('network error');
    })
  }

  function doA() {
    return new Promise((resolve, reject) => {
      // do something

      if (success) {
        resovle(data); // data is the resolved value in the promise, you can get it in .then() as parameter
      } else if (failure)
        reject(error); // error is what you get in .catch() as parameter
    });
  }

  function colorCalendar(calid){
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];
    // var calid = localStorage.calendarId;
    localStorage.setItem("calendarId") = calid;

    var bbcolor = {
      "backgroundColor": "#ff3800",
      "foregroundColor": "#ffffff"
    };

    var header = new Headers();
    header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/'+calid+'?colorRgbFormat=true&access_token='+token, {
      method: "PUT",
      headers: header,
      body: JSON.stringify(bbcolor),
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
        console.error('network error');
    })
  }

  function postGAPI(i) {
    var person = JSON.parse(localStorage.getItem('profile'));
    var token = person['identities'][0]['access_token'];
    console.log($scope.events[i]);

    var header = new Headers();
    //header.append("Access-Control-Allow-Origin", "*");
    header.append("Content-Type", "application/json");

    fetch('https://www.googleapis.com/calendar/v3/calendars/'+localStorage.calendarId+'/events?access_token='+token, {
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
        console.error('network error');
    });
  }

  $scope.deleteLocalStorage = function(){
    localStorage.removeItem("workouts");
  }

  $scope.refreshPage = function(){
    document.location.reload(true);
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
