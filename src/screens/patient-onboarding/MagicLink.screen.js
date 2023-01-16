import React from 'react';
import {AppState, Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    BackButton,
    Colors,
    CommonStyles,
    Email_Input_Error,
    Email_Input_Label,
    FloatingInputField,
    isIphoneX,
    PrimaryButton,
    TextStyles
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {SEGMENT_EVENT, USER_TYPE} from '../../constants/CommonConstants';
import {EMAIL_REGEX} from 'ch-mobile-shared/src/constants/CommonConstants';
import Analytics from '@segment/analytics-react-native';
import {AlertUtil} from 'ch-mobile-shared/src/utilities/AlertUtil';
import AlfieLoader from '../../components/Loader';
import {connectAuth} from '../../redux';
import moment from "moment";
import DeviceInfo from 'react-native-device-info';
import {NavigationActions, StackActions} from "react-navigation";

class MagicLinkScreen extends React.Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.nickname = navigation.getParam('nickname', null);
        this.onboardingGoals = navigation.getParam('onboardingGoals', null);
        this.usageTimePlan = navigation.getParam('usageTimePlan', null);
        this.zipCode = navigation.getParam('zipCode', null);
        this.suicidal = navigation.getParam('suicidal', false);
        this.data = navigation.getParam('data', null);
        this.screenRef = navigation.getParam('screenRef', null);
        this.state = {
            appState: AppState.currentState,
            hasEmailError: null,
            emailFocus: false,
            email: null,
            isLoading: false,
            keyboardOpen: false,
        };
        this.props.resetAuth();
    }

    validateEmail = () => {
        this.setState({emailFocus: false});
        let hasEmailError = !EMAIL_REGEX.test(this.state.email);
        this.setState({hasEmailError});
        return !hasEmailError;
    };

    focusEmail = () => {
        this.setState({emailFocus: true});
    };

    onChangeText = (emailAddress) => {
        let email = null;
        if (emailAddress !== '') {
            email = emailAddress.trim();
        }
        this.setState({email, hasEmailError: null});
    };

    performLogin = async () => {
        Keyboard.dismiss();
        if (!this.validateEmail()) {
            AlertUtil.showErrorMessage('Invalid email address');
        } else {
            let provisionalPatientDetails;
            if (this.props.navigation.state.params) {
                const {
                    nickname, shortOnBoardingDetails, usageTimePlan, state
                } = this.props?.navigation?.state?.params;
                provisionalPatientDetails = {
                    nickName: nickname,
                    shortOnBoardingDetails: shortOnBoardingDetails,
                    usageTimePlan: usageTimePlan,
                    state: state,
                };
            } else {
                provisionalPatientDetails = {
                    nickName: null,
                    onboardingGoals: null,
                    usageTimePlan: null,
                    state: null,
                };
            }
            const preOnBoardPayload = {
                email: this.state.email,
                provisionalPatientDetails,
                suicidal: this.suicidal,
                type: USER_TYPE,
            };
            this.props.loginWithMagic({
                request: preOnBoardPayload, callback: () => {
                    // Analytics.track('Member Authentication - MagicLink Login Attempt', {
                    //     email: this.state.email,
                    //     nickName: this.nickname,
                    //     onboardingGoals: this.onboardingGoals,
                    //     zipCode: this.zipCode,
                    //     suicidal: this.suicidal,
                    //     type: USER_TYPE,
                    // });
                    this.navigateToNextScreen();
                },
            });
        }
    };

    navigateToNextScreen = () => {
        if (this.suicidal) {
            this.props.navigation.replace(Screens.EMERGENCY_SERVICE_SCREEN);
        } else {
            Analytics.track(SEGMENT_EVENT.MEMBER_REQUESTED_MAGIC_LINK, {
                category: 'Goal Completion',
                label: 'Magic link',
                email: this.state.email,
                deviceType: DeviceInfo.getBrand,
                requestedLinkAt: moment.utc(Date.now()).format(),
            })
            this.props.navigation.navigate(Screens.SENT_MAGIC_LINK_SCREEN, {
                ...this.props.navigation.state.params,
                email: this.state.email,
            });
        }
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
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
            keyboardOpen: true,
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false,
        });
    };

    navigateToWelcome = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
                    routeName: Screens.WELCOME_SCREEN,
                }
            )],
        });
        this.props.navigation.dispatch(resetAction);

    };


    clearText = (stateKey) => {
        const {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.auth.isLoading) {
            return (
                <AlfieLoader/>
            );
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
                        {this.screenRef === "EnterName" &&
                            <BackButton
                                onPress={() => this.props.navigation.goBack()}
                            />
                        }

                    </View>
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            {/*<Image*/}
                            {/*  style={styles.signInIcon}*/}
                            {/*  source={require('../../assets/images/new-Magic-Link-icon.png')}/>*/}
                            <Text style={styles.magicMainText}>
                                Please confirm your email,{'\n'} so we can save your{'\n'}progress in the app.
                            </Text>
                            <Text style={styles.magicSubText}>
                                We’ll send you a link to log in securely.
                            </Text>
                        </View>
                    </Content>
                    <View
                        {...addTestID('send-link')}
                        style={styles.greBtn}>
                        <View style={{marginBottom: 16}}>
                            <FloatingInputField
                                testId={'Email-Input'}
                                hasError={this.state.hasEmailError}
                                hasFocus={this.state.emailFocus}
                                keyboardType={'email-address'}
                                blur={this.validateEmail}
                                focus={this.focusEmail}
                                changeText={this.onChangeText}
                                returnKeyType={'send'}
                                submitEditing={this.performLogin}
                                value={this.state.email}
                                labelErrorText={Email_Input_Error}
                                labelText={Email_Input_Label}
                                inputIconType={'SimpleLineIcons'}
                                inputIconName={'envelope'}
                                editable={true}
                                clearText={() => {
                                    this.clearText("email")
                                }}
                            />
                        </View>
                        <PrimaryButton
                            arrowIcon={false}
                            testId="Send Link"
                            onPress={this.performLogin}
                            text="Confirm Email"
                        />
                        {!this.props?.navigation?.state?.params?.nickname && (
                            <Text
                                {...addTestID('register')}
                                onPress={() => {
                                    this.navigateToWelcome();
                                }} style={{...CommonStyles.styles.blueLinkText}}>
                                I don't have an account.
                            </Text>
                        )}
                        <Text style={styles.emailBottomText}>Your email is confidential and never shared.</Text>
                    </View>

                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
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
        marginBottom: 70,
        flex: 1,
        marginTop: 40,
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
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
    },
    emailBottomText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.mediumContrast,
        marginTop: 32,
        textAlign: 'center',
    }

});
export default connectAuth()(MagicLinkScreen);
