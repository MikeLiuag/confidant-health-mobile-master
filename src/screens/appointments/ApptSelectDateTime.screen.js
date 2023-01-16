import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import AppointmentService from "../../services/Appointment.service";
import {connectAppointments} from "../../redux";
import {SelectDateTimeV2Component} from 'ch-mobile-shared';


class AppointmentSelectDateTimeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.updateAppointment = navigation.getParam('updateAppointment', null);
        this.selectedProvider = navigation.getParam('selectedProvider', null);
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.state = {};
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToRequestApptConfirmDetailsScreen = (selectedService,selectedSchedule,selectedProvider) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN,{selectedService,selectedSchedule,selectedProvider})
    };

    navigateToAppointmentDetailsScreen = (originalAppointment,appointmentDetail,selectedService,selectedSchedule,selectedProvider) =>{
        let appointment = appointmentDetail;
        if(this.updateAppointment) {
            this.props.navigation.navigate(Screens.NEW_APPT_DETAILS_SCREEN,{appointment,selectedService,selectedSchedule,selectedProvider})
        } else {
            this.props.navigation.navigate(Screens.APPOINTMENT_DETAILS_SCREEN,{appointment,selectedService,selectedSchedule,selectedProvider})
        }

    }

    render = () => {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SelectDateTimeV2Component
                originalAppointment={this.originalAppointment}
                selectedMember={this.selectedProvider}
                selectedService={this.selectedService}
                backClicked={this.backClicked}
                getAvailableSlots={AppointmentService.getAvailableSlots}
                getMasterSchedule={AppointmentService.getMasterSchedule}
                appointments={this.props.appointments.appointments}
                navigateToRequestApptConfirmDetailsScreen={this.navigateToRequestApptConfirmDetailsScreen}
                navigateToAppointmentDetailsScreen={this.navigateToAppointmentDetailsScreen}
                updateAppointment={this.updateAppointment}
                memberId = {this.props?.auth?.meta?.userId}
                isMemberApp={true}
            />
        );
    };
}


export default connectAppointments()(AppointmentSelectDateTimeScreen);
