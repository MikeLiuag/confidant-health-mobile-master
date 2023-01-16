import React, { Component } from "react";
import { connectConnections } from "../../redux";
import { Screens } from "../../constants/Screens";
import { AlertUtil, ApptConfirmDetailsV2Component } from "ch-mobile-shared";
import AppointmentService from "../../services/Appointment.service";
import momentTimeZone from "moment-timezone";
import { APPOINTMENT_STATUS, PAYEE, PAYMENT_OPTIONS, SEGMENT_EVENT } from "../../constants/CommonConstants";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";
import BillingService from "../../services/Billing.service";


class AppointmentConfirmDetailsScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.profileRequest = navigation.getParam("profileRequest", null);
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.selectedService = navigation.getParam("selectedService", null);
    this.selectedSchedule = navigation.getParam("selectedSchedule", null);
    this.selectedScheduleOriginal = this.selectedSchedule;
    this.onConfirmOrRequestAppointmentByMember = navigation.getParam("onConfirmOrRequestAppointmentByMember", null);
    this.stateConsent = navigation.getParam("stateConsent", false);
    this.selectedSchedule = {
      date: this.selectedSchedule.dateDesc,
      slots: this.selectedSchedule.slotStartTime.time + " " + this.selectedSchedule.slotStartTime.amPm + " - " + this.selectedSchedule.slotEndTime.time + " " + this.selectedSchedule.slotEndTime.amPm,
    };

    this.state = {
      isLoading: false,
      primaryConcern: "",
    };
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };

  removePrimaryConcern = () => {
    this.setState({ primaryConcern: "" });
  };

  setRequestMessageText = (text) => {
    this.setState({ msgText: text });
  };

  changeProvider = () => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN);
  };

  changeService = () => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
      selectedProvider: this.selectedProvider,
    });
  };

  changeSchedule = () => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN);
  };

  navigateToNextScreen = () => {
    const serviceStateLimited = this.selectedService.stateUsageInAppointment;
    const providerStateLimited = this.selectedProvider.stateLimited;
    if (!this.props.profile.isLoading) {
      if (!this.stateConsent && serviceStateLimited && providerStateLimited && this.selectedService?.operatingStates?.length > 0) {
        this.props.navigation.navigate(Screens.REQUEST_APPT_STATE_CONSENT_SCREEN, {
          ...this.props.navigation.state.params,
          stateConsent: false,
          selectedService: this.selectedService,
          selectedProvider: this.selectedProvider,
          selectedSchedule: this.selectedScheduleOriginal,
          returnScreenName: Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN,
        });
      } else {
        if (this.props.profile.patient.passedFirstAppointmentFlow) {
          this.props.navigation.navigate(Screens.APPOINTMENT_PAYMENT_OPTIONS_SCREEN, {
            ...this.props.navigation.state.params,
            primaryConcern: this.state.msgText,
            profile: this.props.profile,
          });
        } else {
          this.props.navigation.navigate(Screens.APPT_PATIENT_INFORMATION_SCREEN, {
            ...this.props.navigation.state.params,
            primaryConcern: this.state.msgText,
            onConfirmOrRequestAppointmentByMember: this.onConfirmOrRequestAppointmentByMember,
          });
        }
      }
    }
  };

  onRequestChangesByMember = async (prePaymentDetails) => {
    this.setState({
      isLoading: true,
    });
    let payee = PAYEE.TRANSACTIONAL;
    const billingResponse = await BillingService.getPatientInsuranceProfile();
    if (billingResponse.errors) {
      AlertUtil.showErrorMessage(billingResponse.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      if (billingResponse.insuranceProfile?.byPassPaymentScreen && billingResponse.insuranceProfile?.supported)
        payee = PAYEE.INSURANCE;
    }
    const { selectedProvider, selectedSchedule, selectedService, payload, appointment } = this.state;
    payload.paymentDetails = prePaymentDetails;
    payload.primaryConcern = this.state.msgText;
    payload.payee = payee;
    console.log(payload);
    const response = await AppointmentService.requestChanges(payload.appointmentId, payload);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      const segmentAppointmentRequestChangesPayload = {
        selectedProvider: selectedProvider?.name,
        appointmentDuration: selectedService?.duration,
        appointmentCost: selectedService?.cost,
        appointmentMarketRate: selectedService?.marketCost,
        appointmentRecommendedPayment: selectedService?.recommendedCost,
        selectedService: selectedService?.name,
        selectedSchedule: selectedSchedule?.dateDesc,
        requestedAt: moment.utc(Date.now()).format("MMMM Do YYYY, h:mm:ss a"),
        startTime: selectedSchedule.slotStartTime.time + selectedSchedule.slotStartTime.amPm,
        endTime: selectedSchedule.slotEndTime.time + selectedSchedule.slotEndTime.amPm,
        appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
        requestMessage: appointment?.analytics?.requestMessage,
        userId: this.props.auth.meta.userId,
        serviceType: selectedService?.serviceType,
        paymentAmount: prePaymentDetails?.amountPaid,
        paymentMethod: prePaymentDetails?.paymentMethod,
        amountInWallet: this.props.payment.wallet.balance,
        confidantFundsInWallet: this.props.payment.wallet.balance,
      };
      await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CHANGE_REQUESTED, segmentAppointmentRequestChangesPayload);
      this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
        selectedService,
        selectedProvider,
        selectedSchedule,
        isRequest: true,
      });
    }
  };

  submitAppointmentRequest = async () => {
    this.setState({ isLoading: true });
    const payload = {
      participantId: this.selectedProvider.userId,
      serviceId: this.selectedService.id,
      slot: this.selectedSchedule.slot,
      day: this.selectedSchedule.day,
      month: parseInt(this.selectedSchedule.month),
      year: this.selectedSchedule.year,
      comment: this.state.msgText,
      timeZone: momentTimeZone.tz.guess(true),
    };
    const response = await AppointmentService.requestAppointment(payload);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      setTimeout(() => {
        this.props.refreshConnections();
      }, 2000);
      this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
        isRequest: true,
        fixedProvider: this.selectedProvider.fixedProvider,
        referrerScreen: this.selectedProvider.referrerScreen,
        selectedProvider: this.selectedProvider,
        selectedService: this.selectedService,
        selectedSchedule: this.selectedSchedule,
      });
    }

  };

  detailDrawerClose = () => {
    this.refs?.modalDetailView?.close();
  };


  render = () => {
    return (
      <ApptConfirmDetailsV2Component
        isLoading={this.state.isLoading}
        backClicked={() => {
          this.props.navigation.goBack();
        }}
        selectedUser={{ ...this.selectedProvider, userId: this.selectedProvider.connectionId }}
        selectedService={this.selectedService}
        selectedSchedule={this.selectedSchedule}
        changeUser={this.changeProvider}
        changeService={this.changeService}
        changeSchedule={this.changeSchedule}
        navigateToNextScreen={this.navigateToNextScreen}
        primaryConcern={this.state.primaryConcern}
        removePrimaryConcern={this.removePrimaryConcern}
        primaryConcernChanged={(concern) => {
          this.setState({
            primaryConcern: concern,
          });
        }}
      />
    );
  };
}

export default connectConnections()(AppointmentConfirmDetailsScreen);
