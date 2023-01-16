import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {
    AlertUtil,
    AppointmentDetailV2Component,
    Colors,
    CommonStyles,
    getDateDesc,
    getHeaderHeight,
    getTimeByDSTOffset,
    getTimeFromMilitaryStamp,
    isIphoneX,
    isMissed,
    isTelehealthConfigured,
    TextStyles,
} from "ch-mobile-shared";
import {Screens} from '../../constants/Screens';
import moment from 'moment';
import {connectAppointments} from '../../redux';
import DeepLinksService from '../../services/DeepLinksService';
import AuthStore from '../../utilities/AuthStore';
import AppointmentService from '../../services/Appointment.service';
import {
    APPOINTMENT_STATUS,
    DEFAULT_AVATAR_COLOR,
    PAYMENT_METHOD,
    SEGMENT_EVENT,
} from "../../constants/CommonConstants";
import Analytics from '@segment/analytics-react-native';
import momentTimeZone from 'moment-timezone';
import {BookAppointmentModal} from '../../components/appointment/BookAppointmentModal';

const HEADER_SIZE = getHeaderHeight();

class NewApptDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const appointment = this.props.navigation.getParam('appointment', null);
        this.stateConsent = this.props.navigation.getParam("stateConsent", false)
        this.state = {
            appointment: appointment,
            modalVisible: true,
            addedToCalender: appointment?.addedInCalendar,
            isLoading: false,
            telesessionId: null,
            telesessionToken: null,
            sessionStarted: false,
            encounterId: null,
            appointmentStatus: false,
            modalHeightProps: {
                height: 0
            },
            bookModalVisible: false
        };
    }

    componentDidMount(): void {
        const {appointment} = this.state;
        if (appointment.status === 'BOOKED' && !isMissed(appointment)) {
            this.iv = setInterval(() => {
                this.setState({...this.state});
            }, 1000);
        }

    }

    componentWillUnmount(): void {

    }

    showMoreOptions = () => {
        this.refs?.moreOptionDrawer?.open();
    };

    navigateToFeedback = () => {
        const {appointment} = this.state;
        this.props.navigation.replace(Screens.COMPLETED_SESSION, {
            providerId: appointment.participantId,
            name: appointment.participantName,
            sessionId: appointment.sessionId,
            encounterId: appointment.encounterId,
            appointment: appointment,
            referrerScreen: Screens.APPOINTMENT_DETAILS_SCREEN,
            delayedFeedback: true,
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    getScreenTitle = () => {
        const {appointment} = this.state;
        switch (appointment.status) {
            case 'BOOKED': {
                if (isMissed(appointment)) {
                    return 'Missed appointment';
                } else {
                    return 'Upcoming appointment';
                }
            }
            case 'CANCELLED': {
                return 'Cancelled appointment';
            }
            case 'PROPOSED': {
                return 'Awaiting confirmation';
            }
            case 'FULFILLED': {
                return 'Completed appointment';
            }
            case 'NEEDS_ACTION': {
                return 'Pending confirmation';
            }
            default: {
                return 'Appointment';
            }
        }
    };

    getDetailText = () => {
        const {appointment} = this.state;
        switch (appointment.status) {
            case 'CANCELLED': {
                return 'This appointment has been cancelled';
            }
            case 'PROPOSED': {
                return 'We’re waiting for this provider to confirm your appointment request. If they don’t confirm your request, your payment will be returned to your wallet.';
            }
            case 'BOOKED': {
                if (isMissed(appointment)) {
                    return 'One or both participants missed this appointment.';
                }
                return null;
            }
            case 'NEEDS_ACTION': {
                return 'Other participant is waiting for you to confirm this appointment request.';
            }
        }
        return null;
    };


    getDurationText = (duration) => {
        let hours = Math.floor(duration / 60);
        let minutes = duration % 60;
        let text = '';
        if (hours > 0) {
            text = hours + ' hour';
        }
        if (minutes > 0) {
            text += ' ' + minutes + ' minute';
        }
        return text + ' session';
    };

    requestNewAppointment = () => {
        if (this.props.profile.patient.isPatientProhibitive) {
            this.navigateToProhibitiveScreen()
        } else {
            this.setState({bookModalVisible: true});
        }
    };
    navigateToProhibitiveScreen = () => {
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }

    navigateToProviders = () => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
            isProviderFlow: true,
        });
    };


    navigateToServices = () => {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
            isProviderFlow: false,
        });
    };

    navigateToChat = () => {
        const connection = this.props.connections.activeConnections.find(connection => connection.connectionId === this.state.appointment.participantId);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                provider: {...connection, userId: connection.connectionId},
                referrer: Screens.APPOINTMENT_DETAILS_SCREEN,
                patient: this.props.auth.meta,
                connection: connection,
            });
        } else {
            AlertUtil.showErrorMessage('Cannot start chat, participant isn\'t connected');
        }
    };

    navigateToProvider = () => {

        const connection = this.props.connections.activeConnections.find(connection => connection.connectionId === this.state.appointment.participantId);
        if (connection) {
            if (connection.type === 'PRACTITIONER') {
                const {patient} = this.props.profile;
                this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
                    provider: {
                        userId: connection.connectionId,
                        name: connection.name,
                        profilePicture: connection.profilePicture,
                        type: connection.type,
                    },
                    patient: {
                        userId: patient.userId,
                        nickName: patient.fullName,
                    },
                });
            } else if (connection.type === 'MATCH_MAKER') {
                const {patient} = this.props.profile;
                this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, {
                    provider: {
                        userId: connection.connectionId,
                        name: connection.name,
                        avatar: connection.profilePicture,
                        profilePicture: connection.profilePicture,
                        type: connection.type,
                    },
                    patient: {
                        userId: patient.userId,
                        nickName: patient.fullName,
                    },
                });

            }
        }
    };


    getDSTOffsetDetails = (appointmentStartTime, appointmentEndTime) => {
        let startDate, endDate;
        let dateAfterDSTOffset = getTimeByDSTOffset(appointmentStartTime).utcOffset();
        let dateBeforeDSTOffset = moment(appointmentStartTime).utcOffset();
        if (dateAfterDSTOffset === dateBeforeDSTOffset) {
            startDate = moment(appointmentStartTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate = moment(appointmentEndTime).format('YYYY-MM-DDTHH:mm:ss.sssZ')
        } else if (dateAfterDSTOffset < dateBeforeDSTOffset) {
            startDate = moment(appointmentStartTime).subtract(1, "hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate = moment(appointmentEndTime).subtract(1, "hours").format('YYYY-MM-DDTHH:mm:ss.sssZ')
        } else {
            startDate = moment(appointmentStartTime).add(1, "hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate = moment(appointmentEndTime).add(1, "hours").format('YYYY-MM-DDTHH:mm:ss.sssZ')
        }
        return {startDate, endDate}
    }

    addEventToCalendar = async () => {
        const {appointment} = this.state;
        let startDate, endDate;
        let dstOffsetDetail = this.getDSTOffsetDetails(appointment.startTime, appointment.endTime);
        startDate = dstOffsetDetail?.startDate;
        endDate = dstOffsetDetail?.endDate;
        const eventConfig = {
            title: 'Appointment with ' +
                appointment.participantName,
            startDate: startDate,
            endDate: endDate,
            appointmentId: appointment.appointmentId,
        };

        eventConfig.notes = await DeepLinksService.appointmentLink(eventConfig, appointment);
        eventConfig.onSave = () => {
            this.setState({
                addedToCalender: true,
            });
        };
        this.props.addToCalender(
            eventConfig,
        );
    };

    arriveForAppointment = async () => {
        this.setState({isLoading: true});
        const appointmentId = this.state.appointment.appointmentId;
        const authToken = await AuthStore.getAuthToken();
        try {
            const response = await AppointmentService.arriveForAppointment(appointmentId, authToken);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({appointmentStatus: false, isLoading: false});
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
            AlertUtil.showErrorMessage('Something went wrong, please try later');
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

    cancelAppointment = async () => {
        this.setState({isLoading: true});
        const response = await AppointmentService.cancelAppointment(this.state.appointment.appointmentId, null);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            const {appointment} = this.state;
            const startMoment = moment(appointment.startTime);
            const dayDateText = getDateDesc(startMoment);
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
                paymentAmount: appointment?.prePayment ? appointment.prePayment?.amountPaid : '',
                paymentMethod: appointment?.prePayment ? appointment.prePayment?.paymentMethod : '',
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
        this.backClicked();
    };


    changeService = () => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
            originalAppointment: this.state.appointment,
            updateAppointment: this.updateAppointment,
        });
    };

    changeSlot = () => {
        const {appointment} = this.state;
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
            originalAppointment: appointment,
            selectedService: {
                id: appointment.serviceId,
                name: appointment.serviceName,
                duration: appointment.serviceDuration,
                cost: appointment.serviceCost,
                marketCost: appointment?.marketCost,
                recommendedCost: appointment?.recommendedCost,
            },
            updateAppointment: this.updateAppointment
        });
    };

    confirmAppointmentByMember = async (prePaymentDetails) => {
        this.setState({isLoading: true});
        const {appointment, selectedProvider, selectedSchedule, selectedService} = this.state;
        const confirmAppointmentByMember = {
            appointmentId: appointment.appointmentId,
            paymentDetails: prePaymentDetails
        }
        const response = await AppointmentService.confirmAppointment(confirmAppointmentByMember);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            const startMoment = moment(appointment.startTime);
            //const dayDateText = this.getDateDesc(startMoment);
            const segmentAppointmentConfirmedPayload = {
                selectedProvider: appointment?.participantName,
                appointmentDuration: appointment?.serviceDuration,
                appointmentCost: appointment?.serviceCost,
                appointmentMarketRate: appointment?.marketCost,
                appointmentRecommendedPayment: appointment?.recommendedCost,
                selectedService: appointment?.serviceName,
                serviceType: appointment?.serviceType,
                //selectedSchedule: dayDateText,
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
                category: 'Goal Completion',
                label: 'Appointment Confirmed'
            };
            await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CONFIRMED, segmentAppointmentConfirmedPayload);
            this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
                selectedProvider,
                selectedSchedule,
                selectedService,
                isRequest: false,
                appointment: appointment
            });
        }
    }

    confirmAppointment = async () => {
        this.setState({isLoading: true});
        const {appointment} = this.state;
        const endMoment = moment(appointment.endTime);
        const startMoment = moment(appointment.startTime);
        const start = startMoment.format("HHmm");
        const end = endMoment.format('HHmm');
        const slotStartTime = getTimeFromMilitaryStamp(start);
        const slotEndTime = getTimeFromMilitaryStamp(end);
        const selectedSchedule = {
            dayDateText: getDateDesc(startMoment),
            slotStartTime, slotEndTime,
        };

        const providers = await this.getAllProviders();
        let selectedProvider;
        if (providers) {
            selectedProvider = providers.filter(provider => provider.userId === appointment.participantId);
            if (selectedProvider && selectedProvider.length > 0) {
                selectedProvider = selectedProvider?.[0];
            }
        }
        let servicesList = await AppointmentService.getProviderServices(selectedProvider.userId);
        const service = servicesList.find(service => service.id === appointment.serviceId);
        const selectedService = {
            cost: appointment.serviceCost,
            recommendedCost: appointment.recommendedCost,
            marketCost: appointment.marketCost,
            id: appointment.serviceId,
            durationText: this.getDurationText(appointment.serviceDuration),
            name: appointment.serviceName,
            operatingStates: service?.operatingStates || [],
            systemService: service?.systemService
        };
        this.setState({selectedProvider, selectedSchedule, selectedService});
        if (appointment && appointment.prePayment) {
            await this.confirmAppointmentByMember(null);
        } else {
            if (this.stateConsent === null) {
                this.stateConsent = false;
            }
            if (!this.stateConsent && !selectedService?.systemService && this.selectedService?.operatingStates?.length > 0) {
                this.props.navigation.navigate(Screens.REQUEST_APPT_STATE_CONSENT_SCREEN, {
                    ...this.props.navigation.state.params,
                    stateConsent: false,
                    selectedService: selectedService,
                    selectedProvider: selectedProvider,
                    selectedSchedule: selectedSchedule,
                    returnScreenName: Screens.NEW_APPT_DETAILS_SCREEN
                });
            } else {
                if (this.props.profile.patient.passedFirstAppointmentFlow) {
                    this.props.navigation.navigate(Screens.APPOINTMENT_PAYMENT_OPTIONS_SCREEN, {
                        selectedProvider, selectedService, selectedSchedule, appointment,
                        onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember,
                        profile:this.props.profile
                    });
                } else {
                    this.props.navigation.navigate(Screens.APPT_PATIENT_INFORMATION_SCREEN, {
                        selectedProvider, selectedService, selectedSchedule, appointment,
                        onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember
                    });
                }
                /*this.props.navigation.navigate(Screens.CONFIRM_AND_PAY_SCREEN, {
                    selectedProvider, selectedService, selectedSchedule, appointment,
                    onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember
                });*/
            }
        }
        setTimeout(() => {
            this.setState({isLoading: false})
        }, 2000)

    };


    updateAppointment = (appt) => {
        this.setState({appointment: appt});
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


    findAvatarColorCode = (connectionId) => {

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR;

    };

    requestChanges = async () => {
        const {appointment} = this.state;
        const payload = {
            appointmentId: appointment.appointmentId,
            participantId: appointment.participantId,
            serviceId: appointment.serviceId,
            slot: appointment.selectedSchedule.slot,
            day: parseInt(appointment.selectedSchedule.day),
            month: parseInt(appointment.selectedSchedule.month),
            year: appointment.selectedSchedule.year,
            comment: null,
        };
        this.setState({isLoading: true});
        payload.timeZone = momentTimeZone.tz.guess(true);
        const selectedSchedule = appointment.selectedSchedule;
        const selectedService = {
            cost: appointment.serviceCost,
            recommendedCost: appointment.recommendedCost,
            marketCost: appointment.marketCost,
            id: appointment.serviceId,
            durationText: this.getDurationText(appointment.serviceDuration),
            name: appointment.serviceName,
            serviceType: appointment.serviceType,
            duration: appointment.serviceDuration

        };
        const providers = await this.getAllProviders();
        let selectedProvider;
        if (providers) {
            selectedProvider = providers.filter(provider => provider.userId === appointment.participantId);
            if (selectedProvider && selectedProvider.length > 0) {
                selectedProvider = selectedProvider[0];
            }
        }
        this.setState({selectedProvider, selectedSchedule, selectedService, payload, isLoading: false});
        if (appointment && appointment.prePayment) {
            await this.onRequestChangesByMember(appointment.prePayment);
        } else {
            if (this.props.profile.patient.passedFirstAppointmentFlow) {
                this.props.navigation.navigate(Screens.APPOINTMENT_PAYMENT_OPTIONS_SCREEN, {
                    selectedProvider, selectedService, selectedSchedule, appointment,
                    onConfirmOrRequestAppointmentByMember: this.onRequestChangesByMember,
                    profile: this.props.profile,
                });
            } else {
                this.props.navigation.navigate(Screens.APPT_PATIENT_INFORMATION_SCREEN, {
                    selectedProvider, selectedService, selectedSchedule, appointment,
                    onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember
                });
            }
        }
    };

    onRequestChangesByMember = async (prePaymentDetails) => {
        this.setState({
            isLoading: true
        });
        const {selectedProvider, selectedSchedule, selectedService, payload, appointment} = this.state;
        payload.paymentDetails = prePaymentDetails;
        const response = await AppointmentService.requestChanges(payload.appointmentId, payload)
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            const segmentAppointmentRequestChangesPayload = {
                selectedProvider: selectedProvider?.name,
                appointmentDuration: selectedService?.duration,
                appointmentCost: selectedService?.cost,
                appointmentMarketRate: selectedService?.marketCost,
                appointmentRecommendedPayment: selectedService?.recommendedCost,
                selectedService: selectedService?.name,
                selectedSchedule: selectedSchedule?.dateDesc,
                requestedAt: moment.utc(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
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
                isRequest: true
            });
        }
    }

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(() => {
            this.setState({modalHeightProps: newLayout});
        }, 10)

    }

    MoreOptionsDrawerClose = () => {
        this.refs?.moreOptionDrawer?.close();
        this.setState({
            modalHeightProps: {
                height: 0,

            }
        });
    };


    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <>
                <AppointmentDetailV2Component
                    backClicked={this.backClicked}
                    appointment={this.state.appointment}
                    navigateToChat={this.navigateToChat}
                    changeService={this.changeService}
                    changeSlot={this.changeSlot}
                    addToCalender={this.addEventToCalendar}
                    isLoading={this.state.isLoading}
                    startSession={this.startSession}
                    confirmAppointment={this.confirmAppointment}
                    requestChanges={this.requestChanges}
                    cancelAppointment={this.cancelAppointment}
                    requestNewAppointment={this.requestNewAppointment}
                    navigateToWallet={() => {
                        this.props.navigation.navigate(Screens.MY_WALLET_SCREEN);
                    }}
                    navigateToFeedback={this.navigateToFeedback}
                    profile={this.props.profile}
                    isMemberApp={true}
                />
                <BookAppointmentModal
                    visible={this.state.bookModalVisible}
                    onClose={() => {
                        this.setState({bookModalVisible: false});
                    }}
                    navigateToProviders={this.navigateToProviders}
                    navigateToServices={this.navigateToServices}
                />
            </>

        );
    };
}


const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 22,
        paddingRight: 18,
        height: HEADER_SIZE,
    },
    moreIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30,
    },
    titleWrap: {
        padding: 24,
    },
    mainHeading: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH1,
        ...TextStyles.mediaTexts.serifProExtraBold,
        marginBottom: 8,
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
    },
    infoListWrap: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24
    },
    infoHeading: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.overlineTextS,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    counterWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        // marginVertical: 16
    },
    singleCount: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    pinkText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        marginRight: 8,
    },
    blackText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
    },
    greBtns: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        ...CommonStyles.styles.stickyShadow
    },
    singleGreBtn: {
        marginBottom: 16,
    },
    singleAction: {
        marginBottom: 16,
    },
});
export default connectAppointments()(NewApptDetailsScreen);
