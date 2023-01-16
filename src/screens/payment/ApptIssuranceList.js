import React, { Component } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Body, Container, Content, Header, Left, Right, Text } from "native-base";
import { Screens } from "../../constants/Screens";
import {
  addTestID,
  AlertUtil,
  AlfieLoader,
  BackButton,
  Colors,
  CommonStyles,
  getHeaderHeight,
  isIphoneX,
  PrimaryButton,
  TextStyles,
} from "ch-mobile-shared";
import BillingService from "../../services/Billing.service";
import { PAYEE, PAYMENT_OPTIONS, S3_BUCKET_LINK } from "../../constants/CommonConstants";
import wind from "deprecated-react-native-prop-types/DeprecatedLayoutPropTypes";

const HEADER_SIZE = getHeaderHeight();

export default class ApptInsuranceListScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      insuranceList: [],
      selectedInsurance: null,
    };
  }

  componentDidMount() {
    this.getInsuranceList();
  }

  getInsuranceList = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await BillingService.getInsuranceList();
      console.log(response);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        this.setState({ insuranceList: response, isLoading: false });
      }
    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  createPatientInsuranceProfile = async (insuranceId) => {
    try {
      this.setState({ isLoading: true });
      const response = await BillingService.createPatientInsuranceProfile(insuranceId);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        const response = await BillingService.getPatientInsuranceProfile();
        if (response.errors) {
          AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
          this.setState({ isLoading: false });
        } else {
          if (response.insuranceProfile?.byPassPaymentScreen && response.insuranceProfile?.supported) {
            this.navigateToPaymentScreen(PAYEE.INSURANCE);
          } else if (response.insuranceProfile?.id && response.insuranceProfile?.byPassPaymentScreen === false && response.insuranceProfile?.supported === false) {
            this.navigateToPaymentScreen(PAYEE.TRANSACTIONAL);
          }
        }
      }
    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  /**
   * @function backClicked
   * @description This method is used to navigate back
   */
  backClicked = () => {
    this.props.navigation.goBack();
  };

  /**
   * @function navigateToPaymentScreen
   * @description This method is used to navigate to payment screen
   */
  navigateToPaymentScreen = (payee) => {
    this.setState({ isLoading: false });
    if (payee === null)
      payee = PAYEE.TRANSACTIONAL;
    const { selectedInsurance } = this.state;
    this.props.navigation.navigate(Screens.APPOINTMENT_ACTUAL_PRICE_SCREEN, {
      ...this.props.navigation.state.params,
      payee: payee,
      selectedInsurance,
    });
  };

  /**
   * @function navigateToOtherInsuranceOptionsScreen
   * @description This method is used to navigate to other insurance options
   */
  navigateToOtherInsuranceOptionsScreen = () => {
    const { selectedInsurance, insuranceList } = this.state;
    if (selectedInsurance) {
      this.setState({ selectedInsurance: null });
    }
    this.props.navigation.navigate(Screens.APPOINTMENT_OTHER_INSURANCE_OPTIONS_LIST_SCREEN, {
      ...this.props.navigation.state.params,
      insuranceList,
    });
  };

  /**
   * @function updateInsuranceList
   * @description This method is used to update insurance list
   */
  updateInsuranceList = (selectedInsurance) => {
    const { insuranceList } = this.state;
    insuranceList.forEach(insurance => {
      insurance.isSelected = selectedInsurance.name === insurance.name;
    });
    this.setState({ insuranceList, selectedInsurance });
  };

  render = () => {
    StatusBar.setBarStyle("dark-content", true);
    if (this.state.isLoading) {
      return (<AlfieLoader />);
    }

    const { insuranceList, selectedInsurance } = this.state;
    return (
      <Container style={{ backgroundColor: Colors.colors.screenBG }}>
        <Header noShadow={true} transparent style={styles.paymentHeader}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <Left>
            <View style={styles.backButton}>
              <BackButton
                {...addTestID("back-btn")}
                onPress={this.backClicked}
              />
            </View>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32 }}>
          <View>
            <Image
                resizeMode={"contain"}
                source={require("../../assets/images/ApptInsurance-large.png")}
              style={styles.umbrIcon}
            />
            <Text style= {styles.mainHeading}>What insurance
              do you have?</Text>
            <Text style={styles.subText}>If you don’t know it’s ok to skip this.</Text>
            <View style={styles.itemList}>

              {insuranceList?.map((insurance, index) => {
                console.log(S3_BUCKET_LINK + insurance.insuranceLogo);
                if (index < 5) {
                  return (
                    <TouchableWithoutFeedback onPress={() => {
                      this.updateInsuranceList(insurance);
                    }}>
                      <View
                        style={selectedInsurance?.name === insurance?.name ? [styles.singleInc, styles.selectedInsuranceOption] : styles.singleInc}>
                        {insurance.insuranceLogo
                          ?
                          <Image
                            style={{...styles.incIcon,
                              width : (insurance.insuranceLogo.includes('cigna') || insurance.insuranceLogo.includes('bsbs_texas'))? 300 : 261,
                              height: (insurance.insuranceLogo.includes('cigna') || insurance.insuranceLogo.includes('bsbs_texas'))? 38 : 32
                            }}
                            resizeMode={"contain"}
                            source={{uri: S3_BUCKET_LINK + insurance.insuranceLogo}} />
                          :
                          <Text>{insurance.name}</Text>
                        }
                      </View>
                    </TouchableWithoutFeedback>
                  );
                } else {
                  return null;
                }
              })}
            </View>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <TouchableOpacity style={styles.affordBtn} onPress={() => {
            this.navigateToOtherInsuranceOptionsScreen();
          }}>
            <Text style={styles.affordText}>I have another insurance</Text>
          </TouchableOpacity>

          <PrimaryButton
            text="Continue"
            disabled={!selectedInsurance}
            onPress={() => {
              this.createPatientInsuranceProfile(selectedInsurance.id);
            }}
          />
        </View>
      </Container>
    );
  };
}


const styles = StyleSheet.create({
  paymentHeader: {
    paddingTop: 15,
    paddingLeft: 0,
    paddingRight: 0,
    height: HEADER_SIZE,
  },
  backButton: {
    marginLeft: 18,
    width: 40,
  },
  umbrIcon: {
    alignSelf: "center",
    width: 110,
    height: 110,
    marginBottom: 50
  },
  mainHeading: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.highContrast,
    textAlign: "center",
    marginBottom: 16,
  },
  subText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.mediumContrast,
    marginBottom: 8,
    textAlign: "center",
  },
  itemList: {
    paddingVertical: 32,
  },
  singleInc: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    // padding: 24,
    height: 80,
    justifyContent: "center",
    marginBottom: 8,
    alignItems: "center",
  },
  selectedItem: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.colors.secondaryText,
  },
  incIcon: {
    height: 32,
    width: 261
  },
  affordBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  affordText: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.linkTextM,
    color: Colors.colors.primaryText,
    textAlign: "center",
  },
  greBtn: {
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
  },
  selectedInsuranceOption: {
    borderWidth: 2,
    borderColor: Colors.colors.mainBlue,
    backgroundColor: Colors.colors.primaryColorBG,
  },
});
