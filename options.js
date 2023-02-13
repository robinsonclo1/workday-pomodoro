let generatedTimes = new Set();
document.getElementById("generate").addEventListener("click", generate);

function generate() {
  timingBlocksContainer = document.getElementById("timing-blocks-container");
  while (timingBlocksContainer.hasChildNodes()) {
    timingBlocksContainer.removeChild(timingBlocksContainer.firstChild);
  }

  startTime =  new Time(document.getElementById("start-time").value.split(':'));
  generatedTimes.clear();
  addFocusBlocks(startTime);
}

function regenerate(event) {
  blockTime = stripToTime(event.target.id);
  focusEnd = document.getElementById("timing-block-" + blockTime).querySelectorAll('input[id^=focus-end]')[0];
  restEnd = document.getElementById("timing-block-" + blockTime).querySelectorAll('input[id^=rest-end]')[0];
  oldFocusEnd = stripToTime(focusEnd.id);
  oldRestEnd = stripToTime(restEnd.id);
  focusEndTime = new Time(focusEnd.value.split(':'));
  startTime = new Time(restEnd.value.split(':'));

  isTimingCorrect = verifyTimingIntegrity();
  if (isTimingCorrect) {
    document.getElementById('save').removeAttribute('disabled');
    removeGeneratedTimes(blockTime)
    updateInputAndLabelId(oldFocusEnd, focusEndTime.toString(false), "focus-end");
    updateInputAndLabelId(oldRestEnd, startTime.toString(false), "rest-end");
    removeFocusBlocks(blockTime);
    addFocusBlocks(startTime);
  } else {
    document.getElementById('save').setAttribute('disabled', '');
  }
}

function addFocusBlocks(startTime) {
  document.getElementById("instructions").style.display = "flex";
  document.getElementById("save-wrapper").style.display = "flex";
  endTime = new Time(document.getElementById("end-time").value.split(':'));
  focusDuration = parseInt(document.getElementById("focus-time-length").value);
  restDuration = parseInt(document.getElementById("rest-time-length").value);

  iterationTime = startTime;
  generatedTimes.add("focus-start-" + iterationTime.toString(false));

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

function addFocusBlocksFromArray(times) {
  document.getElementById("instructions").style.display = "flex";
  document.getElementById("save-wrapper").style.display = "flex";
  timingBlocksContainer = document.getElementById("timing-blocks-container");

  for (i=0; i<times.length; i+=3) {
    
    timingBlocksTemplate = document.getElementById("timing-block").content.cloneNode(true);

    newTimingBlockId = "timing-block-" + stripToTime(times[i][1]);
    timingBlocksTemplate.getElementById("timing-block").id = newTimingBlockId;
    timingBlocksTemplate.querySelector("#" + newTimingBlockId + " > legend:first-of-type").setAttribute("for", newTimingBlockId);
    
    newRegenButtonId = "regenerate-" + stripToTime(times[i][1]);
    timingBlocksTemplate.getElementById("regenerate").id = newRegenButtonId;
    timingBlocksTemplate.getElementById(newRegenButtonId).addEventListener("click", regenerate);
    
    iterationTime = new Time(times[i][1].split(':'));
    duplicateFormsAndLabels("focus-start");
    
    iterationTime = new Time(times[i+1][1].split(':'));
    duplicateFormsAndLabels("focus-end");
    
    iterationTime = new Time(times[i+2][1].split(':'));
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

function removeGeneratedTimes(oldTime) {
  for (savedTimes of Array.from(generatedTimes)) {
    if (stripToTime(savedTimes) > oldTime) {
      generatedTimes.delete(savedTimes);
    }
  }
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
  generatedTimes.add(newIdString);
  document.getElementById(oldIdString + "-" + oldTime).id = newIdString;
  newLabelId = oldIdString + "-label-" + newTime;
  document.getElementById(oldIdString + "-label-" + oldTime).id = newLabelId;
  document.getElementById(newLabelId).setAttribute("for", newIdString);
}

function duplicateFormsAndLabels(id) {
  newInputId = id + "-" + iterationTime.toString(false);
  generatedTimes.add(newInputId);
  timingBlocksTemplate.getElementById(id).id = newInputId;
  timingBlocksTemplate.getElementById(newInputId).setAttribute("value", iterationTime.toString(true));
  newLabelId = id + "-label-" + iterationTime.toString(false);
  timingBlocksTemplate.getElementById(id + "-label").id = newLabelId;
  timingBlocksTemplate.getElementById(newLabelId).setAttribute("for", newInputId);
}

function stripToTime(id) {
  return id.replace(/\D/g,'');
}

function verifyTimingIntegrity() {
  timingBlocksContainer = document.getElementById("timing-blocks-container");
  for (value of [...timingBlocksContainer.childNodes]) {
    if (typeof value.id != 'undefined') {
      focusStart = value.querySelectorAll('input[id^=focus-start]')[0];
      focusEnd = value.querySelectorAll('input[id^=focus-end]')[0];
      restEnd = value.querySelectorAll('input[id^=rest-end]')[0];
      if (focusStart.value > focusEnd.value) {
        focusEnd.setCustomValidity("Focus end must occur after focus start!");
        focusEnd.classList.add("invalid");
        focusEnd.nextElementSibling.textContent = "Focus end must occur after focus start!";
        focusEnd.nextElementSibling.className = "error active";
        focusEnd.focus();
        return false;
      } else if (focusEnd.value > restEnd.value) {
        restEnd.setCustomValidity("Rest end must occur after focus end!");
        restEnd.classList.add("invalid");
        restEnd.nextElementSibling.textContent = "Rest end must occur after focus end!";
        restEnd.nextElementSibling.className = "error active";
        restEnd.focus();
        return false;
      } else {
        focusEnd.setCustomValidity("");
        focusEnd.classList.remove("invalid");
        focusEnd.nextElementSibling.textContent = "";
        focusEnd.nextElementSibling.className = "error";

        restEnd.setCustomValidity("");
        restEnd.classList.remove("invalid");
        restEnd.nextElementSibling.textContent = "";
        restEnd.nextElementSibling.className = "error";
      }
    }
  }
  return true;
}

function saveTimingOptions() {
  var siteList = document.getElementById('site-list').value.split(/\r?\n/);
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
  var times = [];
  var onOff = [];
  var currentOnOff = [];

  for(id of Array.from(generatedTimes)) {
    var time = new Time(document.getElementById(id).value.split(":"));
    console.log(id);
    times.push([id, document.getElementById(id).value]);
    if (id.includes("focus-start")) {
      currentOnOff.push(true, time)
    } else if (id.includes("focus-end")) {
      currentOnOff.push(time)
      onOff.push(currentOnOff)
      currentOnOff = [false, time]
    } else if (id.includes("rest-end")) {
      currentOnOff.push(time)
      onOff.push(currentOnOff)
      currentOnOff = [];
    }
  }
  
  chrome.storage.sync.set({
    siteList: siteList,
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
    sunday: sunday,
    times: times,
    onOff: onOff
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
    siteList: [],
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
    sunday: false,
    times: []
  }, function(items) {
    document.getElementById('site-list').value = items.siteList.join("\n");
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
    if(items.times.length > 0) {
      addFocusBlocksFromArray(items.times);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveTimingOptions);

"use strict";
(() => {
const modified_inputs = new Set;
const defaultValue = "defaultValue";
// store default values
addEventListener("beforeinput", (evt) => {
    const target = evt.target;
    if (!(defaultValue in target || defaultValue in target.dataset)) {
        target.dataset[defaultValue] = ("" + (target.value || target.textContent)).trim();
    }
});
// detect input modifications
addEventListener("input", (evt) => {
    const target = evt.target;
    let original;
    if (defaultValue in target) {
        original = target[defaultValue];
    } else {
        original = target.dataset[defaultValue];
    }
    if (original !== ("" + (target.value || target.textContent)).trim()) {
        if (!modified_inputs.has(target)) {
            modified_inputs.add(target);
        }
    } else if (modified_inputs.has(target)) {
        modified_inputs.delete(target);
    }
});
// clear modified inputs upon form submission
addEventListener("submit", (evt) => {
    modified_inputs.clear();
    // to prevent the warning from happening, it is advisable
    // that you clear your form controls back to their default
    // state with evt.target.reset() or form.reset() after submission
});
// warn before closing if any inputs are modified
addEventListener("beforeunload", (evt) => {
    if (modified_inputs.size) {
        const unsaved_changes_warning = "Changes you made may not be saved.";
        evt.returnValue = unsaved_changes_warning;
        return unsaved_changes_warning;
    }
});
})();
