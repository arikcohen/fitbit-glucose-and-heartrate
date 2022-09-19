import { settingsStorage } from "settings";

//settingsStorage.addEventListener("change",  (evt) => { appSettings.refreshSettings(); });


export default class settings {     
    
    static bgColor;
    static textColor;
    static dateFormat;
    static enableDOW;

    static refreshSettings() {
        console.log("Settings Refreshed");

        bgColor = settingsStorage.getItem("bgColor") || "black";        
        textColor = settingsStorage.getItem("textColor") || "lightgrey";        
        dateFormat = settingsStorage.getItem("textColor") || "DD/MM/YYYY";
        enableDOW = settingsStorage.getItem("enableDOW") || false;

    }

}

settings.refreshSettings();