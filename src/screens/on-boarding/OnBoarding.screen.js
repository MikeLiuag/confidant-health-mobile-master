import React, { Component } from 'react';
import { Screens } from '../../constants/Screens';
import OnBoardingSlider from '../../components/on-boarding/OnBoardingSlider';
import AuthStore from './../../utilities/AuthStore';
import {LOGGED_OUT} from "../../constants/CommonConstants";

export default class OnBoardingScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state={
            isLoading: true
        }
    }
    async componentWillMount(): void {
        const authToken = await AuthStore.getAuthToken();
        if (authToken && authToken!== LOGGED_OUT) {
            this.props.navigation.replace(Screens.MAGIC_LINK_SCREEN);
        } else {
            this.setState({isLoading: false});
        }
    }

    render() {
        if(this.state.isLoading) {
            return null;
        }
        return (
            <OnBoardingSlider
                onSkip={()=> {this.getStarted()}}
                onLogin={()=> {this.onLogin()}}
            />
        );
    }

    getStarted = () => {
        this.props.navigation.replace(Screens.ENTER_NAME_SCREEN);
    };
    onLogin = () => {
        this.props.navigation.replace(Screens.MAGIC_LINK_SCREEN);
    };
}
