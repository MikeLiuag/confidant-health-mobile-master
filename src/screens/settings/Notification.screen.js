import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AlertUtil, NotificationSettingsComponent} from 'ch-mobile-shared';
import SettingService from '../../services/SettingService';
import Loader from '../../components/Loader';


export default class NotificationScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            notificationSettings: {
                appointmentReminder: false,
                appointmentPreReminder: false,
                appointmentRequested: false,
                appointmentConfirmed: false,
                appointmentCancelled: false,
                appointmentFeedbackCompleted: false,
                groupCreated: false,
                groupMemberAdded: false,
                groupMemberRemoved: false,
                conversationCompleted: false,
                conversationPendingSince48Hours: false,
                chatMessageReceived: false,
                contentRead: false,
                contentPendingSince48Hours: false,
                conversationAssigned: false,
                contentAssigned: false
            }
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    async componentDidMount(): void {
        this.setState({
            isLoading: true
        })
        try {
            let data: any = await SettingService.getNotificationSettings();
            console.log(data);
            if (data.errors) {
                console.log(data.errors[0]);
                AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
                this.setState({
                    isLoading: false,
                    isError: data.errors[0]
                });
            } else {

                Object.keys(data).forEach(key=>{
                    if(data[key]===null) {
                        data[key] = false;
                    }
                });
                this.setState({
                    isLoading: false,
                    isError: false,
                    notificationSettings: data
                });
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false, isError: true});
        }
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading){
            return <Loader/>
        }
        return (
            <NotificationSettingsComponent
                backClicked={this.backClicked}
                notificationSettings={this.state.notificationSettings}
                type={'MEMBER'}
                isLoading={this.state.isLoading}
                updateNotificationSettings={SettingService.updateNotificationSettings}
            />
        );
    }
}

