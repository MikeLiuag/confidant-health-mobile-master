import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AppointmentConfirmedComponent} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import {connectAppointments} from "../../redux";
import DeepLinksService from "../../services/DeepLinksService";

class AppointmentSubmittedScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.isRequest = navigation.getParam('isRequest', false);
        this.fixedProvider = navigation.getParam('fixedProvider', false);
        this.referrerScreen = navigation.getParam('referrerScreen', false);
        this.selectedProvider = navigation.getParam('selectedProvider', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.selectedSchedule = navigation.getParam('selectedSchedule', null);
        this.appointment = navigation.getParam('appointment', null);
    }

    goBack = () => {
        if (this.fixedProvider) {
            this.props.navigation.navigate(this.referrerScreen);
        } else {
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }

    };


    goToChat = () => {
        this.props.navigation.navigate(Screens.CHAT_CONTACT_LIST, {filterType: 'BOTS'})
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (<AppointmentConfirmedComponent
            done={this.goBack}
            isMemberApp={true}
            isRequest={this.isRequest}
            selectedProvider={this.selectedProvider}
            selectedService={this.selectedService}
            selectedSchedule={this.selectedSchedule}
            appointment={this.appointment}
            addToCalender={this.props.addToCalender}
            deepLinkService={DeepLinksService.appointmentLink}
            goToChat={this.goToChat}
        />);
    }
}

export default connectAppointments()(AppointmentSubmittedScreen);
