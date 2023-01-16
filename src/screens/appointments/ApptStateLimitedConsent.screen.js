import React, { Component } from "react";
import { FlatList, Platform, StatusBar, StyleSheet } from "react-native";
import { Body, Button, Container, Content, Header, Left, Right, Text, View } from "native-base";
import {
  addTestID,
  Colors,
  CommonStyles,
  getHeaderHeight,
  isIphoneX, PrimaryButton,
  SecondaryButton,
  TextStyles,
} from "ch-mobile-shared";
import EntypoIcons from "react-native-vector-icons/Entypo";
import { Screens } from "../../constants/Screens";

const HEADER_SIZE = getHeaderHeight();

export default class ApptStateLimitedConsentScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.selectedService = navigation.getParam("selectedService", null);
    this.selectedSchedule = navigation.getParam("selectedSchedule", null);
    this.stateConsent = navigation.getParam("stateConsent", false);
    this.returnScreenName = navigation.getParam("returnScreenName", null);
    this.servicesOperatingStates = this.selectedService?.operatingStates;
    this.state = {
      availableForAppointment : true
    };
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };


  /**
   * @function navigateToApptScreen
   * @description This method is used to navigate to appointment detail screen.
   */
  navigateToApptScreen = () => {
    if (this.returnScreenName === Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN) {
      this.props.navigation.replace(Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN, {
        ...this.props.navigation.state.params,
        selectedProvider: this.selectedProvider,
        selectedService: this.selectedService,
        selectedSchedule: this.selectedSchedule,
        stateConsent: true
      });
    } else if (this.returnScreenName === Screens.NEW_APPT_DETAILS_SCREEN) {
      this.props.navigation.replace(Screens.NEW_APPT_DETAILS_SCREEN, {
        ...this.props.navigation.state.params,
        selectedProvider: this.selectedProvider,
        selectedService: this.selectedService,
        selectedSchedule: this.selectedSchedule,
        stateConsent: true
      });
    }
  };

  /**
   * @function navigateToNextScreen
   * @description This method is used to navigate to next screen with condition.
   */

  navigateToNextScreen = () => {
    const {availableForAppointment} = this.state;
    if(!availableForAppointment) {
      this.props.navigation.navigate(Screens.REQUEST_APPT_STATE_CONSENT_REJECTION_SCREEN);
    }else{
      this.navigateToApptScreen()
    }
  };

  /**
   * @function updateAvailability
   * @description This method is used to update the availability on yes and no buttons.
   */

  updateAvailability = () =>{
    const {availableForAppointment} = this.state;
    this.setState({availableForAppointment : !availableForAppointment});
  }

  render() {
    StatusBar.setBarStyle("dark-content", true);
    const {availableForAppointment} = this.state;
    this.servicesOperatingStates=this.servicesOperatingStates.sort()
    return (
      <Container style={{ backgroundColor: Colors.colors.screenBG }}>
        <Header noShadow={false} transparent style={styles.header}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <Left>
            <Button
              {...addTestID("back")}
              onPress={this.backClicked}
              transparent
              style={styles.backButton}>
              <EntypoIcons
                size={30}
                color={Colors.colors.mainBlue}
                name="chevron-thin-left"
              />
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content showsVerticalScrollIndicator={false}>
          <View style={styles.textBox}>
            <Text style={styles.magicMainText}>
              Clinicians can only practice where they are licensed.
            </Text>
            <Text style={styles.magicSubText}>
              You’ll have to be physically present in the state at the time of
              the appointment, even though it’s delivered via telehealth.
            </Text>
          </View>
          <View style={styles.questionWrapper}>
            <Text style={styles.magicSubTextDark}>
              Will you be in one of the following states at the time of your appointment?
            </Text>
            <FlatList
              data={this.servicesOperatingStates}
              renderItem={({ item }) => <Text style={styles.statesList}>{"\u2B24" + " "}{item}</Text>}
            />
            {/*<View style={styles.optionList}>*/}
            {/*  <View style={styles.singleBtn}>*/}
            {/*    <SecondaryButton*/}
            {/*      bgColor={Colors.colors.primaryColorBG}*/}
            {/*      textColor={Colors.colors.primaryText}*/}
            {/*      key={1}*/}
            {/*      onPress={() => {*/}
            {/*        this.props.navigation.navigate(Screens.REQUEST_APPT_STATE_CONSENT_REJECTION_SCREEN);*/}
            {/*      }}*/}
            {/*      text={"No"}*/}
            {/*    />*/}
            {/*  </View>*/}
            {/*  <View style={styles.singleBtn}>*/}
            {/*    <SecondaryButton*/}
            {/*      bgColor={Colors.colors.primaryColorBG}*/}
            {/*      textColor={Colors.colors.primaryText}*/}
            {/*      key={1}*/}
            {/*      onPress={() => this.navigateToNextScreen()}*/}
            {/*      text={"Yes"}*/}
            {/*    />*/}
            {/*  </View>*/}
            {/*</View>*/}
            <View style={styles.optionList}>
              <View style={styles.singleBtn}>
                <SecondaryButton
                    bgColor={Colors.colors.primaryColorBG}
                    textColor={Colors.colors.primaryText}
                    {...addTestID('list item - ')}
                    inactiveBtn={availableForAppointment}
                    key={1}
                    onPress={() => {
                      this.updateAvailability()
                    }}
                    text={'No'}
                />
              </View>
              <View style={styles.singleBtn}>
                <SecondaryButton
                    bgColor={Colors.colors.primaryColorBG}
                    textColor={Colors.colors.primaryText}
                    {...addTestID('list item - ')}
                    inactiveBtn={!availableForAppointment}
                    key={1}
                    onPress={() => {
                      this.updateAvailability();
                    }}
                    text={'Yes'}
                />
              </View>
            </View>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <PrimaryButton
              bgColor={Colors.colors.primaryText}
              textColor={Colors.colors.whiteColor}
              arrowIcon={false}
              testId="continue"
              onPress={() => {
                this.navigateToNextScreen();
              }}
              text="Continue"
          />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 15,
    paddingLeft: 0,
    paddingRight: 0,
    height: HEADER_SIZE,
    ...CommonStyles.styles.headerShadow,
  },
  textBox: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  magicMainText: {
    ...TextStyles.mediaTexts.serifProExtraBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.highContrast,
    marginBottom: 8,
  },
  magicSubText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextL,
    marginBottom: 40,
    textAlign: "left",
    color: Colors.colors.mediumContrast,
  },
  questionWrapper: {
    backgroundColor: Colors.colors.white04,
    borderTopWidth: 1,
    borderTopColor: Colors.colors.borderColor,
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  statesList: {
    padding: 8,
  },
  magicSubTextDark: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
    marginBottom: 24,
  },
  optionList: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    marginTop: 20,
  },
  singleBtn: {
    width: "48%",
  },
  greBtn: {
    padding: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    ...CommonStyles.styles.stickyShadow,
  },
});
