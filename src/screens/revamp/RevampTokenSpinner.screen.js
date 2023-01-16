import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Container} from 'native-base';
import {Colors} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import {NavigationActions, StackActions} from "react-navigation";
import RevampTokenSpinnerComponent from "../../components/revamp-home/RevampTokenSpinnerComponent";


export default class RevampTokenSpinnerScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {};
    }

    navigateToNextScreen = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.TAB_VIEW})],
        });
        this.props.navigation.dispatch(resetAction);
    };

    render() {

        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <RevampTokenSpinnerComponent
                    navigateToNextScreen={this.navigateToNextScreen}
                />
            </Container>
        );
    };
}
