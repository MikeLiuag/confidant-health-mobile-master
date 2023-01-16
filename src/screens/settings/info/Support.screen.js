import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {SupportInfoComponent} from 'ch-mobile-shared';

export default class Support extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SupportInfoComponent
                goBack={this.backClicked}/>
        );
    }
}
