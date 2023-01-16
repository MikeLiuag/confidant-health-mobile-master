import React from "react";
import { CreditCardInput } from "../../components/payment/react-native-credit-card-input";
import { Body, Button, Container, Content, Header, Left, Right, Text, Title, View } from "native-base";
import { Platform, StatusBar, StyleSheet } from "react-native";
import GradientButton from "../../components/GradientButton";
import BillingService from "../../services/Billing.service";
import Loader from "../../components/Loader";
import { addTestID, AlertUtil, getHeaderHeight, isIphoneX } from "ch-mobile-shared";
import { STRIPE_ERROR } from "../../constants/CommonConstants";
import Icon from "react-native-vector-icons/FontAwesome";
import { connectPayment } from "../../redux";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class PaymentCardScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.showAddCardScreen = navigation.getParam("showAddCardScreen", null);
    this.reference = navigation.getParam("reference", null);
    this.onSuccess = navigation.getParam("onSuccess", null);
    this.customAmount = navigation.getParam("amount", null);
    this.type = navigation.getParam("type", null);
    this.state = {
      submitted: false,
      error: null,
      cardData: { valid: false },
    };
  }


  /**
   * @function onSubmit
   * @description Handle stripe token & payment process .
   * @params creditCardInput
   */
  onSubmit = async (creditCardInput) => {
    this.setState({ isLoading: true });
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
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(STRIPE_ERROR);
      this.setState({ isLoading: false });
    }
    // Send a request to your server with the received credit card token
    let paymentResponse;
    if (!this.showAddCardScreen) {
      paymentResponse = await BillingService.chargeForAppointment(this.reference, creditCardToken.id);
    } else {
      paymentResponse = await BillingService.addCard(creditCardToken.id);
    }
    if (paymentResponse.errors) {
      AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      if (!this.showAddCardScreen) {
        AlertUtil.showSuccessMessage("Payment processed successfully");
        if (this.onPaymentSuccess) {
          this.onPaymentSuccess();
          this.props.navigation.goBack();
        }
      } else {
        AlertUtil.showSuccessMessage("Payment processed successfully");
        this.props.fetchCardsList();
        if (this.onSuccess) {
          await this.payViaCard(paymentResponse.cardId);
        } else {
          this.navigateBack();
        }
      }
    }
  };


  /**
   * @function payViaCard
   * @description This method is used to pay donation amount through selected card.
   * @params paymentType, paymentMeta
   */
  payViaCard = async (cardId) => {
    try {
      if (this.type === "APP_SUBSCRIPTIONS") {
        this.onSuccess(cardId, () => {
          this.props.navigation.goBack();
        }, (errorMsg) => {
          AlertUtil.showErrorMessage(errorMsg);
          this.setState({ isLoading: false, payNow: true, processingPayment: false });
        });
      } else if (this.type === "ADD_FUNDS") {
        this.onSuccess(cardId);
        this.navigateBack();
      } else {
        const payload = {
          amount: this.customAmount,
          paymentType: this.type,
          paymentToken: cardId,
          reference: this.reference,
        };
        const paymentResponse = await BillingService.deductGenericCardPayment(payload);
        if (paymentResponse.errors) {
          this.setState({ isLoading: false });
          AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
        } else {
          const stripeChargeId = paymentResponse.chargeId;
          //Analytics.track(`Payment type ${this.type} captured via card `, payload);
          if (this.onSuccess) {
            if (this.type === "SESSION_POST_PAYMENT") {
              this.onSuccess(stripeChargeId);
              this.navigateBack();
            } else {
              const prePaymentDetails = {
                amountPaid: this.customAmount, chargeId: stripeChargeId, paymentMethod: "Stripe",
              };
              this.navigateOnSuccess(prePaymentDetails);
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(STRIPE_ERROR);
      this.setState({ isLoading: false });
    }
  };

  navigateBack() {
    this.props.navigation.goBack();
  };

  navigateOnSuccess = (prePaymentDetails) => {
    this.navigateBack();
    this.onSuccess(prePaymentDetails);
  };

  render() {
    if (this.state.isLoading) {
      return <Loader />;

    }
    const { submitted, error } = this.props;
    return (
      <Container>
        <Header style={styles.chatHeader}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <Left>
            <Button
              {...addTestID("Back")}
              onPress={() => this.navigateBack()}
              transparent
              style={styles.backButton}>
              <Icon name="angle-left" size={32} color="#3fb2fe" />
            </Button>
          </Left>
          <Body>
            <Title style={styles.headerText}>Add New Card</Title>
          </Body>
          <Right />
        </Header>
        <Content style={{ paddingLeft: 30, paddingRight: 30 }}>
          <CreditCardInput
            {...addTestID("CVC-input")}
            // autoFocus
            requiresName
            requiresCVC
            requiresPostalCode
            additionalInputsProps={{
              cvc: {
                textContentType: "password",
                secureTextEntry: true,
              },
            }}
            labelStyle={styles.label}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            validColor={"#515d7d"}
            invalidColor={"#e03c3c"}
            placeholderColor={"#fff"}
            cardScale={1}
            cardFontFamily="Roboto-Regular"
            allowScroll={false}
            onChange={(cardData) => {
              this.setState({ cardData });
            }

            } />
        </Content>
        <View
          {...addTestID("card-view")}
          style={styles.buttonWrapper}>
          <GradientButton
            testId="card"
            disabled={!this.state.cardData.valid || submitted}
            onPress={() => this.onSubmit(this.state.cardData)}
            text="Pay Now"
          />
          {error && (
            <View style={styles.alertWrapper}>
              <View style={styles.alertIconWrapper}>
                <Icon name="exclamation-circle" size={20} style={{ color: "#c22" }} />
              </View>
              <View style={styles.alertTextWrapper}>
                <Text style={styles.alertText}>{error}</Text>
              </View>
            </View>
          )}
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  chatHeader: {
    height: HEADER_SIZE,
    paddingLeft: 3,
    paddingRight: 0,
    elevation: 0,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    zIndex: 100,
  },
  backButton: {
    marginLeft: 15,
    width: 30,
  },
  headerRow: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerText: {
    color: "#25345c",
    fontFamily: "Roboto-Regular",
    fontSize: 18,
    letterSpacing: 0.3,
    fontWeight: "400",
    textAlign: "center",
  },
  pageTitle: {
    fontFamily: "Roboto-Regular",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.3,
    color: "#25345c",
    marginTop: 10,
    marginBottom: 40,
  },
  label: {
    color: "#b3bec9",
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "Roboto-Regular",
    textTransform: "capitalize",
  },
  inputContainer: {
    borderBottomColor: "#ebebeb",
    borderBottomWidth: 1,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Roboto-Regular",
    color: "#515d7d",
  },
  buttonWrapper: {
    padding: 24,
    paddingBottom: isIphoneX() ? 34 : 24,
  },
  saveBtn: {},
  alertTextWrapper: {
    flex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  alertIconWrapper: {
    padding: 5,
    flex: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  alertText: {
    color: "#c22",
    fontSize: 16,
    fontWeight: "400",
  },
  alertWrapper: {
    backgroundColor: "#ecb7b7",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 5,
    paddingVertical: 5,
    marginTop: 10,
  },
});

export default connectPayment()(PaymentCardScreen);
