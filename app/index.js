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
import Errors from "../modules/app/errors.js";
import Transfer from "../modules/app/transfer.js";



// import { preferences, save, load } from "../modules/app/sharedPreferences";
import { memory } from "system";

const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();

const userActivity = new UserActivity();
const errors = new Errors();
const transfer = new Transfer();

const forceUpdateFrequency =  1000 * 60 * 5;
let lastUpdated = null;


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

let weatherIcon = document.getElementById("weatherIcon");
let weather = document.getElementById("weather");
let weatherLocation = document.getElementById("weatherLocation");

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


// Data to send back to phone
let dataToSend = {
  heart: 0,
  steps: userActivity.get().steps,
};



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
errorText.text = "No Data";
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
      switch (fileName) {                
        case "baseData.json":
          lastUpdated = Date.now();
        case "weather.cbor":
          updateWeather();
          break;
      }    
    }
  } while (fileName);
};

function update() {
  //console.log("app - update()");
  //console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);
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

    let seconds = (dateObj.getTime() - activityStartTime) / 1000;
    if (seconds < 3600)
      activityDuration.text = new Date(seconds * 1000).toISOString().substring(14, 19);
    else
      activityDuration.text = new Date(seconds * 1000).toISOString().substring(11, 16);

    let distanceInMeters = userActivity.get().distance - activityStartDistance;

    activityDistance.text = (distanceInMeters / 1609.344).toFixed(2).toString() + " mi";

  }
  updateDataFromCompanion();
}

function updateDataFromCompanion() {
  
  if (fs.existsSync('baseData.json')) {
    data = fs.readFileSync('baseData.json', "cbor");
    //console.warn("GOT DATA");
    errorText.text = "";

    timeElement.text = dateTime.getTime(data.settings.timeFormat);
    activity_timeElement.text = timeElement.text;

    dismissHighFor = data.settings.dismissHighFor;
    dismissLowFor = data.settings.dismissLowFor;


    // bloodsugars

    let currentBgFromBloodSugars = getFirstBgNonpredictiveBG(
      data.bloodSugars.bgs
    );

    dateElement.text = dateTime.getDate(
      data.settings.dateFormat,
      data.settings.enableDOW
    );

    // check to see if we have a good datapoint 
    
    if (currentBgFromBloodSugars && currentBgFromBloodSugars.datetime != null) {
      let timeSinceLastSGV = dateTime.getTimeSinceLastSGV(
        currentBgFromBloodSugars.datetime
      )[0];


      let deltaText = currentBgFromBloodSugars.bgdelta;
      // add Plus
      if (deltaText > 0) {
        deltaText = "+" + deltaText;
      }

      delta.text = deltaText + " " + data.settings.glucoseUnits;

      iob.text = currentBgFromBloodSugars.iob;
      cob.text = currentBgFromBloodSugars.cob;
      sgv.text = currentBgFromBloodSugars.currentbg;
      activity_sgv.text = sgv.text;
      timeOfLastSgv.text = timeSinceLastSGV;

      arrows.href =
        "../resources/img/arrows/" + currentBgFromBloodSugars.direction + ".png";

    }
    else {
      delta.text = "";
      iob.text = "";
      cob.text = "";
      sgv.text = "---";
      arrows.href = "../resources/img/arrows/none.png";
      errorText.text = "Check Configuration";
    }

  }
  else {

    //console.warn("NO DATA");

    timeElement.text = dateTime.getTime();
    activity_timeElement.text = timeElement.text;

    dateElement.text = dateTime.getDate();
    errorText.text = "Configure Data Source";    
    sgv.text = "ERR";
    arrows.href = "../resources/img/arrows/none.png";

  }
  
  activity_arrows.href = arrows.href;
  activity_sgv.text = sgv.text;

  if (Date.now() - lastUpdated > forceUpdateFrequency) {
    console.log ("would have requested an update");
    forceActivate();
    lastUpdated = Date.now()-1000*60;
  }
}


function updateWeather() {
  console.log("received weather data..." + JSON.stringify(data));
  if (data.temperature) {

    weather.text = data.temperature + "°";    
    weatherIcon.href = "img/weather/" + data.condition + ".png";
    weatherLocation.text = data.location;
    //imgWeather.style.display = block;
  }
  else {
    weather.text = "";
    weatherIcon.href = "img/weather/unknown.png";
    //imgWeather.style.display = none;
  }
}

function commas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Get First BG that is not a predictive BG
 * @param {Array} bgs
 * @returns {Array}
 */
function getFirstBgNonpredictiveBG(bgs) {
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

timeElement.onclick = (e) => { forceActivate(); };
sgv.onclick = (e) => { forceActivate(); };


function forceActivate() {
  console.log("FORCE Activated!");
  transfer.send(dataToSend);
  vibration.start("bump");
  arrows.href = "../resources/img/arrows/loading.png";
  activity_arrows.href = "../resources/img/arrows/loading.png";
  alertArrows.href = "../resources/img/arrows/loading.png";
}