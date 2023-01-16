import React, {Component} from 'react';
import {StatusBar, StyleSheet, KeyboardAvoidingView, ScrollView, Keyboard,Image,Platform, Dimensions} from 'react-native';
import {Container, Text, View, Content } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton,
    TextStyles, FloatingInputField, CommonStyles, Zip_Code_Input_Label, Zip_Code_Input_Error } from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {ZIP_CODE_REGEX} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";

const windowHeight = Dimensions.get('window').height;

export default class EnterZipCodeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            hasZipError: null,
            zipFocus: false,
            zipCode:'',
            keyboardOpen: false
        };
        this.form = {
            submitBtn: null
        };
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount(): void {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
    };

    clearText = (stateKey) => {
        const  {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };
    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        if(this.validateZipCode()) {
            this.props.navigation.navigate(Screens.EXCLUSION_CRITERIA_SCREEN, {
                ...this.props.navigation.state.params,
                zipCode: this.state.zipCode,
            });
        }
    };


    validateZipCode = () => {
        this.setState({zipFocus: false});
        let hasZipError = false;
        const zipCode = this.state.zipCode;
        if (zipCode === null || zipCode === '') {
            hasZipError = true;
        } else if (zipCode && zipCode !== '') {
            hasZipError = !ZIP_CODE_REGEX.test(zipCode);
        }
        this.setState({hasZipError});

        return !hasZipError;
    };

    focusZip = () => {
        this.setState({zipFocus: true});
    };

    performLogin = () => {
        this.form.submitBtn.props.onPress();
    };

    onChangeText = (zipCode) => {
        this.setState({hasZipError: null ,zipCode : zipCode.trim()});
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <KeyboardAvoidingView
                style={{ flex:1, bottom: 0}}
                behavior={Platform.OS==='ios'?'padding':null}>
                <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Image
                        {...addTestID('Sign-up-png')}
                        style={{...CommonStyles.styles.signInUpBG}}
                        source={require('../../assets/images/signin-bg.png')}/>
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            <Image
                                {...addTestID('Zip-code-png')}
                                style={styles.signInIcon}
                                source={require('../../assets/images/new-Location-icon.png')} />
                            <Text
                                {...addTestID('Heading-1')}
                                style={styles.magicMainText}>
                                We’re happy
                                to help you with that.
                            </Text>
                            <Text
                                {...addTestID('Heading-2')}
                                style={styles.magicSubText}>
                                I can also connect you with resources where you live.
                            </Text>
                        </View>

                    </Content>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <View style={{  marginBottom: 16 }}>
                            <FloatingInputField
                                testId={'Zip-code-input'}
                                hasError={this.state.hasZipError}
                                hasFocus={this.state.zipFocus}
                                keyboardType={'numeric'}
                                blur={this.validateZipCode}
                                focus={this.focusZip}
                                changeText={this.onChangeText}
                                returnKeyType={'next'}
                                submitEditing={this.performLogin}
                                value={this.state.zipCode}
                                labelErrorText={Zip_Code_Input_Error}
                                labelText={Zip_Code_Input_Label}
                                inputIconType={'SimpleLineIcons'}
                                inputIconName={'location-pin'}
                                editable={true}
                                clearText={()=>{this.clearText("zipCode")}}
                            />
                        </View>
                        <PrimaryButton
                            testId = "continue"
                            disabled={!this.state.zipCode}
                            ref={btn => {
                                this.form.submitBtn = btn;
                            }}
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                            text="Continue"
                        />
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    textBox: {
        alignItems: 'center',
        paddingTop: isIphoneX()? 124 : 100,
        paddingLeft: 40,
        paddingRight: 40,
        marginBottom: 50,
        // minHeight: windowHeight - 250,
        flex: 1
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center',
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});
