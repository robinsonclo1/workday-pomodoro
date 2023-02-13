chrome.runtime.onInstalled.addListener(() => {
  setOnOff()

  setInterval(function() {
    setOnOff()
  }, 60 * 1000);
});

async function setOnOff() {
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get({
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
            executeInAllBlockedTabs('block');
            return
          } else {
            chrome.action.setBadgeText({
              text: "OFF",
            });
            executeInAllBlockedTabs('unblock');
            return
          }
        }
      }
      chrome.action.setBadgeText({
        text: "OFF",
      });
      executeInAllBlockedTabs('unblock');
    })
  })

  const configOut = await p;
} 

function executeInAllBlockedTabs(action) {
  chrome.windows.getAll({populate: true}, function (windows) {
    var tabs;
    for(var i in windows) {
      tabs = windows[i].tabs;
      for(var tab in tabs) {
        executeInTabIfBlocked(action, tabs[tab]);
      }
    }
  });
}

function executeInTabIfBlocked(action, tab) {
  var file = "content_scripts/" + action + ".js", location;
  location = tab.url.split('://');
  location = parseLocation(location[1]);
  
  chrome.storage.sync.get({
    siteList: []
  }, function(items) {
    
    for(var site in items.siteList) {
      listedPattern = parseLocation(items.siteList[site]);
      if(locationsMatch(location, listedPattern)) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id, allFrames: true},
          files: [file],
        });
      }
    }
  })
}
function locationsMatch(location, listedPattern) {
  return domainsMatch(location.domain, listedPattern.domain) &&
    pathsMatch(location.path, listedPattern.path);
}

function pathsMatch(test, against) {
  return !against || test.substr(0, against.length) == against;
}


function parseLocation(location) {
  var components = location.split('/');
  return {domain: components.shift(), path: components.join('/')};
}

function domainsMatch(test, against) {
  /*
    google.com ~> google.com: case 1, pass
    www.google.com ~> google.com: case 3, pass
    google.com ~> www.google.com: case 2, fail
    google.com ~> yahoo.com: case 3, fail
    yahoo.com ~> google.com: case 2, fail
    bit.ly ~> goo.gl: case 2, fail
    mail.com ~> gmail.com: case 2, fail
    gmail.com ~> mail.com: case 3, fail
  */

  // Case 1: if the two strings match, pass
  if(test === against) {
    return true;
  } else {
    var testFrom = test.length - against.length - 1;

    // Case 2: if the second string is longer than first, or they are the same
    // length and do not match (as indicated by case 1 failing), fail
    if(testFrom < 0) {
      return false;
    } else {
      // Case 3: if and only if the first string is longer than the second and
      // the first string ends with a period followed by the second string,
      // pass
      return test.substr(testFrom) === '.' + against;
    }
  }
}
