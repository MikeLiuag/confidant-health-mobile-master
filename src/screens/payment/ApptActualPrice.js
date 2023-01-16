import React, { Component } from "react";
import { BackHandler, Image, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
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
  PrimaryButton,
  TextStyles,
} from "ch-mobile-shared";
import { connectPayment } from "../../redux";
import { AddPaymentCardModal } from "../../components/payment/AddPaymentCardModal";
import {
  APPOINTMENT_STATUS,
  PAYEE,
  PAYMENT_OPTIONS,
  SEGMENT_EVENT,
  STRIPE_ERROR,
} from "../../constants/CommonConstants";
import momentTimeZone from "moment-timezone";
import AppointmentService from "../../services/Appointment.service";
import BillingService from "../../services/Billing.service";
import Analytics from "@segment/analytics-react-native";
import moment from "moment";
import { NavigationActions, StackActions } from "react-navigation";

const HEADER_SIZE = getHeaderHeight();

class ApptActualPriceScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.selectedService = navigation.getParam("selectedService", null);
    this.selectedSchedule = navigation.getParam("selectedSchedule", null);
    this.onConfirmOrRequestAppointmentByMember = navigation.getParam("onConfirmOrRequestAppointmentByMember", null);
    this.appointment = navigation.getParam("appointment", null);
    this.primaryConcern = navigation.getParam("primaryConcern", null);
    const selectedServiceCost = this.selectedService && this.selectedService?.cost
      ? this.selectedService.cost.toString()
      : "1";
    this.selectedInsurance = navigation.getParam("selectedInsurance", null);
    this.payee = navigation.getParam("payee", null);
    this.paymentMethod = navigation.getParam("paymentMethod", null);
    this.state = {
      isLoading: false,
      walletSelected: this.props.payment?.wallet?.balance > selectedServiceCost,
      selectedCardId: this.props.payment?.wallet?.balance < selectedServiceCost ? (this.props.payment?.cardsList &&
        this.props.payment?.cardsList?.length > 0 && this.props.payment?.cardsList[0]?.cardId || "new_card") : null,
      cost:
        this.selectedService && this.selectedService?.cost
          ? this.selectedService?.cost.toString()
          : "1",
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    if (this.selectedInsurance?.id && this.selectedInsurance?.byPassPaymentScreen && this.selectedInsurance?.supported) {
      this.bookOrConfirmAppointment();
    } else {
      this.props.fetchCardsList();
    }
  }

  handleBackButton() {
    if (this.selectedInsurance !== null)
      return false;
    else return true;
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };

  /**
   * @function navigateToNewPaymentScreen
   * @description This method is used to navigate to new payment screen
   */
  navigateToNewPaymentScreen = () => {
    this.props.navigation.navigate(Screens.NEW_PAYMENT_DETAILS_SCREEN, {
      ...this.props.navigation.state.params,
      payee: (this.selectedInsurance?.id && this.selectedInsurance?.byPassPaymentScreen && this.selectedInsurance?.supported) ? PAYEE.INSURANCE : PAYEE.TRANSACTIONAL,
    });
  };


  /**
   * @function selectWallet
   * @description This method is used to select wallet
   */

  selectWallet = () => {
    if (this.props.payment.wallet.balance < this.state.cost) {
      AlertUtil.showErrorMessage("Not enough funds in wallet");
      return;
    }
    this.setState({
      selectedCardId: null,
      walletSelected: true,
    });
  };


  /**
   * @function confirmAppointment
   * @description This method is used to confirm appointment
   */
  confirmAppointment = async () => {
    const { appointment } = this;
    let segmentEvent, response;
    if (appointment.isChanged) {
      segmentEvent = SEGMENT_EVENT.APPOINTMENT_CHANGE_REQUESTED;
      const payload = {
        appointmentId: appointment.appointmentId,
        participantId: appointment.participantId,
        serviceId: appointment.serviceId,
        slot: appointment.selectedSchedule.slot,
        day: parseInt(appointment.selectedSchedule.day),
        month: parseInt(appointment.selectedSchedule.month),
        year: appointment.selectedSchedule.year,
        comment: null,
        timeZone: momentTimeZone.tz.guess(true),
        insuranceType: this.selectedInsurance?.name || "",
        payee: this.payee,
      };
      response = await AppointmentService.requestChanges(payload.appointmentId, payload);
    } else {
      segmentEvent = SEGMENT_EVENT.APPOINTMENT_CONFIRMED;
      const payload = {
        appointmentId: appointment.appointmentId,
        paymentDetails: null,
        payee: (this.selectedInsurance?.id && this.selectedInsurance?.byPassPaymentScreen && this.selectedInsurance?.supported) ? PAYEE.INSURANCE : PAYEE.TRANSACTIONAL,
      };
      response = await AppointmentService.confirmAppointment(payload);
    }
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      if (this.selectedInsurance?.id && this.selectedInsurance?.byPassPaymentScreen && this.selectedInsurance?.supported) {
        AlertUtil.showSuccessMessage("Appointment confirmed successfully");
        this.performDangerousNavigation();
      } else {
        this.payForAppointment(appointment.appointmentId, segmentEvent);
      }
    }

  };

  /**
   * @function bookAppointment
   * @description This method is used to book appointment
   */
  bookAppointment = async () => {
    try {
      const payloadForApi = {
        participantId: this.selectedProvider.userId,
        providerName: this.selectedProvider.name,
        serviceId: this.selectedService.id,
        slot: this.selectedSchedule.slot,
        day: this.selectedSchedule.day,
        month: parseInt(this.selectedSchedule.month),
        year: this.selectedSchedule.year,
        primaryConcern: this.primaryConcern,
        timeZone: momentTimeZone.tz.guess(true),
        insuranceType: this.selectedInsurance?.name || "",
        payee: this.payee,
      };
      console.log(payloadForApi);
      const response = await AppointmentService.requestAppointment(payloadForApi);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        if (this.selectedInsurance?.id && this.selectedInsurance?.byPassPaymentScreen && this.selectedInsurance?.supported) {
          AlertUtil.showSuccessMessage("Appointment requested successfully");
          this.performDangerousNavigation();

        } else {
          this.payForAppointment(response?.id, SEGMENT_EVENT.APPOINTMENT_REQUESTED);
        }
      }
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
      });
    }
  };


  /**
   * @function bookOrConfirmAppointment
   * @description This method is used book or confirm appointment
   */
  bookOrConfirmAppointment = () => {
    this.setState({
      isLoading: true,
    });
    console.log(this.appointment);
    if (this.appointment) {
      this.confirmAppointment();
    } else {
      this.bookAppointment();
    }
  };

  /**
   * @function payForAppointment
   * @description This method is used to pay for appointment
   */
  payForAppointment = (appointmentId, segmentEvent) => {
    if (this.canPay()) {
      if (this.state.walletSelected) {
        this.payViaWallet(appointmentId, segmentEvent);
      } else {
        this.payViaCard(appointmentId, this.state.selectedCardId, segmentEvent);
      }
    }
  };

  /**
   * @function payViaCard
   * @description This method is used to pay via card
   */
  payViaCard = async (appointmentId, cardId, segmentEvent) => {
    try {
      const { cost } = this.state;
      const payload = {
        amount: cost,
        paymentType: "APPOINTMENT_CHARGES",
        paymentToken: cardId,
        reference: appointmentId,
        insuranceType: this.selectedInsurance?.name || "",
      };
      const paymentResponse = await BillingService.payForAppointmentByCard(appointmentId, payload);
      if (paymentResponse.errors) {
        AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        AlertUtil.showSuccessMessage("Payment successful");
        await Analytics.identify(this.props.auth?.meta?.userId, {
          hasScheduledAnAppointment: true,
        });
        await this.trackSegment("Stripe", segmentEvent);
        this.performDangerousNavigation();
      }

    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(e);
      this.setState({ isLoading: false });
    }
  };


  /**
   * @function payViaWallet
   * @description This method is used to pay via wallet
   */
  payViaWallet = async (appointmentId, segmentEvent) => {
    try {
      const { cost } = this.state;
      const payload = {
        amount: cost,
        paymentType: "APPOINTMENT_CHARGES",
        reference: appointmentId,
        metaData: {
          type: "APPOINTMENT_CHARGES",
          amount: cost,
          appointmentId,
        },
        insuranceType: this.selectedInsurance?.name || "",
      };

      const walletResponse = await BillingService.deductGenericWalletPayment(payload);
      if (walletResponse.errors) {
        AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        AlertUtil.showSuccessMessage("Payment successful");
        this.props.fetchWalletSilently();
        await Analytics.identify(this.props.auth?.meta?.userId, {
          hasScheduledAnAppointment: true,
        });
        await this.trackSegment("Wallet", segmentEvent);
        this.performDangerousNavigation();
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage(STRIPE_ERROR);
      this.setState({ isLoading: false, payNow: false });
    }
  };

  /**
   * @function canPay
   * @description This method is used to return boolean value
   */
  canPay = () => {
    if (!this.state.walletSelected && !this.state.selectedCardId) {
      return false;
    }
    if (this.state.walletSelected) {
      if (this.props.payment.wallet.balance < this.state.cost) {
        return false;
      }
    }
    return Number(this.state.cost) > 0;

  };

  /**
   * @function trackSegment
   * @description This method is used to track segment
   */
  trackSegment = async (paymentMethod, segmentEvent) => {
    const segmentPayload = {
      selectedProvider: this.selectedProvider?.name,
      appointmentDuration: this.selectedService?.duration,
      appointmentCost: this.selectedService?.cost,
      appointmentMarketRate: this.selectedService?.marketCost,
      appointmentRecommendedPayment: this.selectedService?.recommendedCost,
      selectedService: this.selectedService?.name,
      selectedSchedule: this.selectedSchedule?.dateDesc,
      requestedAt: moment.utc(Date.now()).format("MMMM Do YYYY, h:mm:ss a"),
      startTime: this.selectedSchedule?.slotStartTime?.time + this.selectedSchedule?.slotStartTime?.amPm,
      endTime: this.selectedSchedule?.slotEndTime?.time + this.selectedSchedule?.slotEndTime?.amPm,
      appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
      primaryConcern: this.primaryConcern,
      userId: this.props.auth.meta.userId,
      serviceType: this.selectedService?.serviceType,
      paymentAmount: this.state.cost,
      paymentMethod: paymentMethod,
      amountInWallet: this.props.payment.wallet.balance,
      confidantFundsInWallet: this.props.payment.wallet.balance,
    };

    await Analytics.track(segmentEvent, segmentPayload);

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


  //TODO: Replace this with proper implementation
  performDangerousNavigation = () => {
    let { appointment } = this.state;
    let isRequested;
    if (this.appointment) {
      isRequested = !!this.appointment.isChanged;
      appointment = this.appointment;
    } else {
      isRequested = true;
    }
    const resetAction = StackActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({
          routeName: Screens.TAB_VIEW,
          action: NavigationActions.navigate({
            routeName: Screens.APPOINTMENTS_SCREEN,
          }),
        }),
        NavigationActions.navigate({
          routeName: Screens.APPOINTMENT_SUBMITTED,
          params: {
            selectedProvider: this.selectedProvider,
            selectedService: this.selectedService,
            selectedSchedule: this.selectedSchedule,
            appointment: appointment,
            isRequest: isRequested,
          },
        }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  };


  render = () => {
    StatusBar.setBarStyle("dark-content", true);
    if (this.state.isLoading || this.props.payment.isLoading) {
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
          {
            this.selectedInsurance === null && (
              <Left>
                <View style={styles.backButton}>
                  <BackButton
                    {...addTestID("back-btn")}
                    onPress={this.backClicked}
                  />
                </View>
              </Left>
            )
          }

          <Body />
          <Right />
        </Header>
        <Content showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={styles.mainHeading}>{this.paymentMethod === PAYMENT_OPTIONS.PAY_CASH ? "The price of this appointment is"
              : `We don't have their insurance yet`}</Text>
            {this.paymentMethod === PAYMENT_OPTIONS.PAY_CASH && (
              <Text style={styles.priceText}>${this.selectedService?.cost}</Text>)}
            <Text style={styles.subText}>{this.paymentMethod === PAYMENT_OPTIONS.USE_INSURANCE ?
              "We are working on it! In the meantime, this is the cost to cover your appointment,"
              : "Please select your payment method below."}</Text>
            {this.paymentMethod === PAYMENT_OPTIONS.USE_INSURANCE && (
              <Text style={styles.priceText}>${this.selectedService?.cost}</Text>)}
          </View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{
              justifyContent: "center",
            }}
            style={styles.fundTypeList}>
            {
              this.props?.payment?.wallet?.balance > 0 && (
                <Button
                  onPress={this.selectWallet}
                  style={this.state.walletSelected ? styles.myWalletBtnSelected : styles.myWalletBtn}
                  transparent>
                  <Text uppercase={false} style={styles.myWalletText}>My wallet</Text>
                  <Text uppercase={false}
                        style={styles.myWalletValue}>${this.props.payment.wallet.balance}</Text>
                </Button>
              )
            }
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
                  walletSelected: false,
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

        </Content>

        <AddPaymentCardModal
          isOpen={this.state.cardModalOpen}
          onClose={() => {
            this.setState({
              cardModalOpen: false,
            });
          }}
          onSubmit={this.addCard}
        />

        <View style={styles.greBtn}>
          <TouchableOpacity style={styles.affordBtn} onPress={() => {
            this.navigateToNewPaymentScreen();
          }}>
            <Text style={styles.affordText}>I can’t afford that</Text>
          </TouchableOpacity>
          <PrimaryButton
            text={this.state.selectedCardId === "new_card" ? "Add new card" : "Continue"}
            onPress={() => {
              if (this.state.selectedCardId === "new_card") {
                this.setState({
                  cardModalOpen: true,
                });
              } else {
                this.bookOrConfirmAppointment();
              }
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
  mainHeading: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.highContrast,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
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
  subText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.mediumContrast,
    marginBottom: 8,
    textAlign: "center",
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


export default connectPayment()(ApptActualPriceScreen);
