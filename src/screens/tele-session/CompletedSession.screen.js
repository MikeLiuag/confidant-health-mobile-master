import React, {Component} from "react";
import {StatusBar} from "react-native";
import {Screens} from "../../constants/Screens";
import {TelehealthCompletedComponent} from "ch-mobile-shared";
import Analytics from "@segment/analytics-react-native";
import { SEGMENT_EVENT } from "../../constants/CommonConstants";

export default class CompletedSessionScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.name = navigation.getParam('name', null);
        this.sessionId = navigation.getParam("sessionId", null);
        this.providerId = navigation.getParam("providerId", null);
        this.appointment = navigation.getParam("appointment", null);
        this.appointmentId = this.appointment.appointmentId;
        this.encounterId = navigation.getParam("encounterId", null);
        this.delayedFeedback = navigation.getParam("delayedFeedback", false);
        this.segmentSessionCompletedPayload = navigation.getParam("segmentSessionCompletedPayload", null);
    }

    componentDidMount =()=> {
        if(this.segmentSessionCompletedPayload){
            Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_COMPLETED,this.segmentSessionCompletedPayload);
        }
    }

    navigateToSessionPaymentScreen = (reviewPayload,feedbackSkipped) => {
        this.props.navigation.replace(Screens.POST_SESSION_CONTRIBUTION_SCREEN, {
            ...this.props.navigation.state.params,
            ...reviewPayload,
            feedbackSkipped : feedbackSkipped
        });
    }


    navigateToPrivateFeedbackScreen = (reviewPayload)=>{
        this.props.navigation.navigate(Screens.PRIVATE_FEEDBACK_SCREEN, {
            ...this.props.navigation.state.params,
            ...reviewPayload
        });
    }

    navigateToNextScreen = (reviewPayload) => {
        this.navigateToPrivateFeedbackScreen(reviewPayload);
    };

    skipReview = () => {
        const reviewPayload = {
            reviewText: null,
            ratingScore: null,
            sessionConnected: false,
            sessionWorks: false
        };
        if (this.delayedFeedback) {
            this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
        } else {
            this.props.navigation.navigate(Screens.SESSION_REWARD_SCREEN, {
                appointment: this.appointment
            })
        }
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <TelehealthCompletedComponent
                skipReview={this.skipReview}
                shouldShowRating={true}
                name={this.name}
                isProviderApp={false}
                navigateToReview={this.navigateToNextScreen}
            />
        );
    };
}
