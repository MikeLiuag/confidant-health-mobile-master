import React from 'react';
import {NativeModules, Image, Linking, StatusBar, StyleSheet, View,Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Container, Content, Text} from 'native-base';
import {addTestID, HttpClient, isIphoneX} from 'ch-mobile-shared';
import {HEADER_NORMAL, HEADER_X} from '../constants/CommonConstants';
import LottieView from 'lottie-react-native';
import alfie from '../assets/animations/alfie-face-new';
import RNRestart from 'react-native-restart';
import SplashScreen from "react-native-splash-screen";
import NavigationService from '../services/NavigationService'; // Import package from node modules
const AnimatedSplash = NativeModules.AnimatedSplash;

// Immediately reload the React Native Bundle

const HEADER_SIZE = isIphoneX() ? HEADER_X : HEADER_NORMAL;
export class MainErrorView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            descShown: false
        };
        this.currentRouteParams = NavigationService.getCurrentRouteParams();
    }




    componentDidMount(): void {
        this.hideSplash();
    }

    hideSplash = ()=>{
        SplashScreen.hide();
        if(Platform.OS==='ios') {
            AnimatedSplash.hide();
        }
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Content>
                        <View style={styles.textBox}>
                            <Image
                                {...addTestID('Sign-up-png')}
                                stle={styles.blueBg}
                                source={require('../assets/images/sign-up-bg.png')}/>
                        <View style={styles.alfieWrapper}>
                            <LottieView
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                style={styles.alfie}
                                resizeMode="cover"
                                source={alfie}
                                autoPlay={true}
                                loop
                            />
                        </View>
                        <View style={styles.errorText}>
                            <Text style={{textAlign: 'center', lineHeight: 25}}>Something went wrong. We're unable to proceed you further.</Text>
                            {
                                this.state.descShown && (
                                    <View>
                                        <Text style={{margin: 10}}>
                                            {this.currentRouteParams?'The error corresponding screen is ' + this.currentRouteParams.routeName: ''}
                                        </Text>
                                        <Text style={{margin: 10}}>
                                            {this.props.errorDesc?this.props.errorDesc: ''}
                                        </Text>
                                        <Text style={{margin: 10}}>
                                            {this.props.error?this.props.error: ''}
                                        </Text>
                                    </View>

                                )
                            }

                            <Text onPress={()=>{
                                this.setState({
                                    descShown: !this.state.descShown
                                })
                            }} style={{marginTop: 20, fontFamily: 'Roboto-Regular',
                                fontSize: 16,
                                color: '#3fb2fe',}}>{this.state.descShown?'Hide Details': 'View Details'}</Text>

                        </View>
                    </View>
                    </Content>

                    <View style={styles.buttons}>
                        <Text onPress={()=>{
                            RNRestart.Restart();
                        }} style={{marginTop: 20, fontFamily: 'Roboto-Regular',
                            fontSize: 16,
                            color: '#3fb2fe',}}>Reload App</Text>

                        <Text onPress={()=>{
                            this.sendReportAsEmail();
                        }} style={{marginTop: 20, fontFamily: 'Roboto-Regular',
                            fontSize: 16,
                            color: '#3fb2fe',}}>Send Crash Report</Text>
                    </View>
                </LinearGradient>
            </Container>

        )

    }

    sendReportAsEmail = async ()=> {

        let url = `mailto:confidant-health@stellatechnology.com`;

        // Create email link query
        const routeName = this.currentRouteParams? ('The error appeared on screen ' + this.currentRouteParams.routeName) + '\n\n\n': '';
        const errorMessage = "Error Message: " + this.props.errorDesc + "\n\n\n";
        const stackTrace = "StackTrace: \n" + this.props.error + "\n\n";
        const reduxState = JSON.stringify(this.props.stateStore.getState());
        const query = HttpClient.generateQueryParams({
            subject: 'Member App Crashed',
            body: 'Here are the crash details: \n'
                + routeName + errorMessage + stackTrace + reduxState
        });

        if (query.length) {
            url += `${query}`;
        }

        // check if we can use this link
        const canOpen = await Linking.canOpenURL(url);

        if (!canOpen) {
            throw new Error('Provided URL can not be handled');
        }

        return Linking.openURL(url);
    }
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    errorText:{
        display: 'flex',

        justifyContent: 'center',
        alignItems : 'center',
    },
    buttons:{
        display : 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        margin:25,
    },
    alfieWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgba(0,0,0, 0.15)',
        borderRadius: 80,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 25,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.09)',
        marginBottom: 25,
        backgroundColor: '#fff',
        marginTop: -120
    },
    alfie: {
        width: 110,
        height: 110,
    },
    textBox: {
        marginTop: 30,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
})
