chrome.runtime.onInstalled.addListener(() => {
  setOnOff()

  setInterval(function() {
    setOnOff()
  }, 60 * 1000);
});


// chrome.action.onClicked.addListener(function(tab) {
//   // console.log('clicked')
//   chrome.action.setBadgeText({
//     text: "on",
//   });
// });

function setOnOff() {
  var cycle = getCurrentCycle()
  // console.log(cycle);
  // if (cycle) {
  //   console.log(cycle);
  // }
}

async function getCurrentCycle() {
  // console.log('hi')
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get({
      times: [],
      onOff: []
    }, function(items) {
      var today = new Date();
      for (timeframe of items.onOff) {
        var start = new Date();
        var end = new Date();
        start.setHours(timeframe[1].hour, timeframe[1].minute, 0);
        end.setHours(timeframe[2].hour, timeframe[2].minute, 0);

        if (start.getTime() <= today.getTime() && end.getTime() > today.getTime()) {
          if (timeframe[0]) {
            chrome.action.setBadgeText({
              text: "ON",
            });
            // console.log('temp on')
            return
          } else {
            chrome.action.setBadgeText({
              text: "OFF",
            });
            // console.log('temp off')
            return
          }
        }
      }
      chrome.action.setBadgeText({
        text: "OFF",
      });
      // console.log('off for the night')
    })
  })

  const configOut = await p;
} 

// async function mainFuction() {
//   var p = new Promise(function(resolve, reject){
//       chrome.storage.sync.get({"disableautoplay": true}, function(options){
//           resolve(options.disableautoplay);
//       })
//   });

//   const configOut = await p;
//   console.log(configOut);
// }
