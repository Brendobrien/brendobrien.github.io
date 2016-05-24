angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Workouts', function(){

  var workouts = [{
    id:0,
    sport: "Baseball",
    status: "Pre-Season (High Intensity)",
    startTime: new Date(),
    endTime: new Date(),
    repeat:[
      { text: "SUN", checked: false },
      { text: "MON", checked: false },
      { text: "TUE", checked: false },
      { text: "WED", checked: false },
      { text: "THU", checked: false },
      { text: "FRI", checked: false },
      { text: "SAT", checked: false }
    ]
  }];



  return {
    all: function() {
      return workouts;
    }
    // put: function
  };
})

.factory('Events', function(){
  var events = [{
    "end": 
    {
      "dateTime": "2016-05-23T11:00:00-04:00",
      "timeZone": "America/New_York"
    },
    "start": 
    {
      "dateTime": "2016-05-23T10:00:00-04:00",
      "timeZone": "America/New_York"
    },
    "summary": "Yolo",
    "recurrence": [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  }];

  return {
    all: function() {
      return events;
    }
  }
})