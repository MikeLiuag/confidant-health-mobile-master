/**
 * Created by Sana on 6/10/2019.
 */
import React, {Component} from 'react';
import {StatusBar} from "react-native";
import {ProfileComponent} from "ch-mobile-shared";
import {USER_TYPE} from "../../constants/CommonConstants";
import {connectProfile} from "../../redux/modules/profile";

class UpdateProfileScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }

    updateProfile = async (profile) => {
        this.props.updateProfile(profile);
        this.props.fetchProfile();
        this.backClicked()
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ProfileComponent
                profile={this.props.profile.patient}
                userType={USER_TYPE}
                isLoading={this.props.profile.isLoading}
                backClicked={this.backClicked}
                updateProfile={this.updateProfile}
                error={this.props.profile.error}
            />
        );
    }

}
export default connectProfile()(UpdateProfileScreen);
