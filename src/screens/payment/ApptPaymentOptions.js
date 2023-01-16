import React, { Component } from "react";
import { Image, Platform, StatusBar, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
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
  PrimaryButton, RECURRING_SUBSCRIPTION_STATUS,
  TextStyles,
} from "ch-mobile-shared";
import { PAYEE, PAYMENT_OPTIONS, SEGMENT_EVENT } from "../../constants/CommonConstants";
import BillingService from "../../services/Billing.service";
import momentTimeZone from "moment-timezone";
import AppointmentService from "../../services/Appointment.service";
import { NavigationActions, StackActions } from "react-navigation";

const HEADER_SIZE = getHeaderHeight();

export default class ApptPaymentOptionsScreen extends Component<Props> {
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
    this.profile = this.props.navigation.getParam("profile", null);
    this.state = {
      isLoading: true,
      selectedPaymentOption: "PAY_CASH"
    };
  }

  componentDidMount() {
    this.getPatientInsuranceProfile();
  }

  /**
   * @function disconnect
   * @description This method is used to navigate back
   */
  backClicked = () => {
    if (this.profile?.patient?.passedFirstAppointmentFlow)
      this.props.navigation.goBack();
    else
      this.props.navigation.navigate(Screens.TAB_VIEW);
  };

  getPatientInsuranceProfile = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await BillingService.getPatientInsuranceProfile();
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        if(response.recurringSubscription?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE){
          this.bookOrConfirmAppointment(response.recurringSubscription, PAYEE.RECURRING_SUBSCRIPTION);
        } else if (response.insuranceProfile?.byPassPaymentScreen && response.insuranceProfile?.supported) {
          this.bookOrConfirmAppointment(response.insuranceProfile, PAYEE.INSURANCE);
        } else if (response.insuranceProfile?.id && response.insuranceProfile?.byPassPaymentScreen === false && response.insuranceProfile?.supported === false) {
          this.navigateToPaymentScreen(response.insuranceProfile, PAYMENT_OPTIONS.PAY_CASH, PAYEE.TRANSACTIONAL);
        } else {
          this.setState({ isLoading: false });
        }
      }

    } catch (e) {
      console.warn(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.setState({ isLoading: false });
    }
  };

  navigateToPaymentScreen = (selectedBillingProfile, paymentMethod, payee) => {
    this.props.navigation.navigate(Screens.APPOINTMENT_ACTUAL_PRICE_SCREEN, {
      ...this.props.navigation.state.params,
      selectedBillingProfile: selectedBillingProfile,
      payee: payee,
      paymentMethod: paymentMethod,
    });
  };

  bookOrConfirmAppointment = (billingProfile, payee) => {
    this.setState({
      isLoading: true,
    });
    if (this.appointment) {
      this.confirmAppointment(billingProfile, payee);
    } else {
      this.bookAppointment(billingProfile, payee);
    }
  };

  /**
   * @function confirmAppointment
   * @description This method is used to confirm appointment
   */
  confirmAppointment = async (billingProfile, payee) => {
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
        insuranceType: billingProfile?.name || "",
        payee: payee,
      };
      response = await AppointmentService.requestChanges(payload.appointmentId, payload);
    } else {
      segmentEvent = SEGMENT_EVENT.APPOINTMENT_CONFIRMED;
      const payload = {
        appointmentId: appointment.appointmentId,
        paymentDetails: null,
        payee: (billingProfile?.id && billingProfile?.byPassPaymentScreen && billingProfile?.supported) ? billingProfile?.status === RECURRING_SUBSCRIPTION_STATUS.ACTIVE ? PAYEE.RECURRING_SUBSCRIPTION : PAYEE.INSURANCE : PAYEE.TRANSACTIONAL,
      };
      response = await AppointmentService.confirmAppointment(payload);
    }
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      this.setState({ isLoading: false });
        AlertUtil.showSuccessMessage("Appointment confirmed successfully");
        this.performDangerousNavigation();
    }

  };

  /**
   * @function bookAppointment
   * @description This method is used to book appointment
   */
  bookAppointment = async (billingProfile, payee) => {
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
        insuranceType: billingProfile?.name || "",
        payee: payee,
      };
      const response = await AppointmentService.requestAppointment(payloadForApi);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
          AlertUtil.showSuccessMessage("Appointment requested successfully");
          this.performDangerousNavigation();
      }
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
      });
    }
  };

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

  /**
   * @function navigateToRespectiveScreen
   * @description This method is used to navigate to respective screen
   */
  navigateToRespectiveScreen = () => {

    const { selectedPaymentOption } = this.state;
    if (selectedPaymentOption === PAYMENT_OPTIONS.PAY_CASH) {
      this.navigateToPaymentScreen(null, PAYMENT_OPTIONS.PAY_CASH, PAYEE.TRANSACTIONAL);
    } else {
      this.props.navigation.navigate(Screens.APPOINTMENT_INSURANCE_LIST_SCREEN, {
        ...this.props.navigation.state.params,
        paymentMethod: PAYMENT_OPTIONS.USE_INSURANCE,
        paye: PAYEE.INSURANCE,
      });
    }
  };

  render = () => {
    StatusBar.setBarStyle("dark-content", true);
    if (this.state.isLoading) {
      return (<AlfieLoader />);
    }
    const { selectedPaymentOption } = this.state;
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
          contentContainerStyle={{ paddingHorizontal: 24 }}>
          <View>
            <Text style={styles.mainHeading}>How would you
              like to pay?</Text>
            <Text style={styles.subText}>Quality care is only moments away.{"\n"} We have options for all
              situations.</Text>
            <View style={styles.itemList}>
              <TouchableWithoutFeedback onPress={() => {
                this.setState({ selectedPaymentOption: PAYMENT_OPTIONS.PAY_CASH });
              }}>
                <View
                  style={selectedPaymentOption === PAYMENT_OPTIONS.PAY_CASH ? [styles.singleCard, styles.selectedPaymentOption] : styles.singleCard}>
                  <Image
                    style={styles.cardIcon}
                    resizeMode={"contain"}
                    source={require("../../assets/images/apptBills.png")} />
                  <Text style={styles.contentMainText}>Pay cash</Text>
                  <Text style={styles.contentSubText}>A fast, affordable, and highly private way to
                    pay. Access the same providers with transparent up-front pricing.</Text>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => {
                this.setState({ selectedPaymentOption: PAYMENT_OPTIONS.USE_INSURANCE });
              }}>
                <View
                  style={selectedPaymentOption === PAYMENT_OPTIONS.USE_INSURANCE ? [styles.singleCard, styles.selectedPaymentOption] : styles.singleCard}>
                  <Image
                    style={styles.cardIcon}
                    resizeMode={"contain"}
                    source={require("../../assets/images/apptInsurance.png")} />
                  <Text style={styles.contentMainText}>Use insurance</Text>
                  <Text style={styles.contentSubText}>Our services are fully covered or accessible
                    with a co-pay for many of our insurance partners.</Text>
                </View>
              </TouchableWithoutFeedback>

            </View>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <PrimaryButton
            text="Continue"
            disabled={!selectedPaymentOption}
            onPress={() => {
              this.navigateToRespectiveScreen();
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
    paddingHorizontal: 24,
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
  singleCard: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  selectedPaymentOption: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.colors.secondaryText,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  contentMainText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.subTextL,
    color: Colors.colors.highContrast,
    marginBottom: 4,
  },
  contentSubText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.mediumContrast,
  },
  greBtn: {
    paddingHorizontal: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
  },
});
