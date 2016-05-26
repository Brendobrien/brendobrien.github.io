angular.module('starter.services', [])

.factory('Workouts', function(){

  var workoutDefault = {
    id:0,
    sport: "Baseball",
    status: "Pre-Season (High Intensity)",
    startTime: new Date(),
    endTime: new Date(),
    endDate: new Date(),
    repeat:[
      { text: "SUN", checked: false },
      { text: "MON", checked: false },
      { text: "TUE", checked: false },
      { text: "WED", checked: false },
      { text: "THU", checked: false },
      { text: "FRI", checked: false },
      { text: "SAT", checked: false }
    ],
    edit: false,
    woid:0
  };

  var workouts = [{
    id:0,
    sport: "Men's Swimming and Diving",
    status: "Pre-Season (High Intensity)",
    startTime: new Date(2016, 4, 25, 6),
    endTime: new Date(2016, 4, 25, 8),
    endDate: new Date(2016, 4, 31, 6),
    repeat:[
      { text: "SUN", checked: false },
      { text: "MON", checked: true },
      { text: "TUE", checked: true },
      { text: "WED", checked: true },
      { text: "THU", checked: true },
      { text: "FRI", checked: true },
      { text: "SAT", checked: false }
    ]
  },
  {
    id:1,
    sport: "Men's Swimming and Diving",
    status: "Pre-Season (High Intensity)",
    startTime: new Date(2016, 4, 25, 16),
    endTime: new Date(2016, 4, 25, 18),
    endDate: new Date(2016, 5, 25, 6),
    repeat:[
      { text: "SUN", checked: false },
      { text: "MON", checked: true },
      { text: "TUE", checked: true },
      { text: "WED", checked: true },
      { text: "THU", checked: true },
      { text: "FRI", checked: true },
      { text: "SAT", checked: false }
    ]
  }
  ];

  return {
    defaults: function() {
      return workoutDefault;
    },
    wos: function() {
      return workouts;
    }
    // put: function
  };
})

.factory('Events', function(){
  var events = [{
    end: 
    {
      dateTime: "2016-05-25T11:00:00-04:00",
      timeZone: "America/New_York"
    },
    start: 
    {
      dateTime: "2016-05-25T6:00:00-04:00",
      timeZone: "America/New_York"
    },
    summary: "Yolo",
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  },
  {
    end: 
    {
      dateTime: "2016-05-25T12:00:00-04:00",
      timeZone: "America/New_York"
    },
    start: 
    {
      dateTime: "2016-05-25T16:00:00-04:00",
      timeZone: "America/New_York"
    },
    summary: "Yolo",
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  }
  ];

  return {
    all: function() {
      return events;
    }
  }
})