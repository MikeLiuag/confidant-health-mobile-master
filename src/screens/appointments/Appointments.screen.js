import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {connectAppointments} from './../../redux';
import alfie from "../../assets/animations/Dog_Calendar";
import {Container, Text, View} from 'native-base';
import {
    AlertUtil,
    AppointmentsV2Component,
    Colors,
    getDateDesc,
    getDurationText,
    getHeaderHeight,
    getTimeFromMilitaryStamp,
    isMissed,
    TextStyles
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import Analytics from '@segment/analytics-react-native';
import {APPOINTMENT_STATUS, DEFAULT_AVATAR_COLOR, SEGMENT_EVENT} from '../../constants/CommonConstants';
import DeepLinksService from '../../services/DeepLinksService';
import moment from 'moment';
import AppointmentService from '../../services/Appointment.service';
import LottieView from 'lottie-react-native';
import {PrimaryButton} from 'ch-mobile-shared/src/components/PrimaryButton';
import {BookAppointmentModal} from '../../components/appointment/BookAppointmentModal';

const HEADER_SIZE = getHeaderHeight();

class AppointmentsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            modalVisible: true,
            activeSegmentId: null,
            filteredAppointments: null,
            bookModalVisible: false
        };
    }


    addEventToCalendar = async (appointment) => {
        const eventConfig = {
            title: 'Appointment with ' +
                appointment.participantName,
            startDate: appointment.startTime,
            endDate: appointment.endTime, appointmentId: appointment.appointmentId,
        };

        const url = await DeepLinksService.appointmentLink(eventConfig, appointment);
        eventConfig.notes = url;
        this.props.addToCalender(
            eventConfig,
        );
    };

    showBookOptions = () => {
        if (this.props.profile.patient.isPatientProhibitive) {
            this.navigateToProhibitiveScreen()
        } else {
            this.setState({bookModalVisible: true})
        }
    };
    navigateToProhibitiveScreen = () => {
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }

    componentDidMount(): void {
        this.appointmentRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.props.fetchAppointments();
            },
        );
    }

    componentWillUnmount(): void {
        if (this.appointmentRefresher) {
            this.appointmentRefresher.remove();
        }
    }

    showAppointmentDetails = (appointment) => {
        // this.props.navigation.navigate(Screens.APPOINTMENT_DETAILS_SCREEN, {
        //     appointment,
        // });

        this.props.navigation.navigate(Screens.NEW_APPT_DETAILS_SCREEN, {
            appointment,
            onConfirmOrRequestAppointmentByMember: this.confirmAppointmentByMember,
        });

        // this.props.navigation.navigate(Screens.COMPLETED_SESSION, {
        //     appointment
        // })
    };

    onClose = () => {
        this.setState({modalVisible: false});
    };

    findAvatarColorCode = (connectionId) => {

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR;

    };

    getAppointments = (appts) => {
        if (this.props.appointments.isLoading || this.props.connections.isLoading) {
            return [];
        }
        let appointments = appts || this.props.appointments.appointments;
        if (appointments && appointments.length > 0) {
            appointments = appointments.map((item) => {
                if (!item.avatar) {
                    item.colorCode = this.findAvatarColorCode(item.participantId);
                }
                return item;

            });
        }
        return appointments;
    };

    propagate = (data) => {
        this.setState({filteredAppointments: data.appointments});
    };


    navigateToNextScreen = () => {

        if (!this.props.profile.isLoading) {
            this.props.navigation.navigate(Screens.SERVICE_LIST_SCREEN);
        }
    };

    getSegmentedAppointments = (appointments) => {
        const segments = {
            pending: [],
            current: [],
            past: [],
        };
        appointments.forEach(appointment => {
            if (appointment.status === 'NEEDS_ACTION') {
                segments.pending.push(appointment);
            } else {
                if (appointment.status === 'FULFILLED' || appointment.status === 'CANCELLED' || (appointment.status === 'BOOKED' && isMissed(appointment))) {
                    segments.past.push(appointment);
                } else {
                    segments.current.push(appointment);
                }

            }
        });
        return segments;
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


    confirmAppointment = async (appointment) => {
        this.setState({isLoading: true});
        const endMoment = moment(appointment.endTime);
        const startMoment = moment(appointment.startTime);
        const start = startMoment.format('HHmm');
        const end = endMoment.format('HHmm');
        const slotStartTime = getTimeFromMilitaryStamp(start);
        const slotEndTime = getTimeFromMilitaryStamp(end);
        const selectedSchedule = {
            dayDateText: getDateDesc(startMoment),
            slotStartTime, slotEndTime,
        };
        const selectedService = {
            cost: appointment.serviceCost,
            recommendedCost: appointment.recommendedCost,
            marketCost: appointment.marketCost,
            id: appointment.serviceId,
            durationText: getDurationText(appointment.serviceDuration),
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
        this.setState({appointment, isLoading: false});
        if (appointment && appointment.prePayment) {
            await this.confirmAppointmentByMember(null);
        } else {
            this.props.navigation.navigate(Screens.NEW_APPT_DETAILS_SCREEN, {
                appointment
            });
        }
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

    navigateToProviders = () => {
        if (this.props.profile.patient.isPatientProhibitive) {
            this.navigateToProhibitiveScreen()
        } else {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                isProviderFlow: true,
            });
        }
    };

    navigateToServices = () => {
        if (this.props.profile.patient.isPatientProhibitive) {
            this.navigateToProhibitiveScreen()
        } else {
            this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
                isProviderFlow: false,
            });
        }
    };

    getEmptyMessages = () => {
        let emptyStateMsg = '';
        let emptyStateHead = '';
        switch (this.state.activeSegmentId) {
            case 'current': {
                emptyStateHead = 'No current appointments';
                emptyStateMsg = 'You have no current appointments. If you don’t think this is right, then check your scheduled appointments or reach out to your provider.';
                break;
            }
            case 'past': {
                emptyStateHead = 'No past appointments';
                emptyStateMsg = 'You have no completed appointments. If you don’t think this is right, then check your scheduled appointments or reach out to your provider.';
                break;
            }
        }
        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
                <View style={styles.bookBtn}>
                    <PrimaryButton
                        onPress={this.showBookOptions}
                        text={'Book appointment'}
                    />
                </View>
            </View>
        );
    };


    render = () => {
        StatusBar.setBarStyle('dark-content', true);
        const loaders = {
            current: this.props.appointments.isCurrentLoading,
            past: this.props.appointments.isPastLoading,
            pending: this.props.appointments.isCurrentLoading,
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <AppointmentsV2Component
                    loaders={loaders}
                    currentAppointments={this.props.appointments.currentAppointments}
                    pastAppointments={this.props.appointments.pastAppointments}
                    connections={this.props.connections}
                    showAppointmentDetails={this.showAppointmentDetails}
                    confirmAppointment={this.confirmAppointment}
                    refreshing={this.props.appointments.isSilentLoading}
                    refreshAppointments={this.props.fetchAppointmentsSilently}
                    startBookingFlow={this.showBookOptions}
                />


                {/*{this.props.appointments.isSilentLoading && <ActivityIndicator size={'large'}/>}*/}
                {/*{*/}
                {/*        <Content contentContainerStyle={{padding: 24}}>*/}

                {/*            {*/}
                {/*                segmentedAppointments[this.state.activeSegmentId] && (*/}
                {/*                    <View>*/}
                {/*                        {*/}
                {/*                            segmentedAppointments[this.state.activeSegmentId].length===0*/}
                {/*                                ? this.getEmptyMessages()*/}
                {/*                                :segmentedAppointments[this.state.activeSegmentId].map(appointment => {*/}

                {/*                                let statusToggle = false;*/}
                {/*                                let apptStatusText = '';*/}
                {/*                                let apptStatusBg = Colors.colors.highContrastBG;*/}
                {/*                                let statusTextColor = Colors.colors.mediumContrast;*/}
                {/*                                if (appointment.status === 'CANCELLED') {*/}
                {/*                                    statusToggle = true;*/}
                {/*                                    apptStatusText = 'Canceled appointment';*/}
                {/*                                    apptStatusBg = Colors.colors.highContrastBG;*/}
                {/*                                    statusTextColor = Colors.colors.mediumContrast;*/}
                {/*                                } else if (appointment.status === 'BOOKED' && isMissed(appointment)) {*/}
                {/*                                    statusToggle = true;*/}
                {/*                                    apptStatusText = 'You missed this appointment';*/}
                {/*                                    apptStatusBg = Colors.colors.secondaryColorBG;*/}
                {/*                                    statusTextColor = Colors.colors.secondaryText;*/}
                {/*                                } else if (appointment.status === 'PROPOSED') {*/}
                {/*                                    statusToggle = true;*/}
                {/*                                    apptStatusText = 'Requested appointment';*/}
                {/*                                    apptStatusBg = Colors.colors.highContrastBG;*/}
                {/*                                    statusTextColor = Colors.colors.mediumContrast;*/}
                {/*                                }*/}
                {/*                                return (*/}
                {/*                                    <CommonAppointmentBox*/}
                {/*                                        key={appointment.appointmentId}*/}
                {/*                                        appointment={appointment}*/}
                {/*                                        onPress={() => {*/}
                {/*                                            this.showAppointmentDetails(appointment);*/}
                {/*                                        }}*/}
                {/*                                        apptStatus={statusToggle}*/}
                {/*                                        apptStatusText={apptStatusText}*/}
                {/*                                        apptStatusBg={apptStatusBg}*/}
                {/*                                        onChange={() => {*/}
                {/*                                            this.showAppointmentDetails(appointment);*/}
                {/*                                        }}*/}
                {/*                                        onConfirm={() => {*/}
                {/*                                            this.confirmAppointment(appointment);*/}
                {/*                                        }}*/}
                {/*                                        statusTextColor={statusTextColor}*/}
                {/*                                        today={appointment.status === 'BOOKED' && moment().isSame(moment(appointment.startTime), 'days') && !isMissed(appointment)}*/}
                {/*                                        rating={appointment.feedback && appointment.feedback.rating}*/}
                {/*                                        confirmed={this.state.activeSegmentId === 'current' && appointment.status === 'BOOKED' && !isMissed(appointment)}*/}
                {/*                                        buttonOptions={this.state.activeSegmentId === 'pending'}*/}
                {/*                                    />);*/}
                {/*                            })*/}
                {/*                        }*/}

                {/*                    </View>*/}
                {/*                )*/}
                {/*            }*/}

                {/*    </Content>*/}

                {/*}*/}

                {/*    <AppointmentsListComponent*/}
                {/*    isLoading={this.props.appointments.isLoading || this.props.connections.isLoading}*/}
                {/*    showDetails={this.showAppointmentDetails}*/}
                {/*    addToCalendar={this.addEventToCalendar}*/}
                {/*    error={this.props.appointments.error}*/}
                {/*    fetch={this.props.fetchAppointments}*/}
                {/*    goBack={this.props.navigation.goBack}*/}
                {/*    appointments={appointments}*/}
                {/*    showBookDrawer={this.showBookOptions}*/}
                {/*/>*/}

                {/*<SearchFloatingButton*/}
                {/*    icon="plus"*/}
                {/*    onPress={() => {*/}
                {/*        // Analytics.track('Member Started New Appointment Flow', {*/}
                {/*        //     source: 'Appointment List Screen'*/}
                {/*        // });*/}
                {/*        this.showBookOptions();*/}
                {/*    }}*/}
                {/*    isFiltering={false}*/}
                {/*/>*/}

                <BookAppointmentModal
                    visible={this.state.bookModalVisible}
                    onClose={() => {
                        this.setState({bookModalVisible: false});
                    }}
                    navigateToProviders={this.navigateToProviders}
                    navigateToServices={this.navigateToServices}
                />
            </Container>
        );
    };
}


const styles = StyleSheet.create({
    header: {
        // backgroundColor: "#fff",
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 18,
        elevation: 0,
        height: HEADER_SIZE,
    },
    bookActionList: {},
    singleAction: {
        marginBottom: 16,
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    bookBtn: {
        maxWidth: 240,
        alignSelf: 'center'
    },
});
export default connectAppointments()(AppointmentsScreen);
