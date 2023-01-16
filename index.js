import "react-native-gesture-handler";
import {AppRegistry} from 'react-native';
import App from './app';
import {name as appName} from './app.json';
//
console.reportErrorsAsExceptions = false;
AppRegistry.registerComponent(appName, () => App);
if (__DEV__) {
  // Setup Dev Tools for debugging
  require("react-devtools");
}


