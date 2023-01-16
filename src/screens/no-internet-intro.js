import React, {Component} from 'react';
import {StatusBar, View, Text} from 'react-native';

export class NoInternetIntro extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        StatusBar.setBackgroundColor('transparent', true);
        return (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>Failed to connect to internet.</Text>
            <Text onPress={()=>{
                this.props.navigation.navigate('AuthLoading');
            }} style={{marginTop: 20, fontFamily: 'Roboto-Regular',
                fontSize: 16,
                color: '#3fb2fe',}}>Retry</Text>
        </View>);
    }
}
