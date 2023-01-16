import React, {Component} from 'react';
import { OPENTOK_APIKEY, PAYMENT_METHOD, SEGMENT_EVENT } from "../../constants/CommonConstants";
import {AlertUtil, getAvatar, TelehealthComponentV2} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import AppointmentService from '../../services/Appointment.service';
import {connectAppointments} from '../../redux';
import KeepAwake from 'react-native-keep-awake';
import { NavigationActions, StackActions } from 'react-navigation';
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

class TelehealthSessionV2Screen extends Component<Props> {
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
            isLoading: false
        };
    }

    componentWillUnmount(): void {
        this.keepScreenAwake(false);
    }

    keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () =>{
        this.teleSessionEndedSegmentEvent(true);
        const { connections,profile } = this.props;
        const patient = profile.patient;
        let connection = connections.activeConnections.filter(item => item.connectionId === this.appointment.participantId)[0];
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: Screens.LIVE_CHAT_WINDOW_SCREEN, params:  {
                        provider:{...connection,profilePicture:getAvatar(connection),userId:connection.connectionId},
                        patient: patient,
                        connection:{...connection,profilePicture:getAvatar(connection)}
                    }}),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    /**
     * @function navigateToCompleted
     * @description This method is used to navigate to completed screen.
     */
    navigateToCompleted = (completedByMember) => {
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = this.appointment;
        const segmentSessionCompletedPayload = {
            teleSessionId: this.sessionId,
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
            category: 'Goal Completion',
            label: 'Telehealth Session Completed'
        };
        this.props.fetchAppointments();
        this.props.navigation.replace(Screens.COMPLETED_SESSION, {
            ...this.props.navigation.state.params,
            providerId: this.appointment?.participantId,
            name: this.appointment?.participantName,
            startedAt: startedAt,
            completedAt: completedAt? completedAt:moment.utc(Date.now()).format(),
            segmentSessionCompletedPayload:segmentSessionCompletedPayload
        });
    };

    /**
     * @function callEnded
     * @description This method is used to end session.
     */
    callEnded = async (event) => {
        this.setState({sessionEnded : true,isLoading: true});
        this.keepScreenAwake(false);
        const appointmentId = this.appointment.appointmentId;
        const response = await AppointmentService.completeAppointment(appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded : false,isLoading: false})
        } else {
            await this.setState({completedAt: moment.utc(Date.now()).format()})
            this.navigateToCompleted(true);
        }
    };


    /**
     * @function goBack
     * @description This method is used to navigate back.
     */
    goBack = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function teleSessionEndedSegmentEvent
     * @description This method is used to send segment event for tele session ended.
     */
    teleSessionEndedSegmentEvent = async (completedByMember)=>{
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = this.appointment;
        const segmentPayload = {
            teleSessionId: this.sessionId,
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

    /**
     * @function markAsNoShow
     * @description This method is used to mark appointment as no show.
     */
    markAsNoShow = async ()=>{
        this.setState({
            isLoading: true
        });
        const response = await AppointmentService.cancelAppointment(this.appointment.appointmentId, 'NO_SHOW');
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({ isLoading: false });
        } else {
            if (this.appointment?.prePayment?.paymentMethod === PAYMENT_METHOD.INSURANCE)
                AlertUtil.showSuccessMessage("Your appointment has been cancelled.");
            else
                AlertUtil.showSuccessMessage("Appointment successfully canceled. Payment refunded to your wallet.");
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }
    };

    render() {
        return (
            <TelehealthComponentV2
                isLoading = {this.state.isLoading}
                apiKey={String(this.apiKey)}
                goBack={this.goBack}
                appointmentId={this.appointment.appointmentId}
                userId={this.props?.auth?.meta?.userId}
                token={this.token}
                name={this.appointment.participantName}
                avatar={this.appointment.avatar}
                sessionId={this.sessionId}
                navigateToLiveChat={this.navigateToLiveChat}
                navigateToCompleted={this.navigateToCompleted}
                callEnded = {this.callEnded}
                markAsNoShow={this.markAsNoShow}
                isProviderApp = {false}
            />
        );
    }
}

export default connectAppointments()(TelehealthSessionV2Screen);
