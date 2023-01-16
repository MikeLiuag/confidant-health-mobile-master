import React, { Component }  from 'react';
import { StyleSheet, AppState } from 'react-native';
import {
    View,
    Text
} from 'native-base';
import LottieView from 'lottie-react-native';
import alfieFace from '../assets/animations/alfie-face-new';

export default class HeaderAlfie extends Component{

    constructor(props){
        super(props);
        this.state= {
            appState : AppState.currentState
        }
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if(this.state.appState === 'active') {
            if(this.animation) {
                this.animation.play();
            }
        }
    }

    render() {
        return(
            <View style={styles.alfieBox}>
                {/*{ Platform.OS === 'ios' ?*/}
                {/*<LottieView style={ styles.alfieAnim}*/}
                {/*    source={alfieFace} autoPlay loop /> :*/}
                {/*    <Image source={require('./../assets/images/alfie.png')}/>*/}
                {/*}*/}
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={ styles.alfieAnim}
                            source={alfieFace} autoPlay loop />
                <Text style={styles.alfieText}>Great to see you again!</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    alfieBox: {
        alignItems: 'center'
    },
    alfieAnim: {
        width: 115,
        height: 115,
    },
    alfieText: {
        fontFamily: 'Roboto-Italic',
        fontSize: 18,
        lineHeight: 27,
        fontWeight: '500',
        color: '#27355d',
        textAlign: 'center',
        fontStyle: 'italic',
        letterSpacing: 0.79
    },
})
