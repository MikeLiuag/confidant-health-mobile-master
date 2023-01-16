import React, {Component} from 'react';
import AppNavigator from './AppNavigator';
import {Provider} from './src/redux/provider';
import NavigationService from './src/services/NavigationService';
import PushNotificationListeners from './src/components/PushNotificationListeners';
import {Root} from 'native-base';
import {APP_PREFIX, INSTABUG_TOKEN, SEGMENT_WRITE_KEY, SENDBIRD_APP_ID} from './src/constants/CommonConstants';
import {APP_ENVIRONMENT, HttpClient, NetworkProvider, setSendbirdAppId, SocketClient} from 'ch-mobile-shared';
import AppConfig from './src/utilities/AppConfig';
import AuthStore from './src/utilities/AuthStore';
import analytics from '@segment/analytics-react-native';
import {connectAuth} from './src/redux';
import DeepLinksService from './src/services/DeepLinksService';
import {NativeModules} from 'react-native';
NativeModules.ExceptionsManager.handleException = ()=>{};
ErrorUtils.setGlobalHandler(()=>{});
const AppContainer = AppNavigator;
const ConnectedNetworkProvider = connectAuth()(NetworkProvider);
import Instabug, {BugReporting, NetworkLogger} from 'instabug-reactnative';

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.initializeUtils();
    }

    initializeUtils = () => {
        HttpClient.initialize(AppConfig.config.baseUrl, AuthStore, NavigationService);
        setSendbirdAppId(SENDBIRD_APP_ID);
        console.disableYellowBox = true;
        console._errorOriginal = console.error.bind(console);
        console.error = () => {};
        console.reportErrorsAsExceptions = false;
        SocketClient.init(AppConfig.config.wsUrl, PushNotificationListeners.attachLocalListeners);
        DeepLinksService.init();
        Instabug.start(INSTABUG_TOKEN, [Instabug.invocationEvent.shake, Instabug.invocationEvent.twoFingersSwipe]);
        Instabug.setUserAttribute("type", 'Member');
        Instabug.setUserAttribute("environment", APP_ENVIRONMENT);
        BugReporting.setOptions([BugReporting.option.emailFieldHidden]);
        NetworkLogger.setNetworkDataObfuscationHandler(async (networkData) => {
            if(networkData.requestHeaders.hasOwnProperty('Authorization')) {
                networkData.requestHeaders['Authorization'] = 'AccessTokenHidden';
            }
            if(networkData.responseBody) {
                if (typeof networkData.responseBody === 'string' || networkData.responseBody instanceof String) {
                    const body = JSON.parse(networkData.responseBody);
                    if(body && body.accessToken) {
                        body.accessToken = 'AccessTokenHidden';
                        networkData.responseBody = JSON.stringify(body);
                    }
                }
            }
            return networkData;
        });
    };



    async componentDidMount() {


        await analytics.setup(SEGMENT_WRITE_KEY, {
            recordScreenViews: false,
            trackAppLifecycleEvents: false,
            trackAttributionData: true,
            android: {
                flushInterval: 60,
                collectDeviceId: true,
            },
            ios: {
                trackAdvertising: true,
                trackDeepLinks: true,
            },
        });
    }

    render() {
        console.reportErrorsAsExceptions = false;
        return (
            <Provider>
                <PushNotificationListeners>
                    <ConnectedNetworkProvider nav={NavigationService}>
                        <Root>
                            <AppContainer
                                ref={NavigationService.setTopNavigator}
                                onNavigationStateChange={(
                                    prevState,
                                    currentState,
                                    action,
                                ) => {
                                    Instabug.onNavigationStateChange(prevState,currentState,action);
                                    const currentRouteName = NavigationService.getActiveRouteName(currentState);
                                    const previousRouteName = NavigationService.getActiveRouteName(prevState);
                                    if (previousRouteName !== currentRouteName) {
                                        // the line below uses the segment tracker
                                        const currentRouteParams = NavigationService.getCurrentRouteParams();
                                        const analyticsProps = {};
                                        if (currentRouteParams && currentRouteParams.params) {
                                            analyticsProps.routeParams = JSON.parse(JSON.stringify(currentRouteParams.params));
                                        }
                                        analytics.screen(
                                            currentRouteName
                                        );
                                    }
                                }}
                            />
                        </Root>
                    </ConnectedNetworkProvider>
                </PushNotificationListeners>
            </Provider>
        );
    }
}

