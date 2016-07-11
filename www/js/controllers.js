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
  $scope.workouts = Workouts.wos();
  $scope.currentWorkout = Workouts.get($stateParams.woId);

  // avoid parsing problems
  $scope.currentWorkout.startTime =  new Date($scope.currentWorkout.startTime);
  $scope.currentWorkout.endTime =  new Date($scope.currentWorkout.endTime);
  $scope.currentWorkout.endDate =  new Date($scope.currentWorkout.endDate);

  $scope.changeWorkout = function(){
    for(i = 0; i < $scope.workouts.length; i++){
      $scope.workouts[i].woId = i;
    }
    localStorage.workouts = JSON.stringify($scope.workouts);

    $state.go('workoutsList');
  }
})

.controller('workoutsListCtrl', function($scope, $state, auth, store, Workouts, Events, Meals, Snacks){
  // load factories 
  // workouts
  $scope.workouts = Workouts.wos();
  // breakfast lunch dinner
  $scope.meals = Meals.all();
  // pre & post workout
  $scope.snacks = Snacks.all();

  // google api events (JSON)
  $scope.events = Events.all();

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
    $scope.events = [];
    $scope.snacks = [];
    // Translate Date to Google API JSON
    for(i = 0; i < $scope.workouts.length; i++){
      parseEvents(i);
      makeSnacks(i);
    }

    mealDefaults();

    // // Which breakfast lunch and dinner?
    // var bldNumbers = [0, 0, 0];
    // for(i = 0; i < $scope.workouts.length; i++){
    //   for(j = 0; j < $scope.meals.length; j++){
    //     bldNumbers = workoutMealOverlap(i,j,bldNumbers)
    //   }
    // }

    // console.log(bldNumbers);
    // switchCases(bldNumbers);

    // for(i = 0; i < $scope.workouts.length; i++){
    //   for(j = 0; j < $scope.meals.length; j++){
    //     bldNumbers = workoutMealOverlap(i,j,bldNumbers)
    //   }
    // }

    // console.log(bldNumbers);
    // switchCases(bldNumbers);

    for(j = 0; j < $scope.meals.length; j++){
      for(k = 0; k < $scope.snacks.length; k++){
        mealSnackOverlap(j,k);
      }
    }

    // DELETE the previous calendar
    if(localStorage.calendarId) {
      deleteCalendar(); 
    }

    // POST a new calendar
    insertCalendar();
  }

  function mealDefaults(){
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth();
    var year = today.getFullYear();

    for(i = 0; i < $scope.meals.length; i++){
      $scope.meals[i].start.dateTime = new Date ($scope.meals[i].start.dateTime);
      $scope.meals[i].start.dateTime.setDate(day);
      $scope.meals[i].start.dateTime.setMonth(month);
      $scope.meals[i].start.dateTime.setFullYear(year);

      $scope.meals[i].end.dateTime = new Date ($scope.meals[i].end.dateTime);
      $scope.meals[i].end.dateTime.setDate(day);
      $scope.meals[i].end.dateTime.setMonth(month);
      $scope.meals[i].end.dateTime.setFullYear(year);

      $scope.meals[i].start.timeZone = jstz.determine().name();
      $scope.meals[i].end.timeZone = jstz.determine().name();
    }
  }

  function workoutMealOverlap(i,j,bldNumbers) {
    var workoutStart = new Date($scope.events[i].start.dateTime);
    var workoutEnd = new Date($scope.events[i].end.dateTime);
    var mealStart = new Date($scope.meals[j].start.dateTime);
    var mealEnd = new Date($scope.meals[j].end.dateTime);

    // this is cool: need a common day to compare these values
    // so I chose December 20, 1993, my birthday
    workoutStart.setDate(20);
    workoutStart.setMonth(11);
    workoutStart.setYear(1993);
    workoutStart = workoutStart.getTime();

    workoutEnd.setDate(20);
    workoutEnd.setMonth(11);
    workoutEnd.setYear(1993);
    workoutEnd = workoutEnd.getTime();

    mealStart.setDate(20);
    mealStart.setMonth(11);
    mealStart.setYear(1993);
    mealStart = mealStart.getTime();

    mealEnd.setDate(20);
    mealEnd.setMonth(11);
    mealEnd.setYear(1993);
    mealEnd = mealEnd.getTime();

    if(mealStart<workoutEnd && mealEnd>workoutStart){
      bldNumbers[j]++;
    }

    return bldNumbers;
  }

  function switchCases(bldNumbers){
    // Breakfast
    switch (bldNumbers[0]) {
      // 9:00-10:00
      case 0:
        break;
      // 8:00-9:00
      case 1:
        $scope.meals[0].end.dateTime = new Date($scope.meals[0].start.dateTime);
        
        var onehBefore = $scope.meals[0].end.dateTime.getTime() - (1*60*60*1000);
        
        $scope.meals[0].start.dateTime = new Date(onehBefore);
        break;
      default:
        noMeal(0);
    }
    
    // Lunch
    switch(bldNumbers[1]) {
      // 1:00 - 2:00
      case 0:
        break;
      // 12:00 - 1:00
      case 1:
        $scope.meals[1].end.dateTime = new Date($scope.meals[1].start.dateTime);
        
        var onehBefore = $scope.meals[1].end.dateTime.getTime() - (1*60*60*1000);
        
        $scope.meals[1].start.dateTime = new Date(onehBefore);
        break;
      default:
        noMeal(1);
    }

    // Dinner
    switch(bldNumbers[2]) {
      // 6:30-8:00
      case 0:
        break;
      // 7:30-9:00
      case 1:
        $scope.meals[2].start.dateTime = new Date($scope.meals[2].start.dateTime);
        
        var onehAfter = $scope.meals[2].start.dateTime.getTime() + (1*60*60*1000);
        var twoh30After = $scope.meals[2].start.dateTime.getTime() + (2.5*60*60*1000);

        $scope.meals[2].start.dateTime = new Date(onehAfter);
        $scope.meals[2].end.dateTime = new Date(twoh30After);
        break;
      default:
        noMeal(2);
    }
  }

  function noMeal(i){
    scope.meals.splice(i,1);
  }

  function mealSnackOverlap(j,k){
    var mealStart = new Date($scope.meals[j].start.dateTime);
    var mealEnd = new Date($scope.meals[j].end.dateTime);
    var snackStart = new Date($scope.snacks[k].start.dateTime);
    var snackEnd = new Date($scope.snacks[k].end.dateTime);

    // this is cool: need a common day to compare these values
    // so I chose December 20, 1993, my birthday
    mealStart.setDate(20);
    mealStart.setMonth(11);
    mealStart.setYear(1993);
    mealStart = mealStart.getTime();

    mealEnd.setDate(20);
    mealEnd.setMonth(11);
    mealEnd.setYear(1993);
    mealEnd = mealEnd.getTime();

    snackStart.setDate(20);
    snackStart.setMonth(11);
    snackStart.setYear(1993);
    snackStart = snackStart.getTime();

    snackEnd.setDate(20);
    snackEnd.setMonth(11);
    snackEnd.setYear(1993);
    snackEnd = snackEnd.getTime();

    if(mealStart<=snackEnd && mealEnd>=snackStart){
      $scope.snacks.splice(k,1);
      console.log($scope.snacks);
    }
  }

  $scope.deleteCalendarButton = function(){
    deleteCalendar();
  }

  $scope.insertCalendarButton = function(){
    insertCalendar()
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

  function makeSnacks(i){
    // Initialize Events
    var pre = 
    {
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
      summary: "Consider Bar or Snack before Workout",
      recurrence: [
      ]
    };
    
    var post =
    {
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
      summary: "Recovery Shake or Snack",
      recurrence: [
      ]
    };

    // dateTime
    pre.end.dateTime = new Date($scope.workouts[i].startTime);
    var onehBefore = pre.end.dateTime.getTime() - (1*60*60*1000);
    pre.start.dateTime = new Date(onehBefore);

    post.start.dateTime = new Date($scope.workouts[i].endTime);
    var onehAfter = post.start.dateTime.getTime() + (1*60*60*1000);
    post.end.dateTime = new Date(onehAfter);

    // recurrence
    var endDate = parseEndDate(i);

    pre.recurrence[0] = "RRULE:FREQ=WEEKLY;UNTIL="+endDate+";BYDAY="
    for(j = 0; j < $scope.workouts[i].repeat.length; j++){
      if($scope.workouts[i].repeat[j].checked){
        pre.recurrence[0] = pre.recurrence[0] + $scope.workouts[i].repeat[j].text.substring(0,2)+",";
      }
    }

    post.recurrence[0] = "RRULE:FREQ=WEEKLY;UNTIL="+endDate+";BYDAY="
    for(j = 0; j < $scope.workouts[i].repeat.length; j++){
      if($scope.workouts[i].repeat[j].checked){
        post.recurrence[0] = post.recurrence[0] + $scope.workouts[i].repeat[j].text.substring(0,2)+",";
      }
    }

    // Timezone
    pre.start.timeZone = jstz.determine().name();
    pre.end.timeZone = jstz.determine().name();

    post.start.timeZone = jstz.determine().name();
    post.end.timeZone = jstz.determine().name();

    // Push them on the array
    $scope.snacks.push(pre);
    $scope.snacks.push(post);
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
                  $scope.events = $scope.events.concat($scope.meals);
                  $scope.events = $scope.events.concat($scope.snacks);
                  console.log($scope.events); 

                  for(i = 0; i < $scope.events.length; i++){
                    postGAPI(i);
                  }
                  // window.location.href = 'https://calendar.google.com/';
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

  $scope.refreshWorkouts = function(){
    localStorage.removeItem("workouts");
    document.location.reload(true);
  }

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };

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