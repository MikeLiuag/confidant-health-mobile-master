import React, { Component } from "react";
import { Image, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { Body, Button, Container, Content, Header, Left, Right, Text } from "native-base";
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
  PrimaryButton, RECURRING_SUBSCRIPTION_STATUS,
  TextStyles,
} from "ch-mobile-shared";
import { connectPayment } from "../../redux";
import { STRIPE_ERROR } from "../../constants/CommonConstants";
import BillingService from "../../services/Billing.service";
import Analytics from "@segment/analytics-react-native";
import AntIcons from "react-native-vector-icons/AntDesign";
import { AddPaymentCardModal } from "../../components/payment/AddPaymentCardModal";

const HEADER_SIZE = getHeaderHeight();

class SubscriptionPackageScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.appointment = navigation.getParam("appointment", null);
    this.screenRef = navigation.getParam("screenRef", null);
    this.subscriptions = navigation.getParam("subscriptions", null);
    this.getPatientSubscriptionPackage = navigation.getParam("getPatientSubscriptionPackage", null);

    this.state = {
      isLoading: false,
      selectedCardId: (this.props.payment?.cardsList && this.props.payment?.cardsList?.length > 0 && this.props.payment?.cardsList[0]?.cardId || "new_card") || null,
      subscriptionPackage: null,
      subscriptions: this.subscriptions,
    };
  }

  componentDidMount() {
    this.getSubscriptionPackage();
  }

  backClicked = () => {
    if (this.getPatientSubscriptionPackage !== null) {
      this.getPatientSubscriptionPackage();
    }
    this.props.navigation.goBack();
  };

  /**
   * @function addCard
   * @description This method is used to add card
   */

  addCard = async (creditCardInput) => {
    this.setState({ isLoading: true, cardModalOpen: false });
    let creditCardToken;
    try {
      creditCardToken = await BillingService.getStripeToken(creditCardInput);
      if (creditCardToken.error) {
        if (creditCardToken.error.message.includes("The card number is longer than the maximum supported" +
          " length of 16.")) {
          AlertUtil.showErrorMessage("This is not a valid stripe card");
        } else {
          AlertUtil.showErrorMessage(creditCardToken.error.message);
        }
        this.setState({ isLoading: false });
      } else {
        // Send a request to your server with the received credit card token
        let paymentResponse = await BillingService.addCard(creditCardToken.id);
        if (paymentResponse.errors) {
          AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
        } else {
          this.setState({
            selectedCardId: paymentResponse.cardId,
            walletSelected: false,
          });
          this.props.fetchCardsList();
          await Analytics.identify(this.props.auth?.meta?.userId, {
            hasCardAddedSuccessfully: true,
          });
          AlertUtil.showSuccessMessage("Card added successfully");
        }
        this.setState({ isLoading: false });
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(STRIPE_ERROR);
      this.setState({ isLoading: false });
    }

  };


  getSubscriptionPackage = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await BillingService.getSubscriptionPackages();
      console.log("response of subscription package", response);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {

        console.log("response.recurringSubscriptionPackage[0]", response.recurringSubscriptionPackage[0]);
        this.setState({ isLoading: false, subscriptionPackage: response.recurringSubscriptionPackage[0] });

      }

    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  subscribePackage = async () => {
    try {
      const { subscriptionPackage, selectedCardId } = this.state;
      this.setState({ isLoading: true });
      const payLoad = {
        paymentToken: selectedCardId,
        subscriptionPackageId: subscriptionPackage?.id,
      };
      const response = await BillingService.subscribePackage(payLoad);
      console.log("response of subscribePackage ", response);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        if (this.screenRef === "sessionReward") {
          this.props.navigation.navigate(Screens.ALFIE_QUESTION_SCREEN);
        } else {
          this.backClicked();
        }
        this.setState({ isLoading: false });
      }
    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  unSubscribePackage = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await BillingService.updateSubscriptionPackage(RECURRING_SUBSCRIPTION_STATUS.CANCELLED);
      console.log("response of unsubscribePackage ", response);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        console.log("package unsubscribed");
        if (this.screenRef === "sessionReward") {
          this.props.navigation.navigate(Screens.ALFIE_QUESTION_SCREEN);

        } else {
          this.backClicked();
        }
        this.setState({ isLoading: false });
      }
    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  render = () => {
    // StatusBar.setBackgroundColor('transparent', true);
    const { isLoading, subscriptionPackage, subscriptions } = this.state;
    StatusBar.setBarStyle("dark-content", true);
    if (isLoading) {
      return (<AlfieLoader />);
    }
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
          {/*<Right>*/}
          {/*  <Button*/}
          {/*    transparent>*/}
          {/*    <AntIcons size={22} color={Colors.colors.primaryIcon} name="infocirlceo" />*/}
          {/*  </Button>*/}
          {/*</Right>*/}
        </Header>
        <Content showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{ ...styles.mainHeading, color: subscriptions?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE?Colors.colors.successText:Colors.colors.highContrast,}}>{subscriptions?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE ? "You're Currently Subscribed" : "Subscribe & save"}</Text>
            <Text style={styles.subText}>{subscriptionPackage?.name}</Text>
            {/*<Text style={styles.providerName}>{this.selectedProvider.name}</Text>*/}
            <View style={styles.priceWrapper}>
              <Text style={styles.priceText}>${subscriptionPackage?.amount ? subscriptionPackage.amount : 0}</Text>
              <Text style={styles.priceSubText}>per month</Text>
            </View>


            <Text style={styles.bulletHead}>{subscriptions?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE
                ? 'You\'re saving 60% and getting unlimited appointments.'
              : subscriptionPackage?.description}</Text>
            {subscriptionPackage?.benefits.length > 0 && subscriptionPackage.benefits.map(benefit => {
              return (
                <View style={styles.singleBullet}>
                  <AntIcons size={22} color={Colors.colors.successIcon} name="check" />
                  <Text style={styles.bulletText}>{benefit}</Text>
                </View>
              );
            })}
          </View>
          {subscriptions?.status !== RECURRING_SUBSCRIPTION_STATUS.ACTIVE &&
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={{
                justifyContent: "center",
              }}
              style={styles.fundTypeList}>
              {
                this.props.payment.cardsList.map(card =>

                  <Button
                    onPress={() => {
                      this.setState({
                        selectedCardId: card.cardId,
                        walletSelected: false,
                      });
                    }}
                    style={card.cardId === this.state.selectedCardId ? styles.masterBtnSelected : styles.masterBtn}
                    transparent>
                    <Text uppercase={false} style={styles.masterText}>Saved card</Text>
                    <View style={styles.masterNumWrap}>
                      <Image
                        style={styles.masterImg}
                        source={card.brand === "Visa" ? require("../../assets/images/visa.png") : require("../../assets/images/master.png")}

                      />
                      <Text style={styles.masterNum}>{card.last4}</Text>
                    </View>
                  </Button>,
                )
              }
              <Button
                onPress={() => {
                  this.setState({
                    selectedCardId: "new_card",
                  });
                }}
                style={this.state.selectedCardId === "new_card" ? {
                  ...styles.newCardBtn,
                  borderWidth: 1,
                  borderColor: Colors.colors.secondaryText,
                } : styles.newCardBtn} transparent>

                <Text uppercase={false} style={styles.newCardText}>New card</Text>
              </Button>
            </ScrollView>
          }
        </Content>

        <View style={styles.greBtn}>
          {subscriptions?.status !== RECURRING_SUBSCRIPTION_STATUS.ACTIVE &&
            <TouchableOpacity style={styles.affordBtn} onPress={() => {
              if (this.screenRef === "sessionReward") {
                this.props.navigation.navigate(Screens.ALFIE_QUESTION_SCREEN);

              } else {
                this.backClicked();
              }
            }}>
              <Text style={styles.affordText}>I’m not interested</Text>
            </TouchableOpacity>
          }
          <PrimaryButton
            text={subscriptions?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE ? "Pause Subscription" : "Subscribe Now"}
            onPress={() => {
              console.log("hit", this.state.selectedCardId === "new_card");
              if (this.state.selectedCardId === "new_card") {
                this.setState({
                  cardModalOpen: true,
                });
              } else {
                if (subscriptions?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE) {
                  console.log("if");
                  this.unSubscribePackage();
                } else {
                  console.log("else");
                  this.subscribePackage();
                }
                // this.props.navigation.navigate(Screens.ALFIE_QUESTION_SCREEN);
              }
            }}
          />
        </View>
        <AddPaymentCardModal
          isOpen={this.state.cardModalOpen}
          onClose={() => {
            this.setState({
              cardModalOpen: false,
            });
          }}
          onSubmit={this.addCard}
        />
      </Container>
    );
  };
}


const styles = StyleSheet.create({
  paymentHeader: {
    paddingTop: 15,
    paddingLeft: 0,
    paddingRight: 24,
    height: HEADER_SIZE,
  },
  backButton: {
    marginLeft: 18,
    width: 40,
  },
  mainHeading: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH1,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  priceWrapper: {
    width: 250,
    alignSelf: "center",
    position: "relative",
    marginBottom: 32,
  },
  priceText: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.primaryText,
    fontSize: 98,
    lineHeight: 134,
    textAlign: "center",
    marginVertical: 16,
  },
  priceSubText: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.subTextL,
    color: Colors.colors.primaryText,
    position: "absolute",
    right: 25,
    bottom: 20,
  },
  bulletHead: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH4,
    color: Colors.colors.highContrast,
    marginBottom: 16,
  },
  singleBullet: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bulletText: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
    paddingLeft: 16,
  },

  subText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.mediumContrast,
    textAlign: "center",
  },
  providerName: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.highContrast,
    textAlign: "center",
    marginBottom: 24,
  },
  fundTypeList: {
    paddingTop: 80,
    paddingBottom: 34,
    flexDirection: "row",
    paddingLeft: 24,
  },
  applePayBtn: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 88,
    height: 78,
    justifyContent: "center",
  },
  applePayImg: {
    width: 54,
    height: 23,
  },
  myWalletBtn: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 102,
    height: 78,
    flexDirection: "column",
    justifyContent: "center",
  },
  myWalletBtnSelected: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 102,
    height: 78,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: Colors.colors.secondaryText,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
  },
  myWalletText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.secondaryText,
  },
  myWalletValue: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.highContrast,
  },
  masterBtn: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 114,
    height: 78,
    flexDirection: "column",
    borderWidth: 1,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
  },
  masterBtnSelected: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 114,
    height: 78,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: Colors.colors.secondaryText,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
  },
  masterText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.highContrast,
  },
  masterNumWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  masterImg: {
    width: 16,
    height: 10,
  },
  masterNum: {
    ...TextStyles.mediaTexts.manropeMedium,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.lowContrast,
    marginLeft: 4,
  },
  newCardBtn: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 8,
    marginRight: 8,
    width: 98,
    height: 78,
    justifyContent: "center",
  },
  newCardText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.captionText,
    color: Colors.colors.highContrast,
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
    paddingHorizontal: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
  },
});


export default connectPayment()(SubscriptionPackageScreen);
