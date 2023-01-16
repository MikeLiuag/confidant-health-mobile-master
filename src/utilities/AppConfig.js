import type {ConfigModel} from "../models/Config.model";
import Config from "react-native-config";

/**
 * @class _AppConfig
 * @description A class containing configurable parameters (configurations defined in assets/config.json).
 */
class _AppConfig {
  config: ConfigModel;

  constructor() {
    this.config = require('../assets/config.json');

    if (Config.REACT_APP_ENVIRONMENT === 'production' || Config.REACT_APP_ENVIRONMENT === 'prod') {
      this.config.baseUrl = 'https://app.confidanthealth.com/rest';
      this.config.wsUrl = 'http://app.confidanthealth.com:8086';
    } else if (Config.REACT_APP_ENVIRONMENT === 'development' || Config.REACT_APP_ENVIRONMENT === 'dev') {
      this.config.baseUrl = 'https://dev.confidantdemos.com/rest';
      this.config.wsUrl = 'http://dev.confidantdemos.com:8086';
    } else if (Config.REACT_APP_ENVIRONMENT === 'staging') {
      this.config.baseUrl = 'https://staging.confidantdemos.com/rest';
      this.config.wsUrl = 'http://staging.confidantdemos.com:8086';
    } else if (Config.REACT_APP_ENVIRONMENT === "sit1") {
      this.config.baseUrl = "https://sit1.confidantdemos.com/rest";
      this.config.wsUrl = "http://sit1.confidantdemos.com:8086";
    } else if (Config.REACT_APP_ENVIRONMENT === "sit2") {
      this.config.baseUrl = "https://sit2.confidantdemos.com/rest";
      this.config.wsUrl = "http://sit2.confidantdemos.com:8086";
    } else if (Config.REACT_APP_ENVIRONMENT === 'qa') {
      this.config.baseUrl = 'https://qa.confidantdemos.com/rest';
      this.config.wsUrl = 'http://qa.confidantdemos.com:8086';
    } else if(Config.REACT_APP_ENVIRONMENT === 'demo') {
      this.config.baseUrl = 'https://demo.confidantdemos.com/rest';
      this.config.wsUrl = 'http://demo.confidantdemos.com:8086';
    }
    console.log('BASE URL');
    console.log(this.config.baseUrl);

  }
}
// Creating and exporting a proxy singleton instance of _AppConfig Class
const AppConfig = new _AppConfig();
export default AppConfig;
