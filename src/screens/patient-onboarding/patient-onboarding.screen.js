import React, {Component} from 'react';
import {Button, Container, H2, Left, Right, Text,} from 'native-base';
import {NativeModules, Platform, StatusBar, StyleSheet} from 'react-native';
import {Buttons, Colors, TextStyles} from '../../styles';
import {Grid, Row} from 'react-native-easy-grid';
import AppliedFor from '../../components/patient-onboarding/applied-for';
import AgeWheel from '../../components/patient-onboarding/age-wheel';
import Gender from '../../components/patient-onboarding/gender';
import {Screens} from '../../constants/Screens';
import {
    AGE_WHEEL_INIT,
    APPLIED_FOR_MYSELF,
    GENDER_MALE,
    NICK_NAME,
    PATIENT_ONBOARDING_SCREEN_HEADINGS,
    USER_ID
} from '../../constants/CommonConstants';
import {addTestID, AlertUtil} from 'ch-mobile-shared';
import ProfileService from '../../services/Profile.service';
import KeyValueStorage from "react-native-key-value-storage"
import AuthService from "../../services/Auth.service";
import SplashScreen from "react-native-splash-screen";
import OneSignal from "react-native-onesignal";
import AlfieLoader from './../../components/Loader.js'
import Analytics from '@segment/analytics-react-native';

const Headings = PATIENT_ONBOARDING_SCREEN_HEADINGS;

const AnimatedSplash = NativeModules.AnimatedSplash;
/**
 * Class to display the Patient On-Boarding Screens (Applied For, Age, Gender)
 *
 * @class PatientOnBoardingScreen
 * @extends Component
 */
export default class PatientOnBoardingScreen extends Component {
    static navigationOptions = {
        header: null,
    };


    constructor(props) {
        super(props);
        this.state = {
            heading: Headings.appliedFor,
            appliedFor: APPLIED_FOR_MYSELF,
            age: AGE_WHEEL_INIT,
            gender: GENDER_MALE,
            is_loading: true,
            page: 1
        };
        let isOnboared = this.props.navigation.getParam('isOnboarded', false);
        if (!isOnboared) {
            ProfileService.checkPatientOnboarding().then(onBoardingStatus => {

                isOnboared = onBoardingStatus.isOnboarded;
                if (isOnboared) {
                    this.navigateToChatScreen();
                } else {
                    this.setState({is_loading: false});
                }
                SplashScreen.hide();
                if (Platform.OS === 'ios') {
                    AnimatedSplash.hide();
                }

            });
        } else {
            this.navigateToChatScreen();
        }
    }

    componentDidMount() {
        Analytics.screen(
            'Member Profile Screen'
        );
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

    navigateToChatScreen = async () => {
        this.subscribeToPlayerId();
        const data = this.props.navigation.getParam('data', null);
        if (data) {
            KeyValueStorage.set(USER_ID, data.userId);
            KeyValueStorage.set(NICK_NAME, data.nickName);
        }
        this.props.navigation.replace(Screens.PENDING_CONNECTIONS_SCREEN, {data})
    };

    /**
     * Prepare payload and Send response to backend
     *
     * @event sendResponse
     */
    sendResponse = async () => {

        const data = this.props.navigation.getParam('data', null);

        const requestBody = {
            appliedFor: this.state.appliedFor,
            age: this.state.age,
            gender: this.state.gender
        };
        this.setState({
            is_loading: true
        });
        try {
            const response = await ProfileService.patientOnBoarding(requestBody);
            this.setState({
                is_loading: false
            });
            if (response.errors) {
                await AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                // Navigate to next screen here.
                Analytics.identify(data.userId, {
                  appliedFor: requestBody.appliedFor,
                  age: requestBody.age,
                  gender: requestBody.gender,
                  name: data.nickName
                });
                await AlertUtil.showSuccessMessage('Patient onboarded successfully');
                this.navigateToChatScreen();
            }
        } catch (e) {
            await this.setState({
                is_loading: false
            });
            await AlertUtil.showErrorMessage('An unknown error occurred, please try again');
        }
    };
    /**
     * Navigate to the next component. if count is 4 (last component) then send response to backend
     *
     * @event navigateToNextComponent
     */
    navigateToNextComponent = async () => {
        await this.setState({
            page: this.state.page + 1
        });
        if (this.state.page >= 4) {
            await this.setState({
                is_loading: true
            });
            // Call backend Api to onboard patient
            this.sendResponse();
        } else {
            this.initializeComponent();
        }
    };
    /**
     * Navigate back to the previous component.
     *
     * @event navigateBackToPreviousComponent
     */
    navigateBackToPreviousComponent = async () => {
        await this.setState({
            is_loading: false,
            page: this.state.page - 1
        });
        this.initializeComponent();
    };

    /**
     * set headings for the specific components to be rendered
     *
     * @event initializeComponent
     */
    initializeComponent() {
        switch (this.state.page) {
            case 1:
                this.setState({
                    heading: Headings.appliedFor
                });
                break;
            case 2:
                this.setState({
                    heading: this.state.appliedFor === APPLIED_FOR_MYSELF ? Headings.ageMyself : Headings.ageSomeoneElse
                });
                break;
            case 3:
                this.setState({
                    heading: this.state.appliedFor === APPLIED_FOR_MYSELF ? Headings.genderMySelf : Headings.genderSomeoneElse
                });
                break;
        }
    }

    /**
     * listen to and set value of appliedFor from 'applied-for' component
     *
     * @event getAppliedFor
     * @param value
     */
    getAppliedFor = (value) => {
        this.setState({appliedFor: value});
    };
    /**
     * listen to and set value of age from 'age-wheel' component
     *
     * @event getAge
     * @param value
     */
    getAge = (value) => {
        this.setState({age: value});
    };
    /**
     * listen to and set value of gender from 'gender' component
     *
     * @event getGender
     * @param value
     */
    getGender = (value) => {
        this.setState({gender: value});
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={POBstyles.wrapper}>
                <StatusBar backgroundColor='transparent' translucent={false} animated showHideTransition="slide"/>
                {
                    this.state.is_loading ?
                        <AlfieLoader/> :

                        <Grid>

                            <Button
                                {...addTestID('new-onboarding-screen')}
                                transparent onPress={() => {
                                this.props.navigation.replace(Screens.MAGIC_LINK_SCREEN)
                            }}>
                                <Text>New onBoarding Screens</Text>
                            </Button>


                            <Row size={10} style={POBstyles.textBlock}>
                                <H2 style={POBstyles.title}>{this.state.heading}</H2>
                            </Row>
                            <Row size={10} style={POBstyles.textBlock}>
                                <Text style={POBstyles.subTitle}>This information will not be shared with anyone without
                                    your explicit consent.</Text>
                            </Row>

                            {
                                this.state.page === 1 ?
                                    <AppliedFor appliedFor={this.state.appliedFor}
                                                onChoiceSelected={this.getAppliedFor}/> :
                                    this.state.page === 2 ? <AgeWheel age={this.state.age}
                                                                      onChoiceSelected={this.getAge}/> :
                                        <Gender gender={this.state.gender} onChoiceSelected={this.getGender}/>}


                            <Row size={10}>
                                <Left>

                                    {this.state.page > 1 ?

                                        <Button title="navigateBack" transparent onPress={() => {
                                            this.navigateBackToPreviousComponent();
                                        }}>
                                            <Text
                                                style={POBstyles.darkText}>PREV</Text>
                                        </Button> : null}
                                </Left>
                                <Right>
                                    <Button
                                        {...addTestID('button')}
                                        title="goToNextComponent" transparent
                                            onPress={() => this.navigateToNextComponent()}>
                                        <Text
                                            style={POBstyles.darkText}> {this.state.page >= 3 ? 'DONE' : 'NEXT'} </Text>
                                    </Button>
                                </Right>
                            </Row>
                        </Grid>
                }
            </Container>
        );
    }

    /**
     * Subscribe to Device id from OneSignal (UserId) and register as a player
     *
     * @event getPlayerId
     */
    subscribeToPlayerId = () => {
        OneSignal.addEventListener('ids', this.onIds);
    };


}
// Style
const POBstyles = StyleSheet.create({
    loadersty: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)'
    },
    wrapper: {
        paddingTop: 20,
        ...Platform.select({
            android: {
                // marginTop: StatusBar.currentHeight
            }
        })
    },
    title: {
        color: Colors.colors.darkText,
        ...TextStyles.mediaTexts.mainTitle,
    },
    subTitle: {
        color: Colors.colors.lightText,
        ...TextStyles.mediaTexts.subTitle,
    },
    textBlock: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    greyText: {
        ...Buttons.mediaButtons.prevNextText,
        color: Colors.colors.lightestText,
    },
    darkText: {
        ...Buttons.mediaButtons.prevNextText,
        color: Colors.colors.darkText,
        fontWeight: '700',
        textTransform: 'uppercase'
    }
});
