document.getElementById("generate").addEventListener("click", generate);

function generate() {
  timingBlocksContainer = document.getElementById("timing-blocks-container");
  while (timingBlocksContainer.hasChildNodes()) {
    timingBlocksContainer.removeChild(timingBlocksContainer.firstChild);
  }

  startTime =  new Time(document.getElementById("start-time").value.split(':'));
  addFocusBlocks(startTime);
}

function regenerate(event) {
  blockTime = stripToTime(event.target.id);
  restEnd = document.getElementById("timing-block-" + blockTime).querySelectorAll('input[id^=rest-end]')[0];
  oldRestEnd = stripToTime(restEnd.id);
  startTime = new Time(restEnd.value.split(':'));
  
  updateInputAndLabelId(oldRestEnd, startTime.toString(false), "rest-end");
  removeFocusBlocks(blockTime);
  addFocusBlocks(startTime);

  // @todo, also do the focus end/rest start time
  // @todo verify focus & rest end are after focus start
}

function addFocusBlocks(startTime) {
  document.getElementById("instructions").style.display = "flex";
  document.getElementById("save-wrapper").style.display = "flex";
  endTime = new Time(document.getElementById("end-time").value.split(':'));
  focusDuration = parseInt(document.getElementById("focus-time-length").value);
  restDuration = parseInt(document.getElementById("rest-time-length").value);

  iterationTime = startTime;

  // @todo, end focus directly at end time and don't go over
  while (isEarlier(iterationTime, endTime)) {
    timingBlocksTemplate = document.getElementById("timing-block").content.cloneNode(true);

    newTimingBlockId = "timing-block-" + iterationTime.toString(false);
    timingBlocksTemplate.getElementById("timing-block").id = newTimingBlockId;
    timingBlocksTemplate.querySelector("#" + newTimingBlockId + " > legend:first-of-type").setAttribute("for", newTimingBlockId);
   
    newRegenButtonId = "regenerate-" + iterationTime.toString(false);
    timingBlocksTemplate.getElementById("regenerate").id = newRegenButtonId;
    timingBlocksTemplate.getElementById(newRegenButtonId).addEventListener("click", regenerate);

    duplicateFormsAndLabels("focus-start");
    iterationTime.addTime(focusDuration);
    duplicateFormsAndLabels("focus-end");
    iterationTime.addTime(restDuration);
    duplicateFormsAndLabels("rest-end");

    timingBlocksContainer.append(timingBlocksTemplate);
  }
}

function removeFocusBlocks(oldTime) {
  timingBlocksContainer = document.getElementById("timing-blocks-container");
  [...timingBlocksContainer.childNodes].forEach(function(value) {
    if (typeof value.id != 'undefined') {
      time = stripToTime(value.id);
      if (time > oldTime) {
        value.remove();
      }
    }
  });
}

class Time {
  hour;
  minute;
  hourStr;
  minuteStr;

  constructor([hour, minute]) {
    this.hour = parseInt(hour, 10);
    this.minute = parseInt(minute, 10);
    this.updateStrings();
  }

  addTime(time) {
    const hourRemainder = Math.floor((this.minute + time)/60);
    this.hour = (this.hour + hourRemainder) % 24;
    this.minute = (this.minute + time) % 60;
    this.updateStrings();
  }

  updateStrings() {
    this.hourStr = this.hour < 10 ? "0" + this.hour : this.hour;
    this.minuteStr = this.minute < 10 ? "0" + this.minute : this.minute;
  }

  toString(hasColon) {
    return hasColon ? this.hourStr +":"+ this.minuteStr : this.hourStr +""+ this.minuteStr
  }
}

function isEarlier(early, late) {
  return ((early.hour < late.hour) ||
    (early.hour == late.hour && early.minute < late.minute));
}

function updateInputAndLabelId(oldTime, newTime, oldIdString) {
  newIdString = oldIdString + "-" + newTime
  document.getElementById(oldIdString + "-" + oldTime).id = newIdString;
  newLabelId = oldIdString + "-label-" + newTime;
  document.getElementById(oldIdString + "-label-" + oldTime).id = newLabelId;
  document.getElementById(newLabelId).setAttribute("for", newIdString);
}

function duplicateFormsAndLabels(id) {
  newInputId = id + "-" + iterationTime.toString(false);
  timingBlocksTemplate.getElementById(id).id = newInputId;
  timingBlocksTemplate.getElementById(newInputId).setAttribute("value", iterationTime.toString(true));
  newLabelId = id + "-label-" + iterationTime.toString(false);
  timingBlocksTemplate.getElementById(id + "-label").id = newLabelId;
  timingBlocksTemplate.getElementById(newLabelId).setAttribute("for", newInputId);
}

function stripToTime(id) {
  return id.replace(/\D/g,'');
}

// Saves options to chrome.storage
function saveTimingOptions() {
  var startTime = document.getElementById('start-time').value;
  var endTime = document.getElementById('end-time').value;
  var focusTimeLength = document.getElementById('focus-time-length').value;
  var restTimeLength = document.getElementById('rest-time-length').value;

  
  var monday = document.getElementById('monday').checked;
  var tuesday = document.getElementById('tuesday').checked;
  var wednesday = document.getElementById('wednesday').checked;
  var thursday = document.getElementById('thursday').checked;
  var friday = document.getElementById('friday').checked;
  var saturday = document.getElementById('saturday').checked;
  var sunday = document.getElementById('sunday').checked;


  chrome.storage.sync.set({
    startTime: startTime,
    endTime: endTime,
    focusTimeLength: focusTimeLength,
    restTimeLength: restTimeLength,
    monday: monday,
    tuesday: tuesday,
    wednesday: wednesday,
    thursday: thursday,
    friday: friday,
    saturday: saturday,
    sunday: sunday
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    startTime: "09:00",
    endTime: "17:00",
    focusTimeLength: 25,
    restTimeLength: 5,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }, function(items) {
    document.getElementById('start-time').value = items.startTime;
    document.getElementById('end-time').value = items.endTime;
    document.getElementById('focus-time-length').value = items.focusTimeLength;
    document.getElementById('rest-time-length').value = items.restTimeLength;
    
    document.getElementById('monday').checked = items.monday;
    document.getElementById('tuesday').checked = items.tuesday;
    document.getElementById('wednesday').checked = items.wednesday;
    document.getElementById('thursday').checked = items.thursday;
    document.getElementById('friday').checked = items.friday;
    document.getElementById('saturday').checked = items.saturday;
    document.getElementById('sunday').checked = items.sunday;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
  saveTimingOptions);