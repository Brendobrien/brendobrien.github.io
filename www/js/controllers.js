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

.controller('ScheduleCtrl', function($scope, $state, GoogleEvents, ionicDatePicker) {
  $scope.googleEvents = GoogleEvents.all();
  $scope.date = GoogleEvents.date();

  $scope.changeDate = function(){
    
  }

   var ipObj1 = {
      callback: function (val) {  //Mandatory
        $scope.date = new Date(val);
        console.log($scope.date.getDay());
        for(var i = 0; i < $scope.googleEvents.length; i++){
          dayCases($scope.googleEvents, i);
        }
      },
      mondayFirst: false,
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(ipObj1);
    };

  getGAPI();

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
    for(var i = 0; i < data.items.length; i++){
      var title = data.items[i].summary.toString();
      var endTitle = title.search("(Brainbuild)");

      if(endTitle >= 0){
        var calendarId = data.items[i].id;
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
    for(var i = 0; i < data.items.length; i++){
      // console.log(data.items[i].summary);
      if(data.items[i].recurrence){
        var dayIndex = data.items[i].recurrence[0].search("BYDAY=")
        // console.log(dayIndex);

        if(dayIndex>=0 && dayIndex){
          // console.log(data.items[i].recurrence[0].substring(dayIndex+6));
          data.items[i].dayRepeat = data.items[i].recurrence[0].substring(dayIndex+6);
        }
        else{
          data.items[i].dayRepeat = "";
        }
      }
      else{
        data.items[i].dayRepeat = "";
      } 

      if(data.items[i].summary.search(/practice/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button33" style="border-radius:15px 15px 15px 15px;" class="button button-calm button-block button-outline icon ion-waterdrop" href="#/sidemenu/practice"></a>';
      }

      if(data.items[i].summary.search(/snack/i) >= 0 || data.items[i].summary.search(/carbohydrate/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button13" style="border-radius:15px 15px 15px 15px;" class="button button-energized  button-block button-outline icon ion-ios-nutrition" href="#/sidemenu/snack"></a>';
      }

      if(data.items[i].summary.search(/recovery/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button30" style="border-radius:15px 15px 15px 15px;" class=" button button-balanced  button-block button-outline icon ion-battery-low " href="#/sidemenu/recovery"></a>';
      }

      if(data.items[i].summary.search(/sleep/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button17" style="border-radius:15px 15px 15px 15px;" class=" button button-positive  button-block button-outline icon ion-ios-moon " href="#/sidemenu/sleep"></a>';
      }

      if(data.items[i].summary.search(/breakfast/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-assertive button-block button-outline icon ion-spoon" href="#/sidemenu/meal"></a>';
      }

      if(data.items[i].summary.search(/lunch/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-assertive button-block button-outline icon ion-spoon" href="#/sidemenu/meal"></a>';
      }

      if(data.items[i].summary.search(/dinner/i) >= 0){
        data.items[i].button = '<a id="mySchedule-button29" style="border-radius:15px 15px 15px 15px;" class="button button-assertive button-block button-outline icon ion-spoon" href="#/sidemenu/meal"></a>';
      }

      dayCases(data.items, i);

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

    $scope.$apply(function(){
      $scope.googleEvents = data.items;
      localStorage.googleEvents = JSON.stringify(data.items);
    });
  }

  function dayCases(data, i){
    if(data[i].recurrence){
      switch ($scope.date.getDay()) {
        // 9:00-10:00
        case 0:
          if(data[i].recurrence[0].search("BYDAY=SU") >= 0 || data[i].recurrence[0].search("FREQ=DAILY") >= 0){
            console.log(data[i].summary)
            console.log(data[i].recurrence[0])
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
    else {
      data[i].visible = false;
    }
  }
})