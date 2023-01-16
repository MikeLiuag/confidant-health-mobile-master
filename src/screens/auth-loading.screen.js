import React, { Component } from "react";
import { NativeModules, Platform, StatusBar } from "react-native";
import AuthService from "../services/Auth.service";
import { INSTABUG_TOKEN, LOGGED_OUT, SEGMENT_EVENT } from "../constants/CommonConstants";
import SplashScreen from "react-native-splash-screen";
import AuthStore from "./../utilities/AuthStore";
import { AlfieLoader, APP_ENVIRONMENT } from "ch-mobile-shared";
import Analytics from "@segment/analytics-react-native";
import { connectReduxState } from "../redux";
import { USER_LOGGED_IN_SUCCESSFUL } from "../redux/modules/auth/actions";
import VersionCheck from "react-native-version-check";
import { Alert, BackHandler, Linking } from "react-native";
import Config from "react-native-config";
import Instabug from "instabug-reactnative";
import moment from "moment";

const AnimatedSplash = NativeModules.AnimatedSplash;

class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.validateCertAndBootstrap();
  }

  checkAppVersion = async () => {
    try {
      await Analytics.track(SEGMENT_EVENT.APPLICATION_OPENED, {
        userId: this.props.auth.meta.userId,
        category: "Goal Completion",
        label: "Application Opened",
        opendedAt: moment.utc(Date.now()).format(),
      });
      const updateNeeded = await VersionCheck.needUpdate();
      if (updateNeeded && updateNeeded.isNeeded) {
        await Analytics.track(SEGMENT_EVENT.UPDATE_APP_VERSION, {
          userId: this.props.auth.meta.userId,
          category: "Goal Completion",
          label: "UPdate App Version",
          opendedAt: moment.utc(Date.now()).format(),
        });
        Alert.alert(
          "Please Update",
          "You will have to update your app to the latest version to continue using Confidant.",
          [
            {
              text: "Update",
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL(updateNeeded.storeUrl);
              },
            },
            APP_ENVIRONMENT !== "prod" && {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
              },
            }],
          { cancelable: APP_ENVIRONMENT !== "prod" },
        );
      } else {
        await Analytics.track(SEGMENT_EVENT.APPLICATION_UPDATED, {
          userId: this.props.auth.meta.userId,
          category: "Goal Completion",
          label: "UPdate App Version",
          opendedAt: moment.utc(Date.now()).format(),
        });
      }

    } catch (e) {
      console.log(e);
    }
  };

  displayConnectivityError = () => {
    Alert.alert(
      "Connection Error",
      "There seems to be a connectivity issue with the server. Please contact support at help@confidanthealth.com for further information.",
      [
        {
          text: "Dismiss",
          onPress: () => {
            BackHandler.exitApp();
          },
        }],
      { cancelable: false },
    );
  };

  getUrl = () => {
    let url = "confidantdemos.com";
    if (Config.REACT_APP_ENVIRONMENT === "prod" || Config.REACT_APP_ENVIRONMENT === "production") {
      url = "app.confidanthealth.com";
    } else if (Config.REACT_APP_ENVIRONMENT === "qa") {
      url = "qa." + url;
    } else if (Config.REACT_APP_ENVIRONMENT === "staging") {
      url = "staging." + url;
    } else if (Config.REACT_APP_ENVIRONMENT === "dev" || Config.REACT_APP_ENVIRONMENT === "development") {
      url = "dev." + url;
    }
    return url;
  };

  async validateCertAndBootstrap() {
    if (__DEV__) {
      console.log("Skipping Cert pinning");
      this._bootstrap();
    } else {
      let url = this.getUrl();
      console.log("Checking pinning to : " + url);
      fetch("https://" + url)
        .then((res) => {
          console.log("Connected to environment: " + url);
          this._bootstrap();
        })
        .catch((err) => {
          console.log("Error: " + err);
          console.log("Connection to environment failed: " + url);
          this.displayConnectivityError();
        });
    }

  }

  async _bootstrap() {
    const authToken = await AuthStore.getAuthToken();
    let route = "Auth";
    if (authToken && authToken !== LOGGED_OUT) {
      console.log("An existing auth token found");
      try {
        const refreshed = await AuthService.refreshAuthToken();
        if (!refreshed.errors) {
          Analytics.identify(refreshed.userId, {});
          Instabug.setUserAttribute("userId", refreshed.userId);
          await AuthStore.setTokenExpiration(refreshed.expiration);
          route = "App";
          this.props.dispatch({ type: USER_LOGGED_IN_SUCCESSFUL, data: refreshed });
        } else {
          if (Platform.OS === "ios") {
            AnimatedSplash.hide();
          }
          SplashScreen.hide();
        }
      } catch (e) {
        if (e.message && e.message === "Network request failed") {
          console.log("No Internet connection");
          route = "NoInternetIntro";
        }
        SplashScreen.hide();
        if (Platform.OS === "ios") {
          AnimatedSplash.hide();
        }
      }
    } else {
      setTimeout(() => {
        SplashScreen.hide();
        if (Platform.OS === "ios") {
          AnimatedSplash.hide();
        }
      }, 2000);

    }
    this.props.navigation.navigate(route);
    this.checkAppVersion();
  }

  render() {
    StatusBar.setBackgroundColor("transparent", true);
    return (<AlfieLoader />);
  }
}

export default connectReduxState()(AuthLoadingScreen);
