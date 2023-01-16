import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {TelehealthPermissionComponent} from 'ch-mobile-shared';
import AuthStore from './../../utilities/AuthStore';
import {connectAuth} from '../../redux';


class TelehealthWelcomeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.sessionId = navigation.getParam('sessionId', null);
        this.token = navigation.getParam('token', null);
        this.sessionStarted = navigation.getParam('sessionStarted', null);
        this.encounterId = navigation.getParam('encounterId', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.groupCall = navigation.getParam('groupCall', false);
        this.connection = navigation.getParam('connection', null);

        this.state = {
             isLoading: false,
        };
    }

    componentWillUnmount(): void {
        AuthStore.deleteTempSession().then(()=>{
            console.log('Temp Session Deleted');
        }).catch((error)=>{
            console.log('No Temp Session');
        });
    }


    navigateVideoCall = async () => {
        if(this.groupCall) {
            this.props.navigation.replace(Screens.GROUP_CALL_SCREEN, {
                connection: this.connection
            })
        } else {
            this.props.navigation.replace(Screens.TELE_SESSION_V2, {
                appointment: this.appointment,
                sessionId: this.sessionId,
                token: this.token,
                sessionStarted: this.sessionStarted,
                encounterId: this.encounterId,
                referrerScreen: this.referrerScreen
            })
        }

    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigatingToSettings = () => {
        AuthStore.setSessionDetails({
            sessionId: this.sessionId,
            appointment: this.appointment,
            token: this.token,
            sessionStarted: this.sessionStarted,
            encounterId: this.encounterId,
            groupCall: this.groupCall,
            connection: this.connection
        }).then(() => {
            console.log('Current Session Stored Temporarily');
        });
    };

    render() {

        return (
            <TelehealthPermissionComponent
                backClicked={this.backClicked}
                socketConnected={this.props.auth.socketConnected}
                navigatingToSettings={this.navigatingToSettings}
                navigateToTelehealth={this.navigateVideoCall}
            />
        );
    };


}
export default connectAuth()(TelehealthWelcomeScreen);
