import React from "react";
import { View, Text,StyleSheet  } from "react-native";
import { createSwitchNavigator, createAppContainer} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import { Screens } from './src/constants/Screens';
import {getAppScreens, getAuthScreens} from './src/screens/AppScreens';
import  AuthLoadingScreen  from './src/screens/auth-loading.screen';
import { NoInternetIntro } from './src/screens/no-internet-intro';
import {default as BottomNavigator} from "./src/components/bottom-navigation/BottomNav";

const appScreens = getAppScreens();
const AppStack = createStackNavigator({...appScreens, tabView: BottomNavigator},
    {initialRouteName: Screens.ENTER_NAME_SCREEN, headerMode: 'none'},
    {
        defaultNavigationOptions: {
            headerForceInset: { top: "never", bottom: "never" }
        }
    });

const AuthStack = createStackNavigator(
      getAuthScreens(), {initialRouteName: Screens.WELCOME_SCREEN});

export default createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        NoInternetIntro: NoInternetIntro,
        App: AppStack,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading',
        backBehavior: 'none'
    }
));


