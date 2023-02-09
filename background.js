console.log('hi')

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
  
  chrome.storage.sync.get({
    times: [],
    onOff: []
  }, function(items) {
    items.times;
    var today = new Date();
    for (timeframe of items.onOff) {
      var start = new Date();
      var end = new Date();
      start.setHours(timeframe[1].hour, timeframe[1].minute, 0);
      end.setHours(timeframe[2].hour, timeframe[2].minute, 0);

      if (start.getTime() <= today.getTime() && end.getTime() > today.getTime()) {
        console.log("currentTime", today)
      }
    }
    console.log(items.onOff)
    } 
  )
});


chrome.action.onClicked.addListener(function(tab) {
  // console.log('clicked')
  chrome.action.setBadgeText({
    text: "on",
  });
  timeRemaining();
});

// function offOnCycle () {
//   isOn = true;
//   if (isOn) {
//     chrome.action.setBadgeText({
//       text: "on",
//     });
//   }
// }

function timeRemaining() {
  // console.log('hi')
  chrome.storage.sync.get({
    times: [],
    onOff: []
  }, function(items) {
    items.times;
    var today = new Date();
    for (timeframe of items.onOff) {
      console.log(timeframe[1])
      console.log(today.getTime())
      if (timeframe[1].date >= today && timeframe[2].date < today) {
        console.log("currentTime", today)
      }
    }
    console.log(items.onOff)
    } 
  )
} 