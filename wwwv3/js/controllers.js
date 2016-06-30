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
      // store.set('refreshToken', refreshToken);
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
  // logout
  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };
})

.controller('ScheduleCtrl', function($scope, $state, GoogleEvents, ionicDatePicker) {
  // factory retrieval
  $scope.googleEvents = GoogleEvents.all();
  $scope.date = GoogleEvents.date();

  // date picker object
  var ipObj1 = {
    callback: function (val) {  //Mandatory
      $scope.date = new Date(val);

      for(var i = 0; i < $scope.googleEvents.length; i++){
        dayCases($scope.googleEvents, i);
      }

      localStorage.googleEvents = JSON.stringify($scope.googleEvents);
    },
    mondayFirst: false,
  };

  // date picker function
  $scope.openDatePicker = function(){
    ionicDatePicker.openDatePicker(ipObj1);
  };

  // retrieve google calendar events and post them on the screen
  getGAPI();

  // calendar list retrieval
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
                    console.log(data);
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

  // find (Brainbuild) calendar
  function findBrainbuild(data) {
    for(var i = 0; i < data.items.length; i++){
      var title = data.items[i].summary.toString();
      var endTitle = title.search("(Brainbuild)");

      if(endTitle >= 0){
        var calendarId = data.items[i].id;
      }
    }

    listBrainbuildEvents(calendarId);
  }

  // brainbuild calendar events retrieval
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
                    console.log(data);

                    // var title = data.items[i].summary.toString();
                    // var endTitle = title.search("(Brainbuild)");

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

  // main parsing function
  function parseEvents(data){
    // iterate through events
    for(var i = 0; i < data.items.length; i++){
      // real event
      if(data.items[i].summary){
        // .dayRepeat
        assignDayRepeat(data, i); 

        // .button
        assignButton(data, i);

        // .timeOfDay
        assignTiming(data, i);

        // .visible
        dayCases(data.items, i);
      }
      else {
        // canceled event
      }
    }

    // apply to page
    $scope.$apply(function(){
      $scope.googleEvents = data.items;
      localStorage.googleEvents = JSON.stringify(data.items);
    });
  }

  // .dayRepeat for recurring events
  function assignDayRepeat(data, i){
    if(data.items[i].recurrence){
      var dayIndex = data.items[i].recurrence[0].search("BYDAY=")

      if(dayIndex>=0 && dayIndex){
        data.items[i].dayRepeat = data.items[i].recurrence[0].substring(dayIndex+6);
      }
      else{
        data.items[i].dayRepeat = "";
      }
    }
    else{
      data.items[i].dayRepeat = "";
    }
  }

  // .button for more information
  function assignButton(data, i){
    
    data.items[i].color = '#ffffff';
    data.items[i].page = '#/sidemenu/schedule';
    if(data.items[i].summary.search(/practice/i) >= 0 || data.items[i].summary.search(/lift/i) >= 0 || data.items[i].summary.search(/workout/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button33" style="border-radius:15px 15px 15px 15px;" class="button button-light button-block button-outline icon ion-waterdrop" href="#/sidemenu/practice"></a>';
      data.items[i].color = '#4986e7';
      data.items[i].page = '#/sidemenu/practice';
      data.items[i].type = 'Practice';
    }

    if(data.items[i].summary.search(/snack/i) >= 0 || data.items[i].summary.search(/carbohydrate/i) >= 0 || data.items[i].summary.search(/hydrate/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button13" style="border-radius:15px 15px 15px 15px;" class="button button-light  button-block button-outline icon ion-ios-nutrition" href="#/sidemenu/snack"></a>';
      data.items[i].color = '#ffb878';
      data.items[i].page = '#/sidemenu/snack';
      data.items[i].type = 'Snack';
     }

    if(data.items[i].summary.search(/recover/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button30" style="border-radius:15px 15px 15px 15px;" class=" button button-light  button-block button-outline icon ion-battery-low " href="#/sidemenu/recovery"></a>';
      data.items[i].color = '#ffb878';
      data.items[i].page = '#/sidemenu/recovery';
      data.items[i].type = 'Recovery';
    }

    if(data.items[i].summary.search(/sleep/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button17" style="border-radius:15px 15px 15px 15px;" class=" button button-light  button-block button-outline icon ion-ios-moon " href="#/sidemenu/sleep"></a>';
      data.items[i].color = '#e1e1e1';
      data.items[i].page = '#/sidemenu/sleep';
      data.items[i].type = 'Sleep';
    }

    if(data.items[i].summary.search(/breakfast/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-light button-block button-outline icon ion-spoon" href="#/sidemenu/breakfast"></a>';
      data.items[i].color = '#dc2127';
      data.items[i].page = '#/sidemenu/breakfast';
      data.items[i].type = 'Breakfast';
    }

    if(data.items[i].summary.search(/lunch/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-light button-block button-outline icon ion-spoon" href="#/sidemenu/lunch"></a>';
      data.items[i].color = '#dc2127';
      data.items[i].page = '#/sidemenu/lunch';
      data.items[i].type = 'Lunch';
    }

    if(data.items[i].summary.search(/dinner/i) >= 0){
      data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-light button-block button-outline icon ion-spoon" href="#/sidemenu/dinner"></a>';
      data.items[i].color = '#dc2127';
      data.items[i].page = '#/sidemenu/dinner';
      data.items[i].type = 'Dinner';
    }
  }

  // .timeOfDay to order the events properly
  function assignTiming(data, i){
    if(data.items[i].start.dateTime){
      var date = new Date(data.items[i].start.dateTime)

      // this is cool: need a common day to compare these values
      // so I chose December 20, 1993, my birthday
      date.setDate(20);
      date.setMonth(11);
      date.setYear(1993);
      date = date.getTime();

      data.items[i].timeOfDay = date;
    }
  }
  
  // assign visibility based on day of week
  function dayCases(data, i){
    if(data[i].recurrence){
      repeatDays(data,i);

      if(data[i].recurrence[0].search("UNTIL=") >= 0){
        checkEndDate(data,i);
      }
    }
    else {
      nonrepeatDays(data,i);
    }
  }

  // recurring event visibility
  function repeatDays(data, i){
    switch ($scope.date.getDay()) {
      // 9:00-10:00
      case 0:
        if(data[i].recurrence[0].search("BYDAY=SU") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          // data[i].visible = false;
          data[i].visible = false;
        }
        break;
      case 1:
        if(data[i].dayRepeat.search("MO") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          // data[i].visible = false;
          data[i].visible = false;
        }
        break;
      case 2:
        if(data[i].dayRepeat.search("TU") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          // data[i].visible = false;
          data[i].visible = false;
        }
        break;
      case 3:
        if(data[i].dayRepeat.search("WE") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          // data[i].visible = false;
          data[i].visible = false;
        }
        break;
      case 4:
        if(data[i].dayRepeat.search("TH") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){      
          data[i].visible = true;
        }
        else {
          data[i].visible = false;
        }
        break;
      case 5:
        if(data[i].dayRepeat.search("FR") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          data[i].visible = false;
        }
        break;
      case 6:
        if(data[i].dayRepeat.search("SA") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
          data[i].visible = true;
        }
        else {
          data[i].visible = false;
        }
        break;
      default:
        data[i].visible = false;
    }
  }

  // recurring events with end dates
  function checkEndDate(data, i){
    var until = data[i].recurrence[0].search("UNTIL=");
    var end = data[i].recurrence[0].substring(until+6, until+14);
    var endDate = new Date(end.substring(0,4), (end.substring(4,6)-1), (parseInt(end.substring(6,8))+1));

    if(endDate.getTime()<$scope.date.getTime()){
      data[i].visible = false;
    }
  }

  // non-recurring event visibility
  function nonrepeatDays(data, i){
    if(data[i].summary){
      if(data[i].start.toDateStringime){
        var singleEvent = new Date(data[i].start.dateTime);
        var day = "inday";
      }
      else {
        var singleEvent = new Date(data[i].end.date);
        var day = "allday";
      }
      if(singleEvent.toDateString()==$scope.date.toDateString()){
        data[i].visible = true;

        if(day=="allday"){
          data[i].timeOfDay = 0;
          data[i].start.dateTime = "All";
          data[i].end.dateTime = "Day"; 
        }
      }
      else {
        data[i].visible = false;
      }
    }
    else {
      data[i].visible = false;
    }
  }
})

.controller('MealCtrl', function($scope){
  $scope.place = "in the pool";
  $scope.allergies = "you have no allergies"
  $scope.allergies = "you are allergic to nuts"
})