import React, { Component } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { Button, Left, Container, Content, Header, Text } from "native-base";
import { addTestID, AlertUtil, isIphoneX, getHeaderHeight } from "ch-mobile-shared";
import GradientButton from "../../components/GradientButton";
import { STRIPE_ERROR } from "../../constants/CommonConstants";
import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from "react-native-linear-gradient";
import { Screens } from "../../constants/Screens";
import CreditCardsListComponent from "../../components/payment/CreditCardsListComponent";
import { connectPayment } from "../../redux";
import BillingService from "../../services/Billing.service";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class GenericPaymentScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.paymentDetails = navigation.getParam("paymentDetails", null);
    this.successCallback = navigation.getParam("onPaymentSuccess", null);
    this.overridePaymentCallback = navigation.getParam("overridePaymentCallback", null);
    this.paymentLock = false;

    this.state = {
      isLoading: false,
      cardId: null,
      payNow: false,
      processingPayment: false,
    };
  }

  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
    if (prevProps.payment.isLoading && !this.props.payment.isLoading) {
      if (this.props.payment.cardsList && this.props.payment.cardsList.length > 0) {
        this.showPayNowButton(null, this.props.payment.cardsList[0].cardId);
      }
    }
  }

  navigateBack = () => {
    this.props.navigation.goBack();
  };

  cardListScreen = (showSection = false) => {
    this.props.navigation.navigate(Screens.CARD_LIST_SCREEN, {
      showDeleteSection: showSection,
      onSuccess: this.overridePaymentCallback ? this.navigateToOnAppSubscriptionPayment : this.navigateToOnPostSessionContribution,
      amount: this.paymentDetails?.amount,
      type: this.paymentDetails?.paymentType,
      reference: this.paymentDetails?.reference ? this.paymentDetails?.reference : this.paymentDetails?.paymentType,
    });
  };

  addCardScreen = () => {
    this.props.navigation.navigate(Screens.PAYMENT_SCREEN, {
      showAddCardScreen: true,
      onSuccess: this.overridePaymentCallback ? this.navigateToOnAppSubscriptionPayment : this.navigateToOnPostSessionContribution,
      amount: this.paymentDetails?.amount,
      type: this.paymentDetails?.paymentType,
      reference: this.paymentDetails?.reference ? this.paymentDetails?.reference : this.paymentDetails?.paymentType,
    });
  };

  navigateToOnAppSubscriptionPayment = (chargeId, onPaymentSuccess, onPaymentError) => {
    if(this.overridePaymentCallback) {
      this.overridePaymentCallback(chargeId, onPaymentSuccess, onPaymentError);
    }
    this.navigateBack();
  };

  navigateToOnPostSessionContribution = (chargeId) => {
    if (this.successCallback) {
      this.successCallback(chargeId);
    }
    this.navigateBack();
  };

  payBill = async () => {
    if (this.paymentLock) {
      return;
    }
    this.paymentLock = true;
    try {
      this.setState({ isLoading: true, payNow: false, processingPayment: true });
      if (this.overridePaymentCallback) {
        this.overridePaymentCallback(this.state.cardId, () => {
          this.props.navigation.goBack();
        }, (errorMsg) => {
          AlertUtil.showErrorMessage(errorMsg);
          this.setState({ isLoading: false, payNow: true, processingPayment: false });
        });
      } else {
        // Create a credit card token
        const payload = {
          amount: this.paymentDetails.amount,
          paymentType: this.paymentDetails.paymentType,
          paymentToken: this.state.cardId,
          reference: this.paymentDetails.channelUrl ? this.paymentDetails.channelUrl : this.paymentDetails.reference,
        };
        const paymentResponse = await BillingService.deductGenericCardPayment(payload);
        if (paymentResponse.errors) {
          console.log(paymentResponse.errors);
          AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
          this.setState({ isLoading: false, payNow: false, processingPayment: false });
        } else {
          //Analytics.track("Payment type " + this.paymentDetails.paymentType + " captured via card", payload);
          AlertUtil.showSuccessMessage("Payment Successful");
          this.setState({ isLoading: false, payNow: false, processingPayment: true });
          const stripeChargeId = paymentResponse.chargeId;
          this.navigateToOnPostSessionContribution(stripeChargeId);
        }
      }

    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(e);
      this.setState({ isLoading: false, payNow: true, processingPayment: false });
    }
    this.paymentLock = false;

  };

  showPayNowButton = (appointmentId, cardId) => {
    this.setState({ payNow: true, appointmentId: appointmentId, cardId: cardId });
  };

  payFromWallet = async () => {
    if (this.paymentLock) {
      return;
    }
    this.paymentLock = true;
    try {

      // Create a credit card token
      this.setState({ isLoading: true, processingPayment: true });
      console.log("Starting payment for type - " + this.paymentDetails.title + " - via wallet");
      const payload = {
        amount: this.paymentDetails.amount,
        paymentType: this.paymentDetails.paymentType,
        reference: this.paymentDetails.channelUrl ? this.paymentDetails.channelUrl : this.paymentDetails.reference,
        metaData: {
          type: this.paymentDetails.title,
          amount: this.paymentDetails.amount,
          groupName: this.paymentDetails.subTitle,
        },
      };
      const walletResponse = await BillingService.deductGenericWalletPayment(payload);
      console.log("RESPONSE FROM SERVER");
      console.log(walletResponse);
      if (walletResponse.errors) {
        console.log(walletResponse.errors);
        AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
        this.setState({ isLoading: false, processingPayment: true });
      } else {
        //Analytics.track("Payment type " + this.paymentDetails.paymentType + " captured via wallet", payload);
        AlertUtil.showSuccessMessage("Payment successful");
        this.setState({ isLoading: false, processingPayment: true });
        this.navigateToOnPostSessionContribution(null);
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(STRIPE_ERROR);
      this.setState({ isLoading: false, payNow: false, processingPayment: false });
    }
    this.paymentLock = false;

  };

  async componentDidMount(): void {
    await Analytics.screen(
        'Generic Payment Screen'
    );
    this.payNowSub = this.props.navigation.addListener(
      "willBlur",
      payload => {
        this.setState({ payNow: false });
      },
    );
    this.props.fetchCardsList();
    this.props.fetchWalletSilently();

  }

  componentWillUnmount = () => {
    if (this.payNowSub) {
      this.payNowSub.remove();
    }
  };

  render() {
    // StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setBarStyle("dark-content", true);
    const wallet = this.props.payment.wallet;

    return (
      <Container>
        <LinearGradient
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          colors={["#fff", "#fff", "#f7f9ff"]}
          style={{ flex: 1 }}
        >
          <Header transparent style={styles.header}>
            <StatusBar
              backgroundColor="transparent"
              barStyle="dark-content"
              translucent
            />
            <Left>
              <Button
                onPress={() => this.navigateBack()}
                transparent
                style={styles.backButton}>
                <Icon name="angle-left" size={32} color="#3fb2fe" />
              </Button>
            </Left>
          </Header>
          <Content>
            <Text style={styles.paymentTitle}>{this.paymentDetails.title}</Text>
            <Text style={styles.costValue}>${this.paymentDetails.amount}</Text>
            <Text style={styles.costText}>{this.paymentDetails.subTitle}</Text>


            {/*<View style={styles.greBtn}>*/}
            {/*<Text style={styles.insufficientText}>Insufficient funds</Text>*/}
            {/*<GradientButton*/}
            {/*onPress={()=>{*/}
            {/*this.props.navigation.navigate(Screens.ADD_FUNDS_SCREEN);*/}
            {/*}}*/}
            {/*text="Add Funds"*/}
            {/*/>*/}
            {/*</View>*/}


            <CreditCardsListComponent
              addCard={this.addCardScreen}
              cardList={this.cardListScreen}
              cardId={this.state.cardId}
              showPayNowButton={this.showPayNowButton}
              cardListData={this.props.payment.cardsList}
              isLoading={this.props.payment.isLoading || this.state.isLoading}

            />

          </Content>
          {/*<Button transparent style={styles.detailsBtn}*/}
          {/*onPress={() => {*/}
          {/*this.props.navigation.navigate(Screens.INVOICE_SCREEN, {*/}
          {/*serviceCost: this.appointment.serviceCost,*/}
          {/*});*/}
          {/*}}>*/}
          {/*<Text style={styles.detailsText} uppercase={false}>See Session Details</Text>*/}
          {/*</Button>*/}
          {this.props.payment.cardsList.length < 1 ?
            <View style={styles.greBtn}>
              <View style={styles.lockRow}>
                <Icon name="lock" size={25} color="#b3bec9" />
                <Text style={styles.lockText}>Your Personal Information is Always Kept Secured</Text>
              </View>
              <GradientButton
                testId="add-payment-method"
                onPress={() => this.addCardScreen()}
                text="Add payment method"
              />
            </View>
            : null}
          {this.props.payment.cardsList.length > 0 && this.state.payNow ?

            <View
              {...addTestID("Pay-with-a-card")}
              style={styles.greBtn}>
              <View style={styles.lockRow}>
                <Icon name="lock" size={25} color="#b3bec9" />
                <Text style={styles.lockText}>Your Personal Information is Always Kept Secured</Text>
              </View>
              <GradientButton
                testId="pay-with-card"
                disabled={this.state.processingPayment}
                onPress={() => this.payBill()}
                text="Pay With A Card"
              />
            </View>
            : null}
          {this.paymentDetails.paymentType !== "APP_SUBSCRIPTIONS" && wallet.balance >= this.paymentDetails.amount ?
            <View style={styles.greBtn}>
              <GradientButton
                testId="pay-via-wallet"
                disabled={this.state.processingPayment}
                onPress={() => {
                  this.payFromWallet();
                }}
                text="Pay via wallet"
              />
            </View>
            : null
          }
        </LinearGradient>
      </Container>
    );
  };
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 15,
    paddingLeft: 3,
    borderBottomColor: "#fff",
    elevation: 0,
    justifyContent: "flex-start",
    height: HEADER_SIZE,
  },
  backButton: {
    marginLeft: 15,
    width: 35,
  },
  paymentTitle: {
    textAlign: "center",
    color: "#25345c",
    fontFamily: "Roboto-Regular",
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: 1,
    marginBottom: 35,
    paddingLeft: 40,
    width: "90%",
    paddingRight: 40,
    alignSelf: "center",
  },
  costValue: {
    color: "#77c70b",
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    fontSize: 48,
    textAlign: "center",
    lineHeight: 52,
    marginBottom: 16,
  },
  costText: {
    color: "#515d7d",
    fontFamily: "Roboto-Regular",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 12,
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 35,
  },
  cardBox: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  cardListHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodText: {
    color: "#25345c",
    fontFamily: "Roboto-Regular",
    lineHeight: 15,
    fontSize: 14,
    letterSpacing: 0.47,
    fontWeight: "500",
  },
  manageBtn: {
    marginRight: 0,
    paddingRight: 0,
  },
  manageText: {
    color: "#3fb2fe",
    fontSize: 14,
    letterSpacing: 0.3,
    fontFamily: "Roboto-Regular",
    fontWeight: "500",
    paddingRight: 0,
  },
  cardList: {},
  singleCard: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "rgba(0,0,0,0.07)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 17,
  },
  cardImg: {
    width: 38,
    height: 30,
  },
  cardDes: {
    flex: 2,
    paddingLeft: 24,
  },
  cardName: {
    color: "#25345c",
    fontFamily: "Roboto-Regular",
    lineHeight: 13,
    fontSize: 13,
    letterSpacing: 0.28,
    marginBottom: 4,
  },
  cardNum: {
    color: "#969fa8",
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: 0.28,
    fontFamily: "Roboto-Regular",
  },
  insufficientText: {
    color: "#969fa8",
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: 0.28,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  lockText: {
    color: "#969fa8",
    fontFamily: "Roboto-Regular",
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0,
    paddingLeft: 10,
  },
  detailsBtn: {
    alignSelf: "center",
    // marginBottom: 14,
  },
  detailsText: {
    color: "#3fb2fe",
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  greBtn: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
  },
});
export default connectPayment()(GenericPaymentScreen);
