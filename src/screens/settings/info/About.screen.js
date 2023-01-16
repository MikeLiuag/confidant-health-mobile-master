import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AboutInfoComponent} from 'ch-mobile-shared';

export default class About extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };


    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <AboutInfoComponent
                goBack={this.backClicked}/>
        );
    }
}
