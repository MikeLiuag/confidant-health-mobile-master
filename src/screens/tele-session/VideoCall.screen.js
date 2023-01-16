import React, {Component} from 'react';
import {OPENTOK_APIKEY, SEGMENT_EVENT} from '../../constants/CommonConstants';
import {AlertUtil, getAvatar, SocketClient, TelehealthSessionComponent} from 'ch-mobile-shared';
import AuthStore from '../../utilities/AuthStore';
import {Screens} from '../../constants/Screens';
import AppointmentService from '../../services/Appointment.service';
import {connectAppointments} from '../../redux';
import KeepAwake from 'react-native-keep-awake';
import { NavigationActions, StackActions } from 'react-navigation';
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

class VideoCallScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.keepScreenAwake(true);
        this.apiKey = OPENTOK_APIKEY;
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.sessionId = navigation.getParam('sessionId', null);
        this.token = navigation.getParam('token', null);
        this.sessionStarted = navigation.getParam('sessionStarted', null);
        this.encounterId = navigation.getParam('encounterId', null);
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            isLoading: false,
            hasConnectivityIssues: false,
            sessionEnded : false,
            startedAt: moment.utc(Date.now()).format()
        };
        SocketClient.getInstance().registerConnectivityCallbacks(Screens.VIDEO_CALL, () => {
            console.log('Telesession Disconnected');
            this.setState({hasConnectivityIssues: true});
        }, async () => {
            console.log('Telesession Reconnected...');
            const socket = SocketClient.getInstance().getConnectedSocket();
            socket.emit('telesession-join', {
                appointmentId: this.appointment.appointmentId,
                encounterId: this.encounterId,
                sessionId: this.sessionId,
                from: {
                    userId: this.props.auth.meta.userId,
                    name: this.props.auth.meta.nickname,
                },
                to: this.appointment.participantId,
                authToken: await AuthStore.getAuthToken(),
            });
            await this.setState({hasConnectivityIssues: false});
        });
    }

    componentDidMount() {
        Analytics.screen(
            'Video Call Screen'
        );
    }

    componentWillUnmount(): void {
        this.keepScreenAwake(false);
        SocketClient.getInstance().unregisterConnectivityCallbacks(Screens.VIDEO_CALL);
    }

    keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }

    navigateToLiveChat = () =>{
        this.teleSessionEndedSegmentEvents(true);
        console.log('Going to live chat screen');
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit("telesession-disconnect", {
                appointmentId: this.appointment?.appointmentId,
                userId: this.props?.auth?.meta?.userId,
                willBeBack : true
            });
        }
        const connections = this.props.connections;
        const patient = this.props.profile.patient;
        let connection = connections.activeConnections.filter(item => item.connectionId === this.appointment.participantId)[0];
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: Screens.TAB_VIEW}),
                NavigationActions.navigate({ routeName: Screens.LIVE_CHAT_WINDOW_SCREEN, params:  {
                        provider:{...connection,profilePicture:getAvatar(connection),userId:connection.connectionId},
                        patient: patient,
                        connection:{...connection,profilePicture:getAvatar(connection)}
                    }}),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    disconnect = () => {
        console.log("Session disconnecting facing some issues...")
        this.keepScreenAwake(false);
        this.setState({hasConnectivityIssues: true},()=>{
            this.teleSessionEndedSegmentEvents(false);
            setTimeout(() => {
                this.navigateToWaitingRoomScreen();
            }, 30000);
        });
    };

    navigateToWaitingRoomScreen = ()=> {
        console.log("Navigate to waiting screen ...");
        this.props.navigation.replace(Screens.WAITING_ROOM_SCREEN, {
            ...this.props.navigation.state.params,
            connectedToSession: true,
            endSessionBtn:true
        });
    }

    navigateToCompleted = (completedByMember) => {
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = this.appointment;
        const segmentSessionCompletedPayload = {
            telesessionId: this.sessionId,
            sessionStarted: true,
            encounterId: this.encounterId,
            userId: this.props?.auth?.meta?.userId,
            providerId: participantId,
            startedAt: startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            paymentAmount: prePayment?.amountPaid,
            completedAt: completedAt? completedAt:moment.utc(Date.now()).format(),
            completionMethod : completedByMember ? "By Member" : "By Provider",
            providerName : participantName,
            providerRole : designation,
            appointmentMarketRate : marketCost,
            appointmentRecommendedPayment : recommendedCost
        };
        this.props.fetchAppointments();
        this.props.navigation.replace(Screens.COMPLETED_SESSION, {
            ...this.props.navigation.state.params,
            providerId: this.appointment?.participantId,
            name: this.appointment?.participantName,
            startedAt: this.state?.startedAt,
            completedAt: this.state?.completedAt? this.state?.completedAt:moment.utc(Date.now()).format(),
            segmentSessionCompletedPayload:segmentSessionCompletedPayload
        });
    };

    callEnded = async (event) => {
        console.log('Call ended event');
        console.log(event);
        this.setState({sessionEnded : true})
        this.keepScreenAwake(false);
        const appointmentId = this.appointment.appointmentId;
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit('fullfil-appointment', {
                appointmentId: this.appointment.appointmentId,
                from: {
                    userId: this.props.auth.meta.userId,
                },
                authToken: await AuthStore.getAuthToken(),
            });
        }
        const response = await AppointmentService.completeAppointment(appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded : false})
        } else {
            await this.setState({completedAt: moment.utc(Date.now()).format()})
            this.navigateToCompleted(true);
        }
    };

    goBack = () => {
        this.props.navigation.goBack();
    };


    teleSessionEndedSegmentEvents = async (completedByMember)=>{
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = this.appointment;
        const segmentPayload = {
            telesessionId: this.sessionId,
            sessionStarted: true,
            encounterId: this.encounterId,
            userId: this.props?.auth?.meta?.userId,
            providerId: participantId,
            startedAt: startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            paymentAmount: prePayment?.amountPaid,
            completedAt: completedAt? completedAt:moment.utc(Date.now()).format(),
            completionMethod : completedByMember ? "By Member" : "By Provider",
            providerName : participantName,
            providerRole : designation,
            appointmentMarketRate : marketCost,
            appointmentRecommendedPayment : recommendedCost,
            reasonSessionEnded : {
                "endedByPatient" : !!completedByMember,
                "endedByProvider" : !completedByMember,
                "patientNoShow" : false,
                "providerNoShow" : true,
            }
        };
        await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_ENDED, segmentPayload);
    }

    render() {
        return (
            <TelehealthSessionComponent
                apiKey={this.apiKey}
                goBack={this.goBack}
                hasConnectivityIssues={this.state.hasConnectivityIssues}
                appointmentId={this.appointment.appointmentId}
                userId={this.props.auth.meta.userId}
                token={this.token}
                callEnded={this.callEnded}
                name={this.appointment.participantName}
                avatar={this.appointment.avatar}
                disconnect={this.disconnect}
                navigateToCompleted={this.navigateToCompleted}
                sessionId={this.sessionId}
                navigateToLiveChat={this.navigateToLiveChat}
                sessionEnded ={this.state.sessionEnded}
                navigateToWaitingRoomScreen = {this.navigateToWaitingRoomScreen}
            />
        );
    }
}

export default connectAppointments()(VideoCallScreen);
