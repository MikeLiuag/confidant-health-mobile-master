import React, { Component } from "react";
import { AlertUtil, SocketClient, TelehealthWaitingComponent } from "ch-mobile-shared";
import { Screens } from "../../constants/Screens";
import AuthStore from "../../utilities/AuthStore";
import AppointmentService from "../../services/Appointment.service";
import { connectAppointments } from "../../redux";
import Analytics from "@segment/analytics-react-native";
import KeepAwake from "react-native-keep-awake";
import { PAYMENT_METHOD, SEGMENT_EVENT } from "../../constants/CommonConstants";
import moment from "moment";

class WaitingRoomScreen extends Component<Props> {

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.keepScreenAwake(true);
    this.connectedToSession = navigation.getParam("connectedToSession", false);
    this.referrerScreen = navigation.getParam("referrerScreen", null);
    this.endSessionBtn = navigation.getParam("endSessionBtn", false);
    this.state = {
      isLoading: false,
      appointment: navigation.getParam("appointment", null),
      sessionId: navigation.getParam("sessionId", null),
      token: navigation.getParam("token", null),
      sessionStarted: navigation.getParam("sessionStarted", null),
      encounterId: navigation.getParam("encounterId", null),
      sessionEnded: false,
    };
  }

  componentDidMount = async () => {
    await Analytics.screen(
        'Waiting Room Screen'
    );
    await this.emitSocketEvents();
  };

  keepScreenAwake = (shouldBeAwake) => {
    if (shouldBeAwake) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }
  };

  emitSocketEvents = async () => {
    if (!this.connectedToSession) {
      try {
        const socket = SocketClient.getInstance().getConnectedSocket();
        socket.emit("telesession-join", {
          appointmentId: this.state.appointment.appointmentId,
          encounterId: this.state.encounterId,
          sessionId: this.state.sessionId,
          from: {
            userId: this.props.auth.meta.userId,
            name: this.props.auth.meta.nickname,
          },
          to: this.state.appointment.participantId,
          authToken: await AuthStore.getAuthToken(),
        });
        socket.on("telesessionError", (data) => {
          AlertUtil.showErrorMessage("Unable to communicate with the requested user");
          this.goBack();
        });
      } catch (e) {
        AlertUtil.showErrorMessage("Socket issues");
      }
    }
  };


  goBack = () => {
    this.keepScreenAwake(false);
    if (this.referrerScreen) {
      this.props.navigation.navigate(this.referrerScreen);
    } else {
      this.props.navigation.replace(Screens.APPOINTMENT_DETAILS_SCREEN, {
        appointment: this.state.appointment,
      });
    }
  };

  telesessionStarted = async (session) => {
    this.keepScreenAwake(false);
    const { appointment, sessionId, encounterId } = this.state;
    const { participantId, participantName, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost} = appointment;
    await this.setState({ startedAt: moment.utc(Date.now()).format() });
    const segmentPayload = {
      telesessionId: sessionId,
      encounterId: encounterId,
      userId: this.props.auth.meta.userId,
      providerId: participantId,
      startedAt: this.state.startedAt,
      startTime: startTime,
      endTime: endTime,
      appointmentName: serviceName,
      appointmentDuration: serviceDuration,
      appointmentCost: serviceCost,
      paymentAmount: prePayment.amountPaid,
      sessionStarted: true,
      providerName : participantName,
      providerRole : designation,
      appointmentMarketRate : marketCost,
      appointmentRecommendedPayment : recommendedCost,
      category: 'Goal Completion',
      label: 'Telehealth Session Started'
    };
    await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_STARTED, segmentPayload);

    this.props.navigation.replace(Screens.VIDEO_CALL, {
      ...this.props.navigation.state.params,
      sessionStarted: this.state.sessionStarted,
    });
  };

  telesessionRejected = (session) => {
    this.keepScreenAwake(false);
    AlertUtil.showErrorMessage(this.state.appointment.name + " rejected your telesession request");
  };

  telesessionNotReady = (session) => {
    this.keepScreenAwake(false);
    // AlertUtil.showErrorMessage("The session has been ended previously");
    this.navigateToCompleted(true);
  };


  navigateToCompleted = (completedByMember) => {
    this.keepScreenAwake(false);
    this.props.fetchAppointments();
    const { encounterId, sessionId, appointment, startedAt } = this.state;
    const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = appointment;
    const segmentSessionCompletedPayload = {
      telesessionId: sessionId,
      sessionStarted: false,
      encounterId: encounterId,
      userId: this.props.auth.meta.userId,
      providerId: participantId,
      startedAt: startedAt,
      startTime: startTime,
      endTime: endTime,
      appointmentName: serviceName,
      appointmentDuration: serviceDuration,
      appointmentCost: serviceCost,
      paymentAmount: prePayment.amountPaid,
      completedAt: moment.utc(Date.now()).format(),
      completionMethod: completedByMember ? "By Member" : "By Provider",
      providerName : participantName,
      providerRole : designation,
      appointmentMarketRate : marketCost,
      appointmentRecommendedPayment : recommendedCost
    };

    this.props.navigation.replace(Screens.COMPLETED_SESSION, {
      providerId: this.state.appointment.participantId,
      name: this.state.appointment?.participantName,
      sessionId: this.state.sessionId,
      encounterId: this.state.encounterId,
      appointment: this.state.appointment,
      referrerScreen: this.referrerScreen,
      startedAt: this.state.startedAt,
      completedAt: moment.utc(Date.now()).format(),
      segmentSessionCompletedPayload: segmentSessionCompletedPayload,
    });
  };

  callEnded = async (event) => {
    this.setState({ sessionEnded: true });
    this.keepScreenAwake(false);
    console.log("Call ended event");
    console.log(event);
    const appointmentId = this.state.appointment.appointmentId;
    const socket = SocketClient.getInstance().getConnectedSocket();
    if (socket) {
      socket.emit("fullfil-appointment", {
        appointmentId: this.state.appointment.appointmentId,
        from: {
          userId: this.props.auth.meta.userId,
        },
        authToken: await AuthStore.getAuthToken(),
      });
    }
    const response = await AppointmentService.completeAppointment(appointmentId);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ sessionEnded: false });
    } else {
      this.navigateToCompleted(true);
    }
  };

  markAsNoShow = async ()=>{
    this.setState({
      isLoading: true
    });
    const response = await AppointmentService.cancelAppointment(this.state.appointment.appointmentId, 'NO_SHOW');
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
      this.setState({ isLoading: false });
    } else {
      if (this.state.appointment?.prePayment?.paymentMethod === PAYMENT_METHOD.INSURANCE)
        AlertUtil.showSuccessMessage("Your appointment has been cancelled.");
      else
        AlertUtil.showSuccessMessage("Appointment successfully canceled. Payment refunded to your wallet.");
      this.props.navigation.navigate(Screens.TAB_VIEW);
    }
  };

  render() {
    return (
      <TelehealthWaitingComponent
        goBack={this.goBack}
        isLoading={this.state.isLoading}
        sessionId={this.state.sessionId}
        userId={this.props.auth.meta.userId}
        appointmentId={this.state.appointment.appointmentId}
        name={this.state.appointment.participantName}
        avatar={this.state.appointment.avatar}
        telesessionRejected={this.telesessionRejected}
        telesessionStarted={this.telesessionStarted}
        telesessionNotReady={this.telesessionNotReady}
        endSessionBtn={this.endSessionBtn}
        callEnded={this.callEnded}
        sessionEnded={this.state.sessionEnded}
        markAsNoShow={this.markAsNoShow}
        isProviderApp={false}
      />
    );
  }
}

export default connectAppointments()(WaitingRoomScreen);
