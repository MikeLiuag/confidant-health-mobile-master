import React, {Component} from "react";
import {Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet,} from "react-native";
import {Container, Content, Text, View} from "native-base";
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    FloatingInputField,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from "ch-mobile-shared";
import {Screens} from "../../constants/Screens";
import {PHONE_REGEX, PrimaryMotivation, SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";
import ProfileService from "../../services/Profile.service";
import Analytics from "@segment/analytics-react-native";
import DeviceInfo from "react-native-device-info";
import {connectAuth} from "../../redux";
import Loader from "../../components/Loader";
import {NavigationActions, StackActions} from "react-navigation";

class EnterPhoneScreen extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            phoneNumber: "",
            phoneNumberFocus: false,
            hasPhoneNumberError: null,
        };
    }

    componentDidMount() {
        this.props.fetchProfile();
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.PENDING_CONNECTIONS_SCREEN},
            )],
        });
        this.props.navigation.dispatch(resetAction);
    };

    validatePhoneNumber = () => {
        this.setState({phoneNumberFocus: false});
        const phoneNumber = this.state.phoneNumber.trim();
        let hasPhoneNumberError = false;
        if (phoneNumber === null || phoneNumber === "") {
            hasPhoneNumberError = true;
        } else if (phoneNumber && phoneNumber !== "") {
            hasPhoneNumberError = !PHONE_REGEX.test(phoneNumber);
        }
        this.setState({hasPhoneNumberError});
        return !hasPhoneNumberError;
    };

    focusPhoneNum = () => {
        this.setState({phoneNumberFocus: true});
    };

    onChangePhoneNum = (phoneNumber) => {
        this.setState({
            hasPhoneNumberError: null,
            phoneNumber,
        }, () => this.validatePhoneNumber());
    };

    getPrimaryMotivation = (shortOnBoardingDetails) => {
        if (shortOnBoardingDetails?.needAppointment)
            return PrimaryMotivation.WANT_TO_BOOK_AN_APPOINTMENT;
        else if (shortOnBoardingDetails?.talkToMatchMaker)
            return PrimaryMotivation.WANT_TO_TALK_TO_SOMEONE;
        else if (shortOnBoardingDetails?.exploreAppByOwn)
            return PrimaryMotivation.WANT_TO_EXPLORE_APP_OWN;
        else if (shortOnBoardingDetails?.skip)
            return PrimaryMotivation.SKIP_SHORT_ON_BOARDING;
        return "NA";
    };

    sendResponse = async (skip) => {
        try {
            this.setState({isLoading: true});
            const connectionSuggestions = this.state.suggestions?.filter(item => item?.selected).map(item => item?.title);
            const postOnboardPayload = {
                providerId: null,
                profileImage: this.profileImage,
                connectionSuggestion: connectionSuggestions,
            };
            if (!skip) {
                postOnboardPayload.phoneNumber = this.state.phoneNumber.trim();
            }
            const onBoardRequestBody = {
                profile: postOnboardPayload,
                file: null,
            };
            const response = await ProfileService.patientOnBoarding(onBoardRequestBody);
            if (response.errors) {
                this.setState({isLoading: false});
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                if (!this.props.profile.isLoading) {
                    this.props.onUserOnboarded({
                        nickName: this.props?.auth?.meta?.nickname,
                        userId: this.props?.auth?.meta?.userId,
                    });
                    const patient = this.props?.profile?.patient;
                    const primaryMotivation = this.getPrimaryMotivation(patient?.shortOnBoardingDetail);
                    await Analytics.identify(this.props?.auth?.meta?.userId, {
                        "Phone": this.state.phoneNumber.trim() === null ? "NA" : this.state.phoneNumber.trim(),
                        "Email": patient?.email,
                        "State": patient?.state,
                        "Primary Motivation": primaryMotivation,
                    });
                    await Analytics.track(SEGMENT_EVENT.NEW_MEMBER_ONBOARDING_SUCCESSFULLY, {
                        userId: this.props?.auth?.meta?.userId,
                        label: "New Account Created - Short",
                        email: patient?.email,
                        primaryMotivation: primaryMotivation,
                        state: patient?.state,
                        appointmentRequestDate: (patient?.shortOnBoardingDetail?.needAppointment || patient?.shortOnBoardingDetail?.talkToMatchMaker) ? patient?.shortOnBoardingDetail?.requestedAppointmentDate + " " + patient?.shortOnBoardingDetail?.requestedAppointmentMonth : "NA",
                        appointmentRequestTime: (patient?.shortOnBoardingDetail?.needAppointment || patient?.shortOnBoardingDetail?.talkToMatchMaker) ? patient?.shortOnBoardingDetail?.requestedAppointmentTime : "NA",
                        deviceType: DeviceInfo.getBrand,
                        requestedLinkAt: moment.utc(Date.now()).format(),
                    });
                    await AlertUtil.showSuccessMessage("Patient onboarded successfully");
                    this.setState({isLoading: false}, () => {
                        setTimeout(() => {
                            this.navigateToNextScreen();
                        }, 100);
                    });
                }

            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage("Something went wrong, please try later");
        }
    };

    clearText = (stateKey) => {
        const {state} = this;
        state[stateKey] = "";
        state.hasPhoneNumberError = null;
        this.setState(state);
    };

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if (this.state.isLoading && !this.props.profile.isLoading) {
            return <Loader/>;
        }
        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === "ios" ? "padding" : null}>
                <Container style={{backgroundColor: Colors.colors.screenBG}}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            <Image
                                style={styles.signInIcon}
                                source={require('../../assets/images/new-Welcome-icon.png')}/>
                            <Text style={styles.magicMainText}>
                                Welcome back!{"\n"}
                                Let’s keep in touch.
                            </Text>
                            <Text style={styles.magicSubText}>
                                Providing your number allows us to text you. We can then send nudges, reminders, and
                                other info to keep
                                you on track.
                            </Text>
                        </View>
                    </Content>

                    <View
                        {...addTestID("view")}
                        style={styles.greBtn}>
                        <View style={{marginBottom: 16}}>
                            <FloatingInputField
                                testId={"phone-input"}
                                hasError={this.state.hasPhoneNumberError}
                                hasFocus={this.state.phoneNumberFocus}
                                keyboardType={"phone-pad"}
                                blur={this.validatePhoneNumber}
                                focus={this.focusPhoneNum}
                                changeText={this.onChangePhoneNum}
                                returnKeyType={"next"}
                                // submitEditing={this.onSubmitFormPhone}
                                getRef={field => {
                                    this.form.phoneNumberField = field;
                                }}
                                value={this.state.phoneNumber}
                                labelErrorText={"Incorrect Phone Number"}
                                labelText={"Phone Number"}
                                editable={true}
                                clearText={() => {
                                    this.clearText("phoneNumber");
                                }}
                            />
                        </View>
                        <Text style={{...CommonStyles.styles.blueLinkText, marginBottom: 28}}
                              onPress={() => {
                                  this.sendResponse(true);
                              }}>
                            Skip for now
                        </Text>
                        <PrimaryButton
                            testId="continue"
                            disabled={this.state.hasPhoneNumberError === null || this.state.hasPhoneNumberError}
                            onPress={() => {
                                this.sendResponse(false);
                            }}
                            // ref={btn => {
                            //     this.form.submitBtn = btn;
                            // }}
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
        position: "relative",
        zIndex: 2,
        paddingTop: isIphoneX() ? 50 : 44,
        paddingLeft: 22,
    },
    textBox: {
        alignItems: "center",
        paddingTop: 100,
        paddingHorizontal: 32,
        // marginBottom: 40,
        flex: 1,
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120,
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: "center",
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: "center",
        color: Colors.colors.mediumContrast,
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: "transparent",
    },
});

export default connectAuth()(EnterPhoneScreen);
