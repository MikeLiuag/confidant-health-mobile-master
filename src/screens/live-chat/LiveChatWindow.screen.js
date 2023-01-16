import React, { Component } from "react";
import { Screens } from "../../constants/Screens";
import { connectLiveChat } from "../../redux";
import LiveChatComponent from "ch-mobile-shared/src/components/LiveChat.component";
import { AlertUtil, AlfieLoader, getAvatar, isTelehealthConfigured } from "ch-mobile-shared";
import ProfileService from "../../services/Profile.service";
import moment from "moment";
import AuthStore from "../../utilities/AuthStore";
import AppointmentService from "../../services/Appointment.service";
import Analytics from "@segment/analytics-react-native";
import DeepLinksService from "../../services/DeepLinksService";
import { ERROR_NOT_FOUND, SEGMENT_EVENT } from "../../constants/CommonConstants";

class LiveChatWindowScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  connectionStatus = {
    "0": "Connecting...",
    "1": "Chat Connected",
    "2": "Fetching Messages",
    "3": "Privacy Prompt Required",
    "4": "Ready to Chat",
    "5": "Failed to connect",
    "6": "Closed",
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const provider = navigation.getParam("provider", null);
    const connection = navigation.getParam("connection", null);
    this.connection = connection;
    this.connection.userId = this.connection.connectionId;
    const patient = navigation.getParam("patient", null);
    this.referrer = navigation.getParam("referrer", null);
    this.state = {
      providerInfo: provider,
      patientInfo: patient,
      startingSession: false,
    };
  }

  componentDidMount = async () => {
    if (this.connection.type === "CHAT_GROUP") {
      await this.getGroupDetails();
      await this.groupQRCode();
    } else {
      this.props.liveChatInit({
        payload: {
          provider: this.connection,
        },
      });
    }

  };

  shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
    const connections = nextProps.connections.activeConnections.filter(connection => connection.connectionId === this.connection.connectionId);
    if (this.connection.type !== "CHAT_GROUP") {
      if (connections.length === 0) {
        AlertUtil.showErrorMessage("You're disconnected from this chat.");
        this.goBack();
        return false;
      }
    }
    return true;
  }

  componentWillUnmount(): void {
    // console.log('Unmounting Chat');
    // this.props.liveChatExit();
  }

  getGroupDetails = async () => {
    this.setState({ isLoading: true });
    try {
      const groupsResponse = await ProfileService.getGroupDetails(this.connection.channelUrl);
      if (groupsResponse.errors) {
        if (groupsResponse.errors[0].errorCode === ERROR_NOT_FOUND) {
          AlertUtil.showErrorMessage("The group has been deleted");
          this.props.fetchConnectionsSilent();
        } else {
          console.log(groupsResponse.errors);
          AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
        }
        this.props.navigation.navigate(Screens.TAB_VIEW);

      } else {
        this.props.liveChatInit({
          payload: {
            provider: this.connection,
          },
        });
        this.setState({ isLoading: false, groupsResponse: groupsResponse });
      }
    } catch (e) {
      console.log(e);
      AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
      this.props.navigation.navigate(Screens.TAB_VIEW);
    }
  };


  leaveGroup = async () => {
    this.setState({ isLoading: true });
    const response = await ProfileService.removeMember(this.connection.channelUrl, this.props?.auth?.meta?.userId);
    if (response.errors) {
      this.setState({ isLoading: false });
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
    } else {
      this.setState({ isLoading: false });
      AlertUtil.showSuccessMessage("You are no longer participant of " + this.connection.name + " group");
      this.props.fetchConnections();
      this.goBack();
    }
  };


  deleteGroup = async () => {
    this.setState({ isLoading: true });
    const response = await ProfileService.deleteGroup(this.connection.channelUrl);
    if (response.errors) {
      this.setState({ isLoading: false });
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
    } else {
      this.setState({ isLoading: false });
      AlertUtil.showSuccessMessage("Group deleted successfully.");
      this.props.fetchConnections();
      this.goBack();
    }
  };

  shareProviderProfile = async (channel) => {

    await Analytics.track(SEGMENT_EVENT.APP_SHARED, {
      userId: this.props?.auth?.meta?.userId,
      screenName: "LiveChatWindowScreen",
    });


    await DeepLinksService.shareProviderProfileLink(channel, this.state.providerInfo.userId);
  };

  shareGroup = async (channel) => {
    setTimeout(async () => {
      await DeepLinksService.shareGroupLink(channel, this.connection.channelUrl);
    }, 500);
  };

  groupQRCode = async () => {
    const groupLink = await DeepLinksService.groupQRCodeLink(this.connection.channelUrl);
    this.setState({ groupLink: groupLink });
  };

  showProviderDetails = (providerChatOpen) => {
    if (this.connection.type === "PATIENT") {
      this.props.navigation.navigate(Screens.MEMBER_PROFILE_SCREEN, {
        userId: this.connection.connectionId,
        name: this.connection.name,
        profilePicture: this.connection.profilePicture,
        lastModified: this.connection.lastModified,
        isConnected: true,
      });
    } else if (this.connection.type === "PRACTITIONER") {
      this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
        provider: this.state.providerInfo,
        patient: this.state.patientInfo,
        referrer: Screens.LIVE_CHAT_WINDOW_SCREEN,
        providerChatOpen,
      });
    } else if (this.connection.type === "CHAT_GROUP") {
      this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN,
        {
          name: this.connection.name,
          profilePicture: this.connection.profilePicture,
          channelUrl: this.connection.channelUrl,
          joinedGroup : true,
          publicGroupType: this.state.groupsResponse?.groupTypePublic,
          publicGroupLink: this.state.groupLink,

        });
    } else if (this.connection.type === "MATCH_MAKER") {
      this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, {
        provider: { ...this.state.providerInfo, avatar: this.state.providerInfo?.profilePicture },
        patient: this.state.patientInfo,
        referrer: Screens.LIVE_CHAT_WINDOW_SCREEN,
        providerChatOpen,
      });

    }

  };

  VideoScreen = async () => {
    const isConfigured = await isTelehealthConfigured();
    this.props.navigation.navigate(!isConfigured ? Screens.TELEHEALTH_WELCOME : Screens.TELE_SESSION_V2, {
      provider: this.connection,
    });
  };

  startGroupCall = async () => {
    this.props.navigation.navigate(Screens.GROUP_RULES_ACCEPT_SCREEN, {
      connection: { ...this.connection, ...this.state.groupsResponse },
    });
  };

  goBack = () => {
    this.props.navigation.navigate(Screens.TAB_VIEW);
  };

  sendMessage = async payload => {
    this.props.liveChatSendMessage(payload);
    //Send event to Segment in case of group chat
    if (this.connection.type === "CHAT_GROUP") {
      const createdAt = payload?.payload?.message?.createdAt;
      const segmentPayload = {
        userId: this.props?.auth?.meta?.userId,
        groupName: this.connection?.name,
        groupId: this.connection?.channelUrl,
        messageSentDateTime: createdAt,
      };
      await Analytics.track(SEGMENT_EVENT.GROUP_CHAT_MESSAGE_SENT, segmentPayload);
    }

  };

  getFeedbackSummary = async () => {
    const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(this.connection.connectionId);
    if (feedbackSummaryDetails.errors) {
      //AlertUtil.showErrorMessage("Failed to fetch provider feedback detail");
      return null;
    } else {
      return feedbackSummaryDetails;
    }
  };

  navigateToProhibitiveScreen = ()=>{
    this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
  }

  requestAppointment = async () => {
    if(this.props.profile.patient.isPatientProhibitive){
      this.navigateToProhibitiveScreen()
    }else {
      this.setState({
        requestingAppointment: true,
      });
      const provider = await ProfileService.getProviderProfile(this.connection.connectionId);
      if (provider.errors) {
        AlertUtil.showErrorMessage("Failed to fetch provider information");
      } else {
        const feedbackSummary = await this.getFeedbackSummary();
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
          selectedProvider: {
            name: this.connection.name,
            userId: this.connection.connectionId,
            profilePicture: this.connection.avatar,
            designation: this.connection.designation,
            fixedProvider: true,
            referrerScreen: Screens.LIVE_CHAT_WINDOW_SCREEN,
            speciality: provider.speciality.join(","),
            totalReviews: feedbackSummary ? feedbackSummary.totalReviews : 0,
            combinedRating: feedbackSummary ? feedbackSummary.combinedRating : 0
          },
        });
      }
      setTimeout(() => {
        this.setState({
          requestingAppointment: false,
        });
      }, 1000);
    }
  };

  isMissed = (appt) => {
    return moment(appt.endTime).diff(moment(), "minutes") < 0;
  };

  isToday = (appointment) => {
    return moment().isSame(moment(appointment.startTime), "days")
      && !this.isMissed(appointment);
  };

  getBookedAppointments = () => {
    const { appointments } = this.props;
    if (this.connection.type === "PRACTITIONER" || this.connection.type === "MATCH_MAKER") {
      const filteredAppointments = appointments.appointments.filter(appt => {
        return appt.status === "BOOKED" && appt.participantId === this.connection.connectionId && this.isToday(appt);
      });
      return filteredAppointments.sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
    } else {
      return [];
    }

  };


  startSession = async (appointment) => {
    if (!this.state.startingSession) {
      this.setState({ startingSession: true });
      const appointmentId = appointment.appointmentId;
      const authToken = await AuthStore.getAuthToken();
      try {
        const response = await AppointmentService.arriveForAppointment(appointmentId, authToken);
        if (response.errors) {
          AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
          this.setState({ startingSession: false });
        } else {
          const isConfigured = await isTelehealthConfigured();
          const sessionParams = {
            appointment: appointment,
            sessionId: response.telesessionId,
            token: response.telesessionToken,
            sessionStarted: response.sessionStarted,
            encounterId: response.encounterId,
            referrerScreen: Screens.LIVE_CHAT_WINDOW_SCREEN,
          };
          if (isConfigured) {
            this.props.navigation.navigate(Screens.TELE_SESSION_V2, sessionParams);
          } else {
            this.props.navigation.navigate(Screens.TELEHEALTH_WELCOME, sessionParams);
          }
          setTimeout(() => {
            this.setState({
              startingSession: false,
            });
          }, 1000);

        }
      } catch (e) {
        console.log(e);
        this.setState({
          startingSession: false,
        });
        AlertUtil.showErrorMessage("Something went wrong, please try later");
      }
    }
  };

  checkNextAppointmentForToday = () => {
    this.setState({
      ...this.state,
    });
  };

  findConnectionAvatar = (connectionId) => {
    let avatar = this._findAvatar(connectionId, this.props.connections.activeConnections);
    if (!avatar) {
      avatar = this._findAvatar(connectionId, this.props.connections.pastConnections);
    }
    return avatar ? getAvatar({ profilePicture: avatar }) : null;
  };

  _findAvatar(connectionId, connections) {
    const filtered = connections.filter(conn => conn.connectionId === connectionId);
    if (filtered.length > 0) {
      return filtered[0].profilePicture;
    }
  }


  openImage = (url) => {
    this.props.navigation.navigate(Screens.GENERIC_MEDIA_VIEW, {
      type: "image",
      uri: url,
    });
  };

  openVideo = (url) => {
    this.props.navigation.navigate(Screens.GENERIC_MEDIA_VIEW, {
      type: "video",
      uri: url,
    });
  };

  render() {
    if (this.props.connections.isLoading || this.state.isLoading) {
      return (<AlfieLoader />);
    }

    const { chat } = this.props;
    const appts = this.getBookedAppointments();
    let appointment = null;
    if (appts.length > 0) {
      appointment = appts[0];
    }
    const connections = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.connection.connectionId);
    if (connections.length > 0) {
      const connection = connections[0];
      this.connection = { ...connection, avatar: getAvatar(connection), userId: connection.connectionId };
    }


    return (<LiveChatComponent

      connectionStatus={this.state.requestingAppointment ? "7" : (this.state.startingSession ? "8" : chat.liveChatConnectionStatus)}
      goBack={this.goBack}
      startSession={this.startSession}
      appointment={appointment}
      checkNextAppointmentForToday={this.checkNextAppointmentForToday}
      showConnectionProfile={this.showProviderDetails}
      shareProviderProfile={this.shareProviderProfile}
      connection={this.connection}
      isTelehealthEnabled={this.connection.type === "PRACTITIONER"}
      navigateToTelehealth={this.VideoScreen}
      navigateToGroupCall={this.startGroupCall}
      userId={this.props.auth.meta.userId}
      nickName={this.props.auth.meta.nickname}
      messages={chat.liveChatMessages}
      findConnectionAvatar={this.findConnectionAvatar}
      requestAppointment={this.requestAppointment}
      dataSharingPromptAnswered={this.dataSharingPromptAnswered}
      providerListScreen={Screens.PROVIDER_LIST_SCREEN}
      sendMessage={this.sendMessage}
      leaveGroup={this.leaveGroup}
      deleteGroup={this.deleteGroup}
      shareGroup={this.shareGroup}
      openImage={this.openImage}
      openVideo={this.openVideo}
      educationContentScreen={Screens.EDUCATIONAL_CONTENT_PIECE}
      navigation={this.props.navigation}
      groupResponse={this.state.groupsResponse}
    />);
  };
}

export default connectLiveChat()(LiveChatWindowScreen);
