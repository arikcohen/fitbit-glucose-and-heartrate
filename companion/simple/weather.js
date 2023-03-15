import { me as companion } from "companion";
import {weather, WeatherCondition} from "weather";
import * as cbor from "cbor";
import { outbox } from "file-transfer";
import { settingsStorage } from "settings";


const dataType = "cbor";
const dataFileWeather = "weather.cbor";

export function initialize() { 
  console.log("initializing weather");
 
  if (companion.permissions.granted("access_location")) {
    // Refresh on companion launch
    updateWeatherData();
    

  } else {
    console.error("This app requires the access_location permission.");
  }
} 


function findWeatherConditionName(WeatherCondition, conditionCode) {
  for (const condition of Object.keys(WeatherCondition)) {
    if (conditionCode === WeatherCondition[condition]) return condition;
  }
}

function updateWeatherData() {  
  console.log("checking weather...");
  let unitSetting = 'fahrenheit';
  if (settingsStorage.getItem("weatherUnit")) {
    let data = JSON.parse(settingsStorage.getItem("weatherUnit"));
    unitSetting = data.values[0].name.toLowerCase();
  }  
  if (companion.permissions.granted("access_location")) {
     weather
       .getWeatherData({temperatureUnit: unitSetting})
       .then((data) => {
         if (data.locations.length > 0) {
           const temp = Math.floor(data.locations[0].currentWeather.temperature);
           const conditionCode = data.locations[0].currentWeather.weatherCondition;
           const location = data.locations[0].name;
           const unit = data.temperatureUnit;           
           console.log("sending weather data..." + temp + " " + conditionCode + " " + "unit");
           sendData({
             temperature: temp,
             condition: findWeatherConditionName(WeatherCondition, conditionCode),
             conditionCode: conditionCode,
             location: location,
             unit: unit
           });
           
         }
       })
       .catch((ex) => {
         console.error(ex);
       });
  }
}

function sendData(data) {  
  outbox.enqueue(dataFileWeather, cbor.encode(data)).catch(error => {
    console.warn(`Failed to enqueue data. Error: ${error}`);
  });
}

