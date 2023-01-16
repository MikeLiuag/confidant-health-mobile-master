import React, {Component} from 'react';
import {
    AppState,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    NativeModules,
    Platform,
    StatusBar,
    StyleSheet
} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    AlfieLoader,
    BackButton,
    Colors,
    FloatingInputField, hasNotificationPermissions,
    isIphoneX,
    Nick_Name_Input_Error,
    PrimaryButton,
    TextStyles
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {NAME_REGEX, NICK_NAME, SEGMENT_EVENT, USER_ID} from "../../constants/CommonConstants";
import ProfileService from "../../services/Profile.service";
import KeyValueStorage from "react-native-key-value-storage"
import AuthService from "../../services/Auth.service";
import {connectAuth} from '../../redux';
import OneSignal from "react-native-onesignal";
import {NavigationActions, StackActions} from "react-navigation";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

const AnimatedSplash = NativeModules.AnimatedSplash;

class EnterNameScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            appState: AppState.currentState,
            nickname: '',
            onBoardingGoals: null,
            hasNameError: null,
            nameFocus: false,
            isLoading: true,
            keyboardOpen: false
        };
        this.form = {
            submitBtn: ''
        };
    }


    onIds = async (device) => {
        if (device.userId) {
            console.log('Got Player Id. Registering: ' + device.userId);
            try {
                const response = await AuthService.registerPlayerId(device.userId);
                if (response.errors) {
                    console.warn(response.errors[0].endUserMessage);
                } else {
                    await KeyValueStorage.set('playerId', device.userId);
                    console.log('PLAYER ID REGISTERED: ' + device.userId);
                }
            } catch (e) {
                console.warn('Could not register player id. Notifications may not work');
                console.warn(e);
            }
        }
    };

    subscribeToPlayerId = () => {
        OneSignal.addEventListener('ids', this.onIds);
    };

    newLoginSegmentEventDetails = async () => {
        const {data} = this.props.auth;
        const segmentPayload = {
            userId: data?.userId,
            loggedInAt: moment.utc(Date.now()).format()
        };

        await Analytics.track(SEGMENT_EVENT.NEW_LOGIN, segmentPayload);
    }

    navigateToMatchMakerScreen = async () => {
        this.subscribeToPlayerId();
        await this.newLoginSegmentEventDetails();
        const {data} = this.props.auth;
        if (data) {
            KeyValueStorage.set(USER_ID, data.userId);
            KeyValueStorage.set(NICK_NAME, data.nickName);
        }
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.PENDING_CONNECTIONS_SCREEN, params: {data}})],
        });
        this.props.navigation.dispatch(resetAction);
    };


    navigateToPostOnBoarding = async () => {
        const notificationStatus = await hasNotificationPermissions();
        console.log('notificationStatus', notificationStatus)
        if (notificationStatus.status === 'granted') {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({routeName: Screens.ENTER_PHONE_SCREEN})],
            });
            this.props.navigation.dispatch(resetAction);
        } else {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({routeName: Screens.SIGNUP_NOTIFICATION_SCREEN})],
            });
            this.props.navigation.dispatch(resetAction);
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentDidMount(): void {
        Analytics.screen(
            'Sign Up Screen'
        );
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.checkPatientOnBoardStatus();
    }

    checkPatientOnBoardStatus = () => {
        if (!this.props.auth.isLoading && this.props.auth.isAuthenticated) {
            ProfileService.checkPatientOnboardingStatus().then(response => {
                const {OnboardingStatus} = response;
                if (OnboardingStatus === "ONBOARDED_PARTIALLY") {
                    this.navigateToPostOnBoarding();
                } else {
                    this.newLoginSegmentEvent();
                    this.navigateToMatchMakerScreen();
                }
                SplashScreen.hide();
                if (Platform.OS === 'ios') {
                    AnimatedSplash.hide();
                }
            });
        } else {
            this.setState({isLoading: false});
        }
    }

    newLoginSegmentEvent = () => {
        const segmentPayload = {
            userId: this.props.auth?.meta?.userId,
            loggedInAt: moment.utc(Date.now()).format(),
        }
        Analytics.track(SEGMENT_EVENT.NEW_LOGIN, segmentPayload);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    };

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
    };

    navigateToNextScreen = () => {
        const data = this.props.navigation.getParam('data', null);
        if (this.validateName()) {
            this.props.navigation.navigate(Screens.MAGIC_LINK_SCREEN, {
                ...this.props.navigation.state.params,
                nickname: this.state.nickname.trim(),
                data: data,
                screenRef: "EnterName"
            });
        }
    };

    validateName = () => {
        this.setState({nameFocus: false});
        const nickname = this.state.nickname.trim();
        let hasNameError = false;
        if (nickname === null || nickname === '') {
            hasNameError = true;
        } else if (nickname && nickname.length > 80) {
            AlertUtil.showErrorMessage("The length of nickname must be less than or equal to 80")
            hasNameError = true;
        } else if (nickname && nickname !== '') {
            hasNameError = !NAME_REGEX.test(nickname);
        }
        this.setState({hasNameError, nickname});
        return !hasNameError;
    };

    onChangeText = (nickname) => {
        this.setState({hasNameError: null, nickname});
    };

    focusName = () => {
        this.setState({nameFocus: true});
    };

    performLogin = () => {
        this.form.submitBtn.props.onPress();
    };
    clearText = (stateKey) => {
        const {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <AlfieLoader/>
        }
        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <Container style={{backgroundColor: Colors.colors.screenBG}}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <View style={styles.backButtonWrapper}>
                        <BackButton
                            onPress={this.backClicked}
                        />
                    </View>
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            <Image
                                style={styles.signInIcon}
                                source={require('../../assets/images/new-Welcome-icon-blue.png')}/>
                            <Text style={styles.magicMainText}>
                                What would you like {'\n'}
                                us to call you?
                            </Text>
                            <Text style={styles.magicSubText}>
                                You can use a nickname to stay anonymous if you like.
                            </Text>
                        </View>
                    </Content>

                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <View style={{marginBottom: 16}}>
                            <FloatingInputField
                                testId={'name-input'}
                                hasError={this.state.hasNameError}
                                hasFocus={this.state.nameFocus}
                                keyboardType={'default'}
                                blur={this.validateName}
                                focus={this.focusName}
                                changeText={this.onChangeText}
                                returnKeyType={'next'}
                                submitEditing={this.performLogin}
                                value={this.state.nickname}
                                labelErrorText={Nick_Name_Input_Error}
                                labelText={"First name or Nickname"}
                                inputIconType={'Feather'}
                                inputIconName={'user'}
                                editable={true}
                                clearText={() => {
                                    this.clearText("nickname")
                                }}
                            />
                        </View>
                        <PrimaryButton
                            testId='continue'
                            disabled={!this.state.nickname.trim()}
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                            ref={btn => {
                                this.form.submitBtn = btn;
                            }}
                            text="Continue"
                        />
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    alfie: {
        width: 110,
        height: 110,
    },
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX() ? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
        flex: 1
    },
    signInIcon: {
        marginBottom: 40,
        width: 80,
        height: 80
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center',
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});

export default connectAuth()(EnterNameScreen);
