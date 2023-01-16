import React, {Component} from 'react';
import {Image, StatusBar, StyleSheet, Dimensions} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID, AlertUtil, hasNotificationPermissions, isIphoneX, requestNotificationPermissions,
    Colors, PrimaryButton, TextStyles, CommonStyles, BackButton,
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import Loader from '../../components/Loader';
import {NavigationActions, StackActions} from 'react-navigation';
import {connectAuth} from '../../redux';
import AuthService from '../../services/Auth.service';
import KeyValueStorage from 'react-native-key-value-storage';
import OneSignal from 'react-native-onesignal';

class SignupNotificationsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    async componentDidMount(): void {
        // this.subscribeToPlayerId();
        // const notificationStatus = await hasNotificationPermissions();
        // this.setState({
        //     notificationStatus:notificationStatus.status
        // })
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


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

    allowNotifications = async () => {
        const notificationStatus = await hasNotificationPermissions();
        if (notificationStatus.status === 'denied') {
            await requestNotificationPermissions();
        } else if (notificationStatus.status === 'blocked') {
            AlertUtil.showMessage(
                'Notifications are blocked for this device, Please turn on notifications from device settings.',
                'Dismiss',
                'top',
                'warning');
        }
       this.navigateToNextScreen();
    };

    navigateToNextScreen = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.ENTER_PHONE_SCREEN})],
        });
        this.props.navigation.dispatch(resetAction);
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>;
        }
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <View style={styles.backButtonWrapper}>
                    {/*<BackButton*/}
                    {/*    onPress={this.backClicked}*/}
                    {/*/>*/}
                </View>
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
                        <Image
                            {...addTestID('Notification-icon-png')}
                            style={styles.signInIcon}
                            source={require('../../assets/images/new-Notifications-icon2.png')}/>
                        <Text
                            {...addTestID('heading-1')}
                            style={styles.magicMainText}>
                            Notifications
                            are a game changer.
                        </Text>
                        <Text
                            {...addTestID('heading-2')}
                            style={styles.magicSubText}>
                            People who activate them get{'\n'}
                            <Text style={styles.pinkText}>stay on track and get better results.{'\n'}</Text>
                            You can also turn them off at any time.
                        </Text>
                        {/*<Text*/}
                        {/*    {...addTestID('heading-3')}*/}
                        {/*    style={styles.magicSubText}>*/}
                        {/*    You can also turn them off at any time.*/}
                        {/*</Text>*/}
                    </View>

                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId = "continue"
                        onPress={() => {
                            this.allowNotifications();
                        }}
                        text="Allow notifications"
                    />
                    <Text onPress={() => {this.navigateToNextScreen();}} style={{ ...CommonStyles.styles.blueLinkText }}>Skip for now</Text>
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
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
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
        textAlign: 'center',
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    pinkText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.secondaryText
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});
export default connectAuth()(SignupNotificationsScreen);
