angular.module('starter.services', [])

.factory('Workouts', function(){

  var workoutDefault = {
    woId:0,
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
    ]
  };
  
  if(localStorage.workouts){
    var workouts = JSON.parse(localStorage.workouts);
  }
  else {
    var workouts = [
    ];
}

  return {
    defaults: function() {
      return workoutDefault;
    },
    wos: function() {
      return workouts;
    },
    get: function(woId){
      for (var i = 0; i < workouts.length; i++){
        if(workouts[i].woId === parseInt(woId)) {
          return workouts[i];
        }
      }
      return null;
    }
    // put: function
  };
})

.factory('Meals', function(){
  var breakfast =
  {
    end: 
    {
      dateTime: "2016-05-25T9:00:00-04:00",
      timeZone: "America/New_York"
    },
    start: 
    {
      dateTime: "2016-05-25T10:00:00-04:00",
      timeZone: "America/New_York"
    },
    summary: "Breakfast",
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  };

  var lunch =
  {
    end: 
    {
      dateTime: "2016-05-25T12:00:00-04:00",
      timeZone: "America/New_York"
    },
    start: 
    {
      dateTime: "2016-05-25T13:00:00-04:00",
      timeZone: "America/New_York"
    },
    summary: "Lunch",
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  };

  var dinner =
  {
    end: 
    {
      dateTime: "2016-05-25T18:30:00-04:00",
      timeZone: "America/New_York"
    },
    start: 
    {
      dateTime: "2016-05-25T20:00:00-04:00",
      timeZone: "America/New_York"
    },
    summary: "Dinner",
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
    ]
  };

  return {
    all: function(){
      return [breakfast, lunch, dinner];
    }
  }

})

.factory('Events', function(){
  var events = [
    {
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
    },
    {
      end: 
      {
        dateTime: "2016-05-25T10:00:00-04:00",
        timeZone: "America/New_York"
      },
      start: 
      {
        dateTime: "2016-05-25T9:00:00-04:00",
        timeZone: "America/New_York"
      },
      summary: "Breakfast",
      recurrence: [
        "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
      ]
    },
    {
      end: 
      {
        dateTime: "2016-05-25T14:00:00-04:00",
        timeZone: "America/New_York"
      },
      start: 
      {
        dateTime: "2016-05-25T13:00:00-04:00",
        timeZone: "America/New_York"
      },
      summary: "Lunch",
      recurrence: [
        "RRULE:FREQ=WEEKLY;UNTIL=20160701T170000Z;BYDAY=SU,MO,TU,WE,TH,FR,SA"
      ]
    },
    {
      end: 
      {
        dateTime: "2016-05-25T20:00:00-04:00",
        timeZone: "America/New_York"
      },
      start: 
      {
        dateTime: "2016-05-25T18:30:00-04:00",
        timeZone: "America/New_York"
      },
      summary: "Dinner",
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