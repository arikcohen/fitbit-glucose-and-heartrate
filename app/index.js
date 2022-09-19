/*
 * Based and modified on initial version from Ryan Mason - All Rights Reserved
 * https://github.com/Rytiggy/Glance/
 * 
 * Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 *
 * ------------------------------------------------
 * 
 * Edits and new functionality by Arik Cohen
 * https://github.com/arikcohen/fitbit-glucose-and-heartrate
 * 
 * ------------------------------------------------
 * 
 * You are free to modify the code but please leave the copyright in the header.
 *
 * ------------------------------------------------
 */

import document from "document";

import { inbox } from "file-transfer";
import * as fs from "fs";
import { vibration } from "haptics";
import DateTime from "../modules/app/dateTime.js";
import BatteryLevels from "../modules/app/batteryLevels.js";

import UserActivity from "../modules/app/userActivity.js";
import Alerts from "../modules/app/alerts.js";
import Errors from "../modules/app/errors.js";
import Transfer from "../modules/app/transfer.js";



// import { preferences, save, load } from "../modules/app/sharedPreferences";
import { memory } from "system";

const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();

const userActivity = new UserActivity();
const alerts = new Alerts();
const errors = new Errors();
const transfer = new Transfer();

let main = document.getElementById("main");
let sgv = document.getElementById("sgv");
let rawbg = document.getElementById("rawbg");
let tempBasal = document.getElementById("tempBasal");
let delta = document.getElementById("delta");
let timeOfLastSgv = document.getElementById("timeOfLastSgv");

let iob = document.getElementById("iob");
let cob = document.getElementById("cob");

let dateElement = document.getElementById("date");
let timeElement = document.getElementById("time");
let activity_timeElement = document.getElementById("activity_time");

let weather = document.getElementById("weather");
let arrows = document.getElementById("arrows");
let activity_arrows = document.getElementById("activity_arrows");

let alertArrows = document.getElementById("alertArrows");
let batteryLevel = document.getElementById("battery-level");
let steps = document.getElementById("steps");
let stepIcon = document.getElementById("stepIcon");
let heart = document.getElementById("heart");
let heartIcon = document.getElementById("heartIcon");

let activity_heart = document.getElementById("activity_heart");
let activity_heartIcon = document.getElementById("activity_heartIcon");

let activity_sgv = document.getElementById("activity_sgv");
let activity_duration = document.getElementById("activity_heart");
let activity_distance = document.getElementById("activity_distance");
let activityStartTime = null;
let activityStartDistance = null;

// let bgColor = document.getElementById("bgColor");
// let activityViewwBgColor = document.getElementById("activityViewwBgColor");

let batteryPercent = document.getElementById("batteryPercent");
let popup = document.getElementById("popup");
let dismiss = popup.getElementById("dismiss");
let errorText = document.getElementById("error");
let popupTitle = document.getElementById("popup-title");
let degreeIcon = document.getElementById("degreeIcon");


let activityStart = document.getElementById("activityStart");
let activityView = document.getElementById("activityView");
let activityExit = document.getElementById("activityExit");

let activityDuration = document.getElementById("activity_duration");
let activityDistance = document.getElementById("activity_distance");

let syringe = document.getElementById("syringe");
let hamburger = document.getElementById("hamburger");
let predictedBg = document.getElementById("predictedBg");

let dismissHighFor = 120;
let dismissLowFor = 15;

let data = null;
let DISABLE_ALERTS = false;

// Data to send back to phone
let dataToSend = {
  heart: 0,
  steps: userActivity.get().steps,
};


dismiss.onclick = function (evt) {
  console.log("DISMISS");
  popup.style.display = "none";
  popupTitle.style.display = "none";
  vibration.stop();
  DISABLE_ALERTS = true;
  let currentBgFromBloodSugars = getFistBgNonpredictiveBG(data.bloodSugars.bgs);

  if (currentBgFromBloodSugars.sgv >= parseInt(data.settings.highThreshold)) {
    console.log("HIGH " + dismissHighFor);
    setTimeout(disableAlertsFalse, dismissHighFor * 1000 * 60);
  } else {
    // 15 mins
    console.log("LOW " + dismissLowFor);

    setTimeout(disableAlertsFalse, dismissLowFor * 1000 * 60);
  }
};

function disableAlertsFalse() {
  DISABLE_ALERTS = false;
}

sgv.text = "---";
activity_sgv.text = "---";

delta.text = "";

iob.text = "---";
cob.text = "---";

activity_timeElement.text = "***";
dateElement.text = "";
timeOfLastSgv.text = "";
steps.text = "--";

heart.text = "--";
activity_heart.text = "--";

batteryPercent.text = "%";
errorText.text = "Configure Data Source";
update();
setInterval(update, 1000);

timeElement.text = dateTime.getTime();
activity_timeElement.text = dateTime.getTime();
batteryLevel.width = batteryLevels.get().level;

inbox.onnewfile = () => {
  console.log("New file!");
  let fileName;
  do {
    // If there is a file, move it from staging into the application folder
    fileName = inbox.nextFile();
    if (fileName) {
      console.log("reading data file:" + fileName);
      data = fs.readFileSync(fileName, "cbor");
      update();
    }
  } while (fileName);
};

function update() {
  console.log("app - update()");
  console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);
  let heartrate = userActivity.get().heartRate;
  if (!heartrate) {
    heartrate = 0;
  }
  // Data to send back to phone
  dataToSend = {
    heart: heartrate,
    steps: userActivity.get().steps,
  };

  // Update device data
  steps.text = commas(userActivity.get().steps);
  heart.text = userActivity.get().heartRate;
  activity_heart.text = heart.text;
  batteryLevel.width = batteryLevels.get().level;
  batteryPercent.text = "" + batteryLevels.get().percent + "%";
  batteryLevel.width = batteryLevels.get().level;
  batteryLevel.style.fill = batteryLevels.get().color;
  batteryPercent.text = "" + batteryLevels.get().percent + "%";
    

  //update activity data (if present)
  if (activityStartTime) {
    let dateObj = new Date();

    let seconds = (dateObj.getTime() - activityStartTime)/1000;
    if (seconds < 3600)
      activityDuration.text = new Date(seconds * 1000).toISOString().substring(14, 19);
    else
      activityDuration.text = new Date(seconds * 1000).toISOString().substring(11, 16);


    let distanceInMeters = userActivity.get().distance - activityStartDistance;

    activityDistance.text = (distanceInMeters/1609.344).toFixed(2).toString() + " mi";
    
  }
  



  if (data) {
    console.warn("GOT DATA");
    
    timeElement.text = dateTime.getTime(data.settings.timeFormat);
    activity_timeElement.text = timeElement.text;

    dismissHighFor = data.settings.dismissHighFor;
    dismissLowFor = data.settings.dismissLowFor;        

    // colors
    //bgColor.fill = data.settings.bgColor;    
    //activityViewwBgColor = data.settings.bgColor;    
    //setTextColor(data.settings.textColor);

    // bloodsugars
    let currentBgFromBloodSugars = getFistBgNonpredictiveBG(
      data.bloodSugars.bgs
    );

    dateElement.text = dateTime.getDate(
      data.settings.dateFormat,
      data.settings.enableDOW
    );

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(
      currentBgFromBloodSugars.datetime
    )[1];
    // if DISABLE_ALERTS is true check if user is in range
    if (DISABLE_ALERTS && data.settings.resetAlertDismissal) {
      if (
        parseInt(timeSenseLastSGV, 10) < data.settings.staleDataAlertAfter &&
        currentBgFromBloodSugars.direction != "DoubleDown" &&
        currentBgFromBloodSugars.direction != "DoubleUp" &&
        currentBgFromBloodSugars.loopstatus != "Warning"
      ) {
        // Dont reset alerts for LOS, DoubleUp, doubleDown, Warning
        if (
          currentBgFromBloodSugars.sgv > parseInt(data.settings.lowThreshold) &&
          currentBgFromBloodSugars.sgv < parseInt(data.settings.highThreshold)
        ) {
          // if the BG is between the threshold
          console.error("here", DISABLE_ALERTS, parseInt(timeSenseLastSGV, 10));
          disableAlertsFalse();
        }
      }
    }

    alerts.check(
      currentBgFromBloodSugars,
      data.settings,
      DISABLE_ALERTS,
      timeSenseLastSGV
    );

    errors.check(timeSenseLastSGV, currentBgFromBloodSugars.currentbg);
    let deltaText = currentBgFromBloodSugars.bgdelta;
    // add Plus
    if (deltaText > 0) {
      deltaText = "+" + deltaText;
      delta.text = deltaText + " " + data.settings.glucoseUnits;
    }
    
    
    arrows.href =
      "../resources/img/arrows/" + currentBgFromBloodSugars.direction + ".png";
    activity_arrows.href = arrows.href;
    
  } else {
    console.warn("NO DATA");

    timeElement.text = dateTime.getTime();
    
    activity_timeElement.text = timeElement.text;
    
    dateElement.text = dateTime.getDate();
  }
}

function commas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Get Fist BG that is not a predictive BG
 * @param {Array} bgs
 * @returns {Array}
 */
function getFistBgNonpredictiveBG(bgs) {
  return bgs.filter((bg) => {
    if (bg.bgdelta || bg.bgdelta === 0) {
      return true;
    }
  })[0];
}

function setTextColor(color) {
  let domElemets = [
    "iob",
    "cob",
    "heart",
    "steps",
    "batteryPercent",
    "date",
    "delta",
    "timeOfLastSgv",
    "time",
    "activity_time",
    "activity_heart",
    "activity_sgv"
  ];
  domElemets.forEach((ele) => {
    document.getElementById(ele).style.fill = color;
  });
}

activityStart.onclick = (e) => {
  console.log("activityView Activated!");  
  let dateObj = new Date();
  activityStartTime = dateObj.getTime();
  activityStartDistance = userActivity.get().distance;
  vibration.start("bump");
  activityView.style.display = "inline";
  main.style.display = "none";
};


activityExit.onclick = (e) => {
  console.log("activityView exited!");
  activityStartTime = null;
  vibration.start("bump");
  activityView.style.display = "none";
  main.style.display = "inline";
};

timeElement.onclick = (e) => {
  console.log("FORCE Activated!");
  transfer.send(dataToSend);
  vibration.start("bump");
  arrows.href = "../resources/img/arrows/loading.png";
  activity_arrows.href = "../resources/img/arrows/loading.png";
  alertArrows.href = "../resources/img/arrows/loading.png";
};

// wait 2 seconds
setTimeout(function () {
  transfer.send(dataToSend);
}, 1500);

setInterval(function () {
  transfer.send(dataToSend);
}, 180000);

//<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/designerz-base" title="Designerz Base">Designerz Base</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
