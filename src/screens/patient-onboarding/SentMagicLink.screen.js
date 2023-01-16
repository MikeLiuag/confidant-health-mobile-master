import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, Dimensions, Linking} from 'react-native';
import {Button, Container, Content, Text, View} from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, BackButton, CommonStyles } from 'ch-mobile-shared';
import {connectAuth} from '../../redux';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {CONFIDANT_HELP_EMAIL, SEGMENT_EVENT, USER_TYPE} from "../../constants/CommonConstants";
import Analytics from '@segment/analytics-react-native';
import {NavigationActions, StackActions} from "react-navigation";
import DeviceInfo from "react-native-device-info";
import moment from "moment";
import { openInbox } from "react-native-email-link";

const windowHeight = Dimensions.get('window').height;

class SentMagicLinkScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.email = navigation.getParam('email', null);
        this.nickname = navigation.getParam('nickname', null);
        this.onboardingGoals = navigation.getParam('onboardingGoals', null);
        this.zipCode = navigation.getParam('zipCode', null);
        this.suicidal = navigation.getParam('suicidal', false);
        this.data = navigation.getParam('data', null);
        this.state = {
            isButtonDisabled: false
        };
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };

    resendMagicLink = () => {
        this.setState({isButtonDisabled: true});

        const provisionalPatientDetails = {
            nickName: this.nickname,
            onboardingGoals: this.onboardingGoals,
            zipCode: this.zipCode,
        };

        const resendPayload = {
            email: this.email,
            provisionalPatientDetails,
            suicidal: this.suicidal,
            type: USER_TYPE,
        };

        this.props.loginWithMagic({
            request: resendPayload, callback: () => {
                Analytics.track(SEGMENT_EVENT.MEMBER_REQUESTED_MAGIC_LINK, {
                    email: this.email,
                    deviceType: DeviceInfo.getBrand,
                    requestedLinkAt: moment.utc(Date.now()).format(),
                });
                // Analytics.track('Member Authentication - MagicLink resend Link Attempt', {
                //     email: this.email,
                // });
            },
        });

        setTimeout(() => this.setState({ isButtonDisabled: false }), 30000);
    }

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    navigateToEnterNameScreen = ()=>{
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.ENTER_NAME_SCREEN})],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
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
                            source={require('../../assets/images/new-Link-Sent-icon2.png')}/>
                        <Text
                            {...addTestID('check-email')}
                            style={styles.magicMainText}>
                            Check your email
                        </Text>
                        <Text
                            {...addTestID('click-link')}
                            style={{...styles.magicSubText, marginBottom: 20}}>
                            Using this phone, click the link we {`\n`}sent to <Text style={styles.emailText}>{this.email}</Text>. It will {`\n`}automatically reopen the app.
                        </Text>
                        <Text
                            {...addTestID('click-link')}
                            style={styles.magicSubText}>
                            Don’t forget to check the “Spam” {'\n'} folder.
                        </Text>
                    </View>

                </Content>
                <View style={styles.greBtn}>
                    <View style={{ marginBottom: 16 }}>
                        <PrimaryButton
                            arrowIcon={false}
                            text="Open email app"
                            onPress={() => {
                                openInbox();
                            }}
                        />
                    </View>
                    <PrimaryButton
                        bgColor={Colors.colors.mainBlue10}
                        textColor={Colors.colors.primaryText}
                        arrowIcon={false}
                        disabled={this.state.isButtonDisabled}
                        onPress={this.resendMagicLink}
                        text="Re-send link"
                    />
                    {/*{!this.nickname && (*/}
                    {/*    <Text*/}
                    {/*        {...addTestID('register')}*/}
                    {/*        onPress={() => {*/}
                    {/*            this.navigateToEnterNameScreen();*/}
                    {/*        }} style = {{...CommonStyles.styles.blueLinkText}}>*/}
                    {/*        I don’t have an account.*/}
                    {/*    </Text>*/}
                    {/*)}*/}
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingTop: isIphoneX()? 48 : 20,
        paddingHorizontal: 24,
        marginBottom: 70,
        // minHeight: windowHeight - 390,
        flex: 1
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
        textAlign: 'center'
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    emailText: {
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.TextH5,
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});


export default connectAuth()(SentMagicLinkScreen);
