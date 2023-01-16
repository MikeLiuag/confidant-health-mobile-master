import React, {Component} from 'react';
import {StatusBar} from "react-native";
import ProfileService from "../../services/Profile.service";
import {AlertUtil, InvitationComponent} from "ch-mobile-shared";

export default class InvitationScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.invitationType = this.props.navigation.getParam('invitationType', null);
        this.state = {
            isLoading: false
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <InvitationComponent
                goBack={this.goBack}
                invitationType={this.invitationType}
                isLoading={this.state.isLoading}
                sendInvite={this.sendInvite}
            />
        );
    }

    sendInvite = async (invitationParams) => {

            this.setState({isLoading: true});
            let serviceCall = ProfileService.inviteProvider;
            if (this.invitationType === 'MEMBER') {
                serviceCall = ProfileService.inviteMember;
            }
            const response = await serviceCall(invitationParams);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage(response.message);
                this.goBack();
            }
    };

}
