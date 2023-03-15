//import { settings } from "settings";
//import { XMLHttpRequest } from "xmlhttprequest";

function mySettings(props) {
  return (
    <Page>
      <Text>
        <TextImageRow
          label="Glucose and Heartrate Clock"
          sublabel="https://github.com/arikcohen/fitbit-glucose-and-heartrate"
          icon="https://image.ibb.co/gbWF2H/twerp_bowtie_64.png"
        />
        <Text>&nbsp;</Text>
        <Text>&nbsp;</Text>
        <Text>
          Glucose and Heartrate Clock is a solution for use with Fitbit devices to view your blood
          glucose levels along with a variety of other health stats on the watch
          face. 
        </Text>
        <Text>&nbsp;</Text>
        <Text>
          <Link source="https://github.com/arikcohen/fitbit-glucose-and-heartrate/wiki/How-to-set-up-Glance#2-settings">
            Click here to learn how to set up your glucose monitoring!
          </Link>
        </Text>
      </Text>

      <Section
        title={
          <Text bold align="center">
            Data Source Settings
          </Text>
        }
      >
        <Select
          label={`Data Source`}
          settingsKey="dataSource"
          options={[
            { name: "None", value: "none" },
            { name: "Dexcom", value: "dexcom" },
            { name: "Nightscout", value: "nightscout" },
            { name: "xDrip+", value: "xdrip" },
            { name: "Spike", value: "spike" },
            { name: "Tomato", value: "tomato" },
            { name: "Custom", value: "custom" },
          ]}
        />

        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value == "custom" ? (
            <TextInput label="Api endpoint" settingsKey="customEndpoint" />
          ) : null
        ) : null}

        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value ==
          "nightscout" ? (
            <Text text="center">
              https://<Text bold>SiteName</Text>.NightscoutHostSite.com
            </Text>
          ) : null
        ) : null}

        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value ==
          "nightscout" ? (
            <TextInput
              title="Nightscout"
              label="Site Name"
              settingsKey="nightscoutSiteName"
            />
          ) : null
        ) : null}

        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value ==
          "nightscout" ? (
            <Text text="center">
              https://SiteName.<Text bold>NightscoutHostSite</Text>.com
            </Text>
          ) : null
        ) : null}
        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value ==
          "nightscout" ? (
            <Select
              label="Nightscout Host Site"
              settingsKey="nightscoutSiteHost"
              options={[
                { name: "Heroku", value: "herokuapp.com" },
                { name: "Azure", value: "azurewebsites.net" },
              ]}
            />
          ) : null
        ) : null}

        {props.settings.dataSource ? (
          JSON.parse(props.settings.dataSource).values[0].value == "dexcom" ? (
            <Section
              title={
                <Text bold align="center">
                  Dexcom
                </Text>
              }
            >
              <Text bold align="center">
                Dexcom
              </Text>
              <TextInput
                title="Username"
                label="Username"
                settingsKey="dexcomUsername"
              />
              <TextInput
                title="Password"
                label="Password"
                settingsKey="dexcomPassword"
              />
              <Toggle
                settingsKey="USAVSInternational"
                label="International (Not in USA)"
              />
            </Section>
          ) : null
        ) : null}
      </Section>

      <Section
        title={
          <Text bold align="center">
            Glucose Settings
          </Text>
        }
      >
        <Select
          label={`Glucose Units`}
          settingsKey="glucoseUnits"
          options={[
            { name: "mgdl", value: "mgdl" },
            { name: "mmol", value: "mmol" },
          ]}
        />
        <TextInput label="High Threshold" settingsKey="highThreshold" />
        <TextInput label="Low Threshold" settingsKey="lowThreshold" />
        <Toggle settingsKey="disableAlert" label="Disable Alerts" />
        <Toggle
          settingsKey="extraGlucoseSettings"
          label="Extra Glucose Settings"
        />

        {props.settings.extraGlucoseSettings ? (
          JSON.parse(props.settings.extraGlucoseSettings) == true ? (
            <Section
              title={
                <Text bold align="center">
                  Extra Glucose Settings
                </Text>
              }
            >
              <Text bold align="center">
                Alerts
              </Text>
              <Toggle settingsKey="highAlerts" label="High Alerts" />
              <TextInput
                label="Dismiss high alerts for n minutes"
                settingsKey="dismissHighFor"
              />
              <Toggle settingsKey="lowAlerts" label="Low Alerts" />
              <TextInput
                label="Dismiss low alerts for n minutes"
                settingsKey="dismissLowFor"
              />
              <Toggle settingsKey="rapidRise" label="Rapid Rise Alerts" />
              <Toggle settingsKey="rapidFall" label="Rapid Fall Alerts" />
              {props.settings.dataSource ? (
                JSON.parse(props.settings.dataSource).values[0].value ==
                "nightscout" ? (
                  <Toggle settingsKey="loopstatus" label="Loop Status Alerts" />
                ) : null
              ) : null}
              <Toggle settingsKey="staleData" label="Stale Data Alerts" />
              <TextInput
                label="Stale data alerts after n minutes"
                settingsKey="staleDataAlertAfter"
              />
              <Toggle
                settingsKey="resetAlertDismissal"
                label="Dismiss alarm when back in range"
              />
            </Section>
          ) : null
        ) : null}
      </Section>

      <Section
        title={
          <Text bold align="center">
            Date/Time Settings
          </Text>
        }
      >
        <Select
          label={`Time Format`}
          settingsKey="timeFormat"
          options={[
            { name: "12hr", value: false },
            { name: "24hr", value: true },
          ]}
        />
        <Select
          label={`Date Format`}
          settingsKey="dateFormat"
          options={[
            { name: "MM/DD/YYYY", value: "MM/DD/YYYY" },
            { name: "DD/MM/YYYY", value: "DD/MM/YYYY" },
            { name: "YYYY/MM/DD", value: "YYYY/MM/DD" },
            { name: "DD.MM.YYYY", value: "DD.MM.YYYY" },
          ]}
        />
        <Toggle settingsKey="enableDOW" label="Day of week at end of date" />
      </Section>
      
      <Section
        title={
          <Text bold align="center">
            Helpful links
          </Text>
        }
      >
        <Text>
          If you need help getting started follow the links below!
        </Text>
        <Link source="https://github.com/Rytiggy/Glance/wiki/How-to-set-up-Glance#2-settings">
          How to set up your glucose monitoring
        </Link>
        <Text>
          Note: Tapping on the time should try to force the watch to sync.
          You'll feel the watch vibrate.
        </Text>
      </Section>

      <Toggle settingsKey="toggle" label="Advanced" />
      {props.settings.toggle ? (
        JSON.parse(props.settings.toggle) == true ? (
          <Section
            title={
              <Text bold align="center">
                Logs
              </Text>
            }
          >
            <TextInput label="logs" settingsKey="logs" />
            <Button
              list
              label="Resync"
              onClick={() =>
                props.settingsStorage.setItem(
                  "logs",
                  JSON.stringify({ name: "Resyncing" })
                )
              }
            />
            <Button
              list
              label="Reset settings to defaults"
              onClick={() => props.settingsStorage.clear()}
            />
          </Section>
        ) : null
      ) : null}
    </Page>
  );
}

registerSettingsPage(mySettings);
