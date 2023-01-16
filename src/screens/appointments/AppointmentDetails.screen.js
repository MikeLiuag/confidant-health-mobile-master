import React, { Component } from "react";
import { StatusBar } from "react-native";
import { connectAppointments } from "../../redux";
import { AlertUtil, AppointmentDetailsComponent, isTelehealthConfigured } from "ch-mobile-shared";
import { Screens } from "../../constants/Screens";
import AppointmentService from "../../services/Appointment.service";
import AuthStore from "../../utilities/AuthStore";
import momentTimeZone from "moment-timezone";
import Analytics from "@segment/analytics-react-native";
import moment from "moment";
import {
  APPOINTMENT_STATUS,
  DEFAULT_AVATAR_COLOR,
  PAYMENT_METHOD,
  SEGMENT_EVENT,
} from "../../constants/CommonConstants";

class AppointmentDetailsScreen extends Component<Props> {

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      appointment: this.props.navigation.getParam("appointment", null),
      isLoading: false,
      telesessionId: null,
      telesessionToken: null,
      sessionStarted: false,
      encounterId: null,
      appointmentStatus: false,

    };
  }


  arriveForAppointment = async () => {
    this.setState({ isLoading: true });
    const { appointment } = this.state;
    const appointmentId = appointment.appointmentId;
    const authToken = await AuthStore.getAuthToken();
    try {
      const response = await AppointmentService.arriveForAppointment(appointmentId, authToken);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({ appointmentStatus: false, isLoading: false });
      } else {
        this.setState({
          isLoading: false,
          telesessionId: response.telesessionId,
          telesessionToken: response.telesessionToken,
          sessionStarted: response.sessionStarted,
          encounterId: response.encounterId,
          appointmentStatus: true,
        });
      }
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
        appointmentStatus: false,
      });
      AlertUtil.showErrorMessage("Something went wrong, please try later");
    }
  };

  startSession = async () => {

    const isConfigured = await isTelehealthConfigured();
    await this.arriveForAppointment();
    if (this.state.appointmentStatus) {
      if (isConfigured) {
        this.props.navigation.replace(Screens.TELE_SESSION_V2, {
          appointment: this.state.appointment,
          sessionId: this.state.telesessionId,
          token: this.state.telesessionToken,
          sessionStarted: this.state.sessionStarted,
          encounterId: this.state.encounterId,
        });
      } else {
        this.props.navigation.replace(Screens.TELEHEALTH_WELCOME, {
          appointment: this.state.appointment,
          sessionId: this.state.telesessionId,
          token: this.state.telesessionToken,
          sessionStarted: this.state.sessionStarted,
          encounterId: this.state.encounterId,
        });

      }
    }
  };


  updateAppointment = (appt) => {
    this.setState({ appointment: appt });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };
  changeService = () => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
      originalAppointment: this.state.appointment,
      updateAppointment: this.updateAppointment,
    });
  };
  changeSlot = () => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
      originalAppointment: this.state.appointment,
      selectedService: {
        id: this.state.appointment.serviceId,
        name: this.state.appointment.serviceName,
        duration: this.state.appointment.serviceDuration,
        cost: this.state.appointment.serviceCost,
        marketCost: this.state.appointment?.marketCost,
        recommendedCost: this.state.appointment?.recommendedCost,
      },
      updateAppointment: this.updateAppointment,
    });
  };

  editRequestMessage = (msgText, callback) => {
    this.props.navigation.navigate(Screens.REQUEST_APPT_EDIT_MESSAGE_SCREEN, {
      setText: callback,
      text: msgText,
    });
  };


  requestChanges = async (payload) => {
    this.setState({ isLoading: true });
    payload.timeZone = momentTimeZone.tz.guess(true);
    const { appointment } = this.state;

    const selectedSchedule = appointment.selectedSchedule;
    const selectedService = {
      cost: appointment.serviceCost,
      recommendedCost: appointment.recommendedCost,
      marketCost: appointment.marketCost,
      id: appointment.serviceId,
      durationText: this.getDurationText(appointment.serviceDuration),
      name: appointment.serviceName,
      serviceType: appointment.serviceType,
      duration: appointment.serviceDuration,

    };
    const providers = await this.getAllProviders();
    let selectedProvider;
    if (providers) {
      selectedProvider = providers.filter(provider => provider.userId === appointment.participantId);
      if (selectedProvider && selectedProvider.length > 0) {
        selectedProvider = selectedProvider[0];
      }
    }
    this.setState({ selectedProvider, selectedSchedule, selectedService, payload, isLoading: false });
    if (appointment && appointment.prePayment) {
      await this.onRequestChangesByMember(appointment.prePayment);
    } else {
      this.props.navigation.navigate(Screens.NEW_PAYMENT_DETAILS_SCREEN, {
        selectedProvider, selectedService, selectedSchedule, appointment,
        onConfirmOrRequestAppointmentByMember: this.onRequestChangesByMember,
      });
    }
  };

  onRequestChangesByMember = async (prePaymentDetails) => {
    this.setState({
      isLoading: true,
    });
    const { selectedProvider, selectedSchedule, selectedService, payload, appointment } = this.state;
    payload.paymentDetails = prePaymentDetails;
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

  getDurationText = (duration) => {
    const minText = " min";
    const hourText = " hour";
    if (duration < 60) {
      return duration + minText;
    }
    const hour = parseInt(duration / 60);
    const min = duration % 60;
    let text = hour + hourText;
    if (min > 0) {
      text = text + " " + min + minText;
    }
    return text;
  };


  findAvatarColorCode = (connectionId) => {

    let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
    if (connection && connection.length < 1) {
      connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
    }
    return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR;

  };

  getAllProviders = async () => {
    let response = await AppointmentService.listProviders();
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
    } else {
      if (response && response.length > 0) {
        response = response.map((item) => {
          if (!item.profilePicture) {
            item.colorCode = this.findAvatarColorCode(item.userId);
          }
          return item;
        });
      }
      return response;
    }
  };


  getTimeFromMilitaryStamp = (stamp) => {
    const stringStamp = (stamp + "");
    if (stringStamp.length === 1) {
      return {
        time: "12:0" + stringStamp,
        amPm: "AM",
      };
    } else if (stringStamp.length === 2) {
      return {
        time: "12:" + stringStamp,
        amPm: "AM",
      };
    } else if (stringStamp.length === 3) {
      let hr = stringStamp.substr(0, 1);
      let min = stringStamp.substr(1);
      return {
        time: "0" + hr + ":" + min,
        amPm: "AM",
      };
    } else {
      let hr = stringStamp.substr(0, 2);
      let min = stringStamp.substr(2);
      let amPM = "AM";
      if (parseInt(hr) >= 12) {
        if (hr > 12) {
          hr = parseInt(hr) - 12;
          if (hr < 10) {
            hr = "0" + hr;
          }
        }
        amPM = "PM";
      }
      return {
        time: hr + ":" + min,
        amPm: amPM,
      };
    }

  };

  getDateDesc = (_moment) => {
    const tz = moment.tz.guess(true);
    return _moment.tz(tz).format("dddd, DD MMM YYYY");
  };

  confirmAppointmentByMember = async (prePaymentDetails) => {
    this.setState({ isLoading: true });
    const { appointment, selectedProvider, selectedSchedule, selectedService } = this.state;
    const confirmAppointmentByMember = {
      appointmentId: appointment.appointmentId,
      paymentDetails: prePaymentDetails,
    };
    const response = await AppointmentService.confirmAppointment(confirmAppointmentByMember);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      const startMoment = moment(appointment.startTime);
      const dayDateText = this.getDateDesc(startMoment);
      const segmentAppointmentConfirmedPayload = {
        selectedProvider: appointment?.participantName,
        appointmentDuration: appointment?.serviceDuration,
        appointmentCost: appointment?.serviceCost,
        appointmentMarketRate: appointment?.marketCost,
        appointmentRecommendedPayment: appointment?.recommendedCost,
        selectedService: appointment?.serviceName,
        serviceType: appointment?.serviceType,
        selectedSchedule: dayDateText,
        requestedAt: appointment?.analytics?.requestedAt,
        startTime: appointment?.startText,
        endTime: appointment?.endText,
        appointmentStatus: APPOINTMENT_STATUS.CONFIRMED,
        requestMessage: appointment?.analytics?.requestMessage,
        userId: this.props.auth.meta.userId,
        paymentAmount: appointment?.prePayment ? appointment.prePayment?.amountPaid : prePaymentDetails?.amountPaid,
        paymentMethod: appointment?.prePayment ? appointment.prePayment?.paymentMethod : prePaymentDetails?.paymentMethod,
        confirmedAt: moment.utc(Date.now()).format(),
        amountInWallet: this.props.payment?.wallet?.balance,
        confidantFundsInWallet: this.props.payment?.wallet?.balance,
        category: "Goal Completion",
        label: "Appointment Confirmed",
      };
      await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CONFIRMED, segmentAppointmentConfirmedPayload);
      this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
        selectedProvider,
        selectedSchedule,
        selectedService,
        isRequest: false,
        appointment: appointment,
      });
    }
  };

  confirmAppointment = async () => {
    this.setState({ isLoading: true });
    const { appointment } = this.state;
    const endMoment = moment(appointment.endTime);
    const startMoment = moment(appointment.startTime);
    const start = startMoment.format("HHmm");
    const end = endMoment.format("HHmm");
    const slotStartTime = this.getTimeFromMilitaryStamp(start);
    const slotEndTime = this.getTimeFromMilitaryStamp(end);
    const selectedSchedule = {
      dayDateText: this.getDateDesc(startMoment),
      slotStartTime, slotEndTime,
    };
    const selectedService = {
      cost: appointment.serviceCost,
      recommendedCost: appointment.recommendedCost,
      marketCost: appointment.marketCost,
      id: appointment.serviceId,
      durationText: this.getDurationText(appointment.serviceDuration),
      name: appointment.serviceName,
    };

    const providers = await this.getAllProviders();
    let selectedProvider;
    if (providers) {
      selectedProvider = providers.filter(provider => provider.userId === appointment.participantId);
      if (selectedProvider && selectedProvider.length > 0) {
        selectedProvider = selectedProvider[0];
      }
    }
    this.setState({ selectedProvider, selectedSchedule, selectedService, isLoading: false });
    if (appointment && appointment.prePayment) {
      await this.confirmAppointmentByMember(null);
    } else {
      this.props.navigation.navigate(Screens.NEW_PAYMENT_DETAILS_SCREEN, {
        selectedProvider, selectedService, selectedSchedule, appointment,
        onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember,
      });
    }
  };


  gotoChat = () => {
    const connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.state.appointment.participantId)[0];
    if (connection) {
      this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
        provider: { ...connection, userId: connection.connectionId },
        referrer: Screens.APPOINTMENT_DETAILS_SCREEN,
        patient: this.props.auth.meta,
        connection: connection,
      });
    } else {
      AlertUtil.showErrorMessage("Cannot start chat, participant isn't connected");
    }

  };

  cancelAppointment = async () => {
    this.setState({ isLoading: true });
    const response = await AppointmentService.cancelAppointment(this.state.appointment.appointmentId, null);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
    } else {
      const { appointment } = this.state;
      const startMoment = moment(appointment.startTime);
      const dayDateText = this.getDateDesc(startMoment);
      const segmentAppointmentCancelledPayload = {
        selectedProvider: appointment?.participantName,
        appointmentDuration: appointment?.serviceDuration,
        appointmentCost: appointment?.serviceCost,
        appointmentMarketRate: appointment?.marketCost,
        appointmentRecommendedPayment: appointment?.recommendedCost,
        selectedService: appointment?.serviceName,
        selectedSchedule: dayDateText,
        requestedAt: appointment?.analytics?.requestedAt,
        startTime: appointment?.startText,
        endTime: appointment?.endText,
        appointmentStatus: APPOINTMENT_STATUS.CANCELLED,
        requestMessage: appointment?.analytics?.requestMessage,
        userId: this.props.auth?.data?.userId,
        serviceType: appointment?.serviceType,
        paymentAmount: appointment?.prePayment ? appointment.prePayment?.amountPaid : "",
        paymentMethod: appointment?.prePayment ? appointment.prePayment?.paymentMethod : "",
        confirmedAt: appointment.analytics.confirmedAt,
        cancelledAt: moment.utc(Date.now()).format(),
        amountInWallet: this.props.payment?.wallet?.balance,
        confidantFundsInWallet: this.props.payment?.wallet?.balance,
      };
      await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CANCELLED, segmentAppointmentCancelledPayload);
      if (appointment?.prePayment?.paymentMethod === PAYMENT_METHOD.INSURANCE)
        AlertUtil.showSuccessMessage("Your appointment has been cancelled.");
      else
          AlertUtil.showSuccessMessage("Appointment successfully canceled. Payment refunded to your wallet.");
    }
    this.goBack();
  };


  showFeedback = () => {
    return this.state.appointment.status === "PENDING_PAYMENT" &&
      (!this.state.appointment.feedback || !this.state.appointment.feedback.rating ||
        (!this.state.appointment.feedback.privateFeedback && !this.state.appointment.feedback.publicComment));
  };

  proceedToPayment = () => {
    if (this.showFeedback()) {
      this.navigateToFeedback();
    } else {
      //TODO: Pass this appointmentId as a param to payment page.
      this.props.navigation.navigate(Screens.SESSION_COST_SCREEN, {
        appointment: this.state.appointment,
      });
    }
  };


  navigateToFeedback = () => {

    const { appointment } = this.state;
    this.props.navigation.replace(Screens.COMPLETED_SESSION, {
      providerId: appointment?.participantId,
      name: appointment?.participantName,
      sessionId: appointment?.sessionId,
      encounterId: appointment?.encounterId,
      appointment: appointment,
      referrerScreen: Screens.APPOINTMENT_DETAILS_SCREEN,
    });

  };

  render() {
    console.log("DETAILS");
    console.log(this.state.appointment);
    StatusBar.setBackgroundColor("transparent", true);
    StatusBar.setBarStyle("dark-content", true);
    const connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.state.appointment.participantId)[0];
    return (<AppointmentDetailsComponent
      goBack={this.goBack}
      changeService={this.changeService}
      isLoading={this.state.isLoading}
      connection={connection}
      changeSlot={this.changeSlot}
      addRequestMessage={this.editRequestMessage}
      requestChanges={this.requestChanges}
      gotoChat={this.gotoChat}
      confirmAppointment={this.confirmAppointment}
      cancelAppointment={this.cancelAppointment}
      proceedToPayment={this.proceedToPayment}
      appointment={this.state.appointment}
      startSession={this.startSession}
      navigateToFeedback={this.navigateToFeedback}
      isMemberApp={true}
    />);
  }
}

export default connectAppointments()(AppointmentDetailsScreen);
