import React, { Component } from "react";
import { StatusBar, StyleSheet, Dimensions, Image } from "react-native";
import { Container, Content, Text, View, Icon } from "native-base";
import {
  addTestID,
  isIphoneX,
  Colors,
  PrimaryButton,
  TextStyles,
  SecondaryButton,
  AlertUtil,
  BackButton,
} from "ch-mobile-shared";
import SplashScreen from "react-native-splash-screen";
import { Screens } from "../../constants/Screens";
import ProfileService from "../../services/Profile.service";
import { connectProfile } from "../../redux";
import Loader from "../../components/Loader";
import { PROVIDER_DESIGNATIONS } from "../../constants/CommonConstants";
import { NavigationActions, StackActions } from "react-navigation";

const windowHeight = Dimensions.get("window").height;

export class ExclusionCriteriaScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    SplashScreen.hide();
    super(props);
    const { navigation } = this.props;
    this.updateProfileRequest = navigation.getParam("updateProfileRequest", null);
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.state = {
      isLoading: false,
      exclusionMet: false,
      inclusionMet: false,
      withDrawingInclusionMet: false,
      withDrawingExclusionMet: false,
    };
  }

  updateCheck = (exclusion, suicidalCriteria) => {
    if (suicidalCriteria) {
      const { exclusionMet, inclusionMet } = this.state;
      const firstAttempt = !exclusionMet && !inclusionMet;

      this.setState({
        exclusionMet: firstAttempt ? (exclusion ? !exclusionMet : exclusionMet) : !exclusionMet,
        inclusionMet: firstAttempt ? (exclusion ? inclusionMet : !inclusionMet) : !inclusionMet,
      });
    } else {
      const { withDrawingExclusionMet, withDrawingInclusionMet } = this.state;
      const firstAttempt = !withDrawingExclusionMet && !withDrawingInclusionMet;
      this.setState({
        withDrawingExclusionMet: firstAttempt ? (exclusion ? !withDrawingExclusionMet : withDrawingExclusionMet) : !withDrawingExclusionMet,
        withDrawingInclusionMet: firstAttempt ? (exclusion ? withDrawingInclusionMet : !withDrawingInclusionMet) : !withDrawingInclusionMet,
      });
    }
  };


  navigateToNextScreen = async () => {
    const { exclusionMet, withDrawingExclusionMet } = this.state;

    if (exclusionMet || withDrawingExclusionMet) {
      this.props.navigation.navigate(Screens.EMERGENCY_SERVICE_SCREEN);
    } else {
      if (this.updateProfileRequest != null) {
        this.setState({ isLoading: true });
        try {
          const response = await ProfileService.updateProfile(this.updateProfileRequest);
          if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({ isLoading: false });
          } else {
            const { designation } = this.selectedProvider;
            AlertUtil.showSuccessMessage("Profile updated successfully");
            this.props.fetchProfile();
            this.setState({ isLoading: false });
            if (designation === PROVIDER_DESIGNATIONS.PRESCRIBER ||
              designation === PROVIDER_DESIGNATIONS.NURSE_PRACTITIONER ||
              designation === PROVIDER_DESIGNATIONS.PSYCHIATRIC_NURSE_PRACTITIONER
            ) {
              this.props.navigation.replace(Screens.EXCLUSION_CRITERIA_FOR_CLINICIANS_SCREEN, this.props.navigation.state.params);
            } else {
              const resetAction = StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: Screens.APPOINTMENT_PAYMENT_OPTIONS_SCREEN, params: {
                      ...this.props.navigation.state.params,
                    },
                  }),
                ],
              });
              this.props.navigation.dispatch(resetAction);
            }
          }
        } catch (e) {
          console.log(e);
          AlertUtil.showErrorMessage(e);
          this.setState({ isLoading: false });
        }
      } else {
        this.props.navigation.navigate(Screens.ENTER_NAME_SCREEN, {
          ...this.props.navigation.state.params,
          suicidal: false,
        });
      }
    }
  };

  backClicked = () => {
    this.props.navigation.goBack();
  };

  renderCriteria = (exclusion, suicidalCriteria) => {
    const itemSelected = suicidalCriteria ? (exclusion ? this.state.exclusionMet : this.state.inclusionMet) : (exclusion ? this.state.withDrawingExclusionMet : this.state.withDrawingInclusionMet);
    return <SecondaryButton
      bgColor={Colors.colors.primaryColorBG}
      textColor={Colors.colors.primaryText}
      {...addTestID("list item - " + exclusion)}
      inactiveBtn={!itemSelected}
      key={exclusion ? 1 : 2}
      onPress={() => this.updateCheck(exclusion, suicidalCriteria)}
      text={exclusion ? "Yes" : "No"}
    />;
  };


  render() {
    if (this.state.isLoading) {
      return <Loader />;
    }
    StatusBar.setBarStyle("dark-content", true);
    const { exclusionMet, inclusionMet, withDrawingExclusionMet, withDrawingInclusionMet } = this.state;
    const isDisabled = (!exclusionMet && !inclusionMet) || (inclusionMet && (!withDrawingExclusionMet && !withDrawingInclusionMet));
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
              source={require("../../assets/images/911-new.png")} />
            <Text
              style={styles.magicMainText}>
              Confidant is not an {"\n"}emergency service.
            </Text>
            <Text
              style={styles.magicSubText}>
              Information shared in the application is not always received in real time.
            </Text>
            <Text style={styles.magicSubTextPink}>
              If you are experiencing an emergency, {"\n"}please call 911.
            </Text>
            <Text style={styles.magicSubText}>
              If you are experiencing a mental  {"\n"}
              health emergency call<Text style={{ ...TextStyles.mediaTexts.manropeBold }}> 988 </Text>or text  {"\n"}
              Crisis Text Line at<Text style={{ ...TextStyles.mediaTexts.manropeBold }}> 741-741 </Text>to connect  {"\n"}
              with someone who can help right  {"\n"}
              away.
            </Text>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <PrimaryButton
            arrowIcon={false}
            testId="continue"
            onPress={() => {
              this.navigateToNextScreen();
            }}
            text="Continue"
            // disabled={isDisabled}
          />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  backButtonWrapper: {
    position: "relative",
    zIndex: 2,
    paddingTop: isIphoneX() ? 50 : 44,
    paddingLeft: 22,
  },
  textBox: {
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
  },
  signInIcon: {
    marginBottom: 32,
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
    ...TextStyles.mediaTexts.bodyTextM,
    marginBottom: 16,
    textAlign: "center",
    color: Colors.colors.mediumContrast,
  },
  magicSubTextPink: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.bodyTextM,
    marginBottom: 16,
    textAlign: "center",
    color: Colors.colors.secondaryText,
  },
  questionWrapper: {
    backgroundColor: Colors.colors.white04,
    borderTopWidth: 1,
    borderTopColor: Colors.colors.borderColor,
    paddingTop: 40,
    paddingLeft: 24,
    paddingRight: 24,
    minHeight: windowHeight - 600,
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
  },
  singleBtn: {
    width: "48%",
  },
  greBtn: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: isIphoneX() ? 34 : 24,
  },
  listMainWrapper: {},
  listInner: {
    flexDirection: "row",
    paddingLeft: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  listText: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
    textTransform: "capitalize",
    paddingLeft: 14,
  },
  bulletIcon: {
    color: Colors.colors.mainPink,
    fontSize: 22,
  },

});
export default connectProfile()(ExclusionCriteriaScreen);
