import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Container, Content, Header, Text } from "native-base";
import { Screens } from "../../constants/Screens";
import {
  addTestID,
  AlertUtil,
  AlfieLoader,
  Colors,
  CommonStyles,
  getHeaderHeight,
  isIphoneX,
  PrimaryButton,
  TextStyles,
} from "ch-mobile-shared";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";
import { SliderSearch } from "ch-mobile-shared/src/components/slider-search";
import BillingService from "../../services/Billing.service";
import { PAYEE } from "../../constants/CommonConstants";

const HEADER_SIZE = getHeaderHeight();

export default class ApptOtherInsuranceOptionsListScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.insuranceList = navigation.getParam("insuranceList", []);
    this.state = {
      isLoading: false,
      selectedInsurance: null,
      insuranceList: this.insuranceList.slice(5),
    };
  }

  /**
   * @function navigateToPaymentScreen
   * @description This method is used to navigate to payment screen
   */
  navigateToPaymentScreen = (payee) => {
    this.setState({ isLoading: false });
    if (payee === null)
      payee = PAYEE.TRANSACTIONAL;
    const { selectedInsurance } = this.state;
    this.props.navigation.replace(Screens.APPOINTMENT_ACTUAL_PRICE_SCREEN, {
      ...this.props.navigation.state.params,
      payee: payee,
      selectedInsurance,
    });
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
   * @function disconnect
   * @description This method is used to navigate back
   */
  backClicked = () => {
    this.props.navigation.goBack();
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

  /**
   * @function renderEmptyMessages
   * @description This method is used to render empty state
   */
  renderEmptyMessage = () => {
    let { searchQuery } = this.state;
    return (
      <View style={styles.emptyView}>
        <LottieView
          ref={animation => {
            this.animation = animation;
          }}
          style={styles.emptyAnim}
          resizeMode="cover"
          source={alfie}
          autoPlay={true}
          loop />
        <Text style={styles.emptyTextMain}>{searchQuery ? "No record found " : "No insurance"}</Text>
        {!searchQuery && (
          <Text style={styles.emptyTextDes}>No insurance available right now . If you’d like to learn more
            about
            insurance, reach out to your matchmaker or email at help@confidanthealth.com.' </Text>
        )}
      </View>
    );
  };

  /**
   * @function propagate
   * @description This method is used to propagate list
   */

  propagate = (data) => {
    this.setState({ filteredInsurance: data?.insuranceList });
  };

  render = () => {
    StatusBar.setBarStyle("dark-content", true);
    if (this.state.isLoading) {
      return (<AlfieLoader />);
    }

    let { insuranceList, selectedInsurance, filteredInsurance, searchQuery } = this.state;
    let renderInsuranceList = searchQuery ? filteredInsurance : insuranceList;

    return (
      <Container style={{ backgroundColor: Colors.colors.screenBG }}>
        <Header noShadow={true} transparent style={styles.paymentHeader}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <SliderSearch
            {...addTestID("insurance-header")}
            propagate={this.propagate}
            hideSearchIcon={false}
            options={{
              screenTitle: "",
              searchFieldPlaceholder: "Search Insurance",
              listItems: {
                insuranceList: insuranceList,
              },
              filter: (listItems, query) => {
                this.setState({ searchQuery: query });
                return {
                  insuranceList: listItems.insuranceList
                    .filter(insurance =>
                      insurance.name
                        .toLowerCase()
                        .includes(query.toLowerCase().trim()),
                    ),
                };
              },
              showBack: true,
              backClicked: this.backClicked,
              leftIcon: true,
            }}

          />
        </Header>
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32 }}>
          <View>
            <Text style={styles.mainHeading}>Select your {`\n`}
              insurance</Text>
            {renderInsuranceList?.length > 0 && (
              <Text style={styles.subText}>If you don’t know it’s ok to skip this.</Text>)}
            <View style={styles.itemList}>
              {renderInsuranceList?.length > 0 ? renderInsuranceList?.map(insurance => {
                return (
                  <TouchableWithoutFeedback onPress={() => {
                    this.updateInsuranceList(insurance);
                  }}>
                    <View
                      style={selectedInsurance?.name === insurance?.name ? [styles.singleInc, styles.selectedInsuranceOption] : styles.singleInc}>
                      <Text style={styles.name}>{insurance?.name}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                );
              }) : this.renderEmptyMessage()}
            </View>
          </View>
        </Content>
        <View style={styles.greBtn}>
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
  name: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.subTextM,
    color: Colors.colors.highContrast,
  },
  paymentHeader: {
    paddingTop: 15,
    paddingLeft: 24,
    paddingRight: 18,
    height: HEADER_SIZE,
  },
  backButton: {
    marginLeft: 18,
    width: 40,
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
    textAlign: "center",
    marginBottom: 8,
  },
  itemList: {
    paddingVertical: 32,
  },
  singleInc: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    padding: 24,
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
    // width: 40,
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
  emptyView: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyAnim: {
    width: "50%",
    // alignSelf: 'center',
    marginBottom: 30,
  },
  emptyTextMain: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.highContrast,
    alignSelf: "center",
    marginBottom: 8,
  },
  emptyTextDes: {
    alignSelf: "center",
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.mediumContrast,
    paddingLeft: 16,
    paddingRight: 16,
    textAlign: "center",
    marginBottom: 32,
  },
});
