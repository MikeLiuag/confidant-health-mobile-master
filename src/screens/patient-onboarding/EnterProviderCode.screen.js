import React, {Component} from 'react';
import {StatusBar, StyleSheet, KeyboardAvoidingView, ScrollView, Keyboard,Image, Platform} from 'react-native';
import {Container,Text, View, Content } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton,
    TextStyles, FloatingInputField, CommonStyles, Provider_Code_Input_Label, Provider_Code_Input_Error } from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {DEFAULT_AVATAR_COLOR, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {AlertUtil} from "ch-mobile-shared";
import ProfileService from "../../services/Profile.service";
import Loader from "../../components/Loader";
import {connectAuth} from "../../redux";
import Analytics from "@segment/analytics-react-native";

class EnterProviderCodeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.profileImage = navigation.getParam('profileImage', null);
        this.state = {
            hasCodeError: null,
            codeFocus: false,
            providerCode: '',
            provider:null,
            validCode: false,
            keyboardOpen: false
        };
        this.form = {
            submitBtn: null
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    focusCode = () => {
        this.setState({codeFocus: true});
    };

    onChangeText = (providerCode) => {
        this.setState({hasCodeError: null,providerCode: providerCode.trim()});
    };

    addProvider = () => {
        this.form.submitBtn.props.onPress();
    };

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

    navigateToNextScreen = async () => {

        if (!this.state.validCode) {
            await this.validateProviderCode();
        }else{
            await this.sendResponse();
        }
    };

    navigateToSignUpNotificationScreen = ()=>{
        this.props.navigation.navigate(Screens.SIGNUP_NOTIFICATION_SCREEN);
    };

    sendResponse = async () => {
        try {
            this.setState({isLoading: true});
            const postOnboardPayload = {
                providerId: this.state.provider ? this.state.provider.userId : null,
                profileImage: this.profileImage
            };

            const onBoardRequestBody = {
                profile: postOnboardPayload,
                file: null,
            };
            const response = await ProfileService.patientOnBoarding(onBoardRequestBody);
            if (response.errors) {
                this.setState({isLoading: false});
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                this.props.onUserOnboarded({
                    nickName: this.props.auth.meta.nickname,
                });
                Analytics.identify(this.props.auth.meta.userId, {
                    "hasSuccessfullyOnboarded": true
                });
                await AlertUtil.showSuccessMessage('Patient onboarded successfully');
                setTimeout(() => {
                    this.navigateToSignUpNotificationScreen();
                }, 100);
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage('Something went wrong, please try later');
        }
    };
    clearText = (stateKey) => {
        const  {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };

    validateProviderCode = async () => {
        this.setState({codeFocus: false});
        let hasCodeError = false;
        if (this.state.providerCode.length !== 6) {
            AlertUtil.showErrorMessage('Code must be 6 characters long');
            hasCodeError = true;
            this.setState({hasCodeError: hasCodeError, provider: null, validCode: false});
        }
        this.setState({isLoading: true, hasCodeError: false,provider: null});
        const provider = await ProfileService.searchProviderByCode(this.state.providerCode);
        if (provider.errors) {
            AlertUtil.showErrorMessage(provider.errors[0].endUserMessage);
            hasCodeError = true;
            this.setState({isLoading: false, hasCodeError: hasCodeError, validCode: false});
        } else {
            provider.profileImage = provider.profileImage ? S3_BUCKET_LINK + provider.profileImage : provider.profileImage;
            if (!provider.profileImage) {
                provider.colorCode = DEFAULT_AVATAR_COLOR;
            }
            hasCodeError = false;
            this.setState({provider, isLoading: false, hasCodeError: hasCodeError, validCode: true});
        }
        return !hasCodeError;
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if(this.state.isLoading){
            return <Loader/>
        }
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
                        {
                            this.state.validCode ?
                                <View style={styles.textBox}>
                                    <View style={{...CommonStyles.styles.letterWrapper}}>
                                        {this.state.provider.profileImage ?
                                            <Image
                                                {...addTestID('Profile-png')}
                                                style={styles.proImg}
                                                resizeMode={'contain'}
                                                source={{uri: this.state.provider.profileImage}}/>
                                            :
                                            <View style={{
                                                ...CommonStyles.styles.blueProBG,
                                                backgroundColor: this.state.provider.colorCode ? this.state.provider.colorCode : DEFAULT_AVATAR_COLOR
                                            }}>
                                                <Text
                                                    style={{...CommonStyles.styles.proLetterInBox}}>{this.state.provider.fullName.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        }
                                    </View>
                                    <Text style={styles.magicMainText}>
                                        Congratulations!
                                    </Text>
                                    <Text style={styles.magicSubText}>
                                        You’re now connected with {this.state.provider.fullName}, Therapist.
                                    </Text>
                                </View>
                                :
                                <View style={styles.textBox}>
                                    <Image
                                        {...addTestID('Provider-Icon-png')}
                                        style={styles.signInIcon}
                                        source={require('../../assets/images/Magic-Link-Icon.png')}/>
                                    <Text
                                        {...addTestID('Heading-1')}
                                        style={styles.magicMainText}>
                                        Do you already have a provider you’ve been speaking with?
                                    </Text>
                                    <Text
                                        {...addTestID('Heading-2')}
                                        style={styles.magicSubText}>
                                        You can add them using their provider code here. Don’t worry if you don’t -
                                        we can always connect you with someone in the future.
                                    </Text>
                                </View>
                        }

                    </Content>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <View style={styles.zipBox}>
                            <FloatingInputField
                                testId={'Provider-code-input'}
                                hasError={this.state.hasCodeError}
                                hasFocus={this.state.codeFocus}
                                keyboardType={'default'}
                                blur={this.validateProviderCode}
                                focus={this.focusCode}
                                changeText={this.onChangeText}
                                returnKeyType={'next'}
                                submitEditing={this.addProvider}
                                value={this.state.providerCode}
                                labelErrorText={Provider_Code_Input_Error}
                                labelText={Provider_Code_Input_Label}
                                inputIconType={'Feather'}
                                inputIconName={'user'}
                                editable={true}
                                clearText={()=>{this.clearText("providerCode")}}
                            />
                        </View>
                        <PrimaryButton
                            testId = "continue"
                            disabled={!this.state.providerCode}
                            onPress={() => this.navigateToNextScreen()}
                            ref={btn => {
                                this.form.submitBtn = btn;
                            }}
                            text="Continue"
                        />
                        {!this.state.validCode ?
                            <Text
                                {...addTestID('provider-code-link')}
                                onPress={()=>this.sendResponse()} style={{...CommonStyles.styles.blueLinkText}}>I don’t have a provider’s code</Text> : null}
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    proImg: {
        width: 130,
        height: 130
    },
    textBox: {
        alignItems: 'center',
        paddingTop: isIphoneX()? 124 : 100,
        paddingLeft: 40,
        paddingRight: 40,
        marginBottom: 20
    },
    signInIcon: {
        marginBottom: 10
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
    },
    zipBox: {
        marginBottom: 16
    }
});

export default connectAuth()(EnterProviderCodeScreen);
