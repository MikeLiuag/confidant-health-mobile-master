import React, {Component} from 'react';
import {StatusBar, StyleSheet, KeyboardAvoidingView, ScrollView, Keyboard,Image,Platform, Dimensions} from 'react-native';
import {Container, Text, View, Content } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    FloatingInputField,
    CommonStyles,
    Zip_Code_Input_Label,
    Zip_Code_Input_Error,
    State_Input_Error,
    State_Input_Label, DEFAULT_STATES_OPTIONS,
    BackButton
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {ZIP_CODE_REGEX} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";
import {DropDownInputField} from 'ch-mobile-shared/src/components/DropDownInputField';
import {UPDATE_PROFILE_DROPDOWN_TYPES} from 'ch-mobile-shared/src/constants';

const windowHeight = Dimensions.get('window').height;

export default class SelectStateScreen extends Component<Props> {
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
            keyboardOpen: false,
            state: ''
        };
        this.form = {
            submitBtn: null
        };
    }


    clearText = (stateKey) => {
        const  {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };
    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
            this.props.navigation.navigate(Screens.EXCLUSION_CRITERIA_SCREEN, {
                ...this.props.navigation.state.params,
                state: this.state.state,
            });
    };

    onChangeStateText = (state) => {
        this.setState({hasStateError: null, state: state});
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
                    <View style={styles.backButtonWrapper}>
                        <BackButton
                            onPress={this.backClicked}
                        />
                    </View>
                    {/*<Image*/}
                    {/*    {...addTestID('Sign-up-png')}*/}
                    {/*    style={{...CommonStyles.styles.signInUpBG}}*/}
                    {/*    source={require('../../assets/images/signin-bg.png')}/>*/}
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            <Image
                                {...addTestID('Zip-code-png')}
                                style={styles.signInIcon}
                                source={require('../../assets/images/new-Location-icon2.png')} />
                            <Text
                                {...addTestID('Heading-1')}
                                style={styles.magicMainText}>
                                What state do you live in?
                            </Text>
                            <Text
                                {...addTestID('Heading-2')}
                                style={styles.magicSubText}>
                                We want to connect you to the best local resources.
                            </Text>
                        </View>

                    </Content>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <View style={{  marginBottom: 16 }}>
                            <DropDownInputField
                                testId={'state-input'}
                                hasError={false}
                                hasFocus={false}
                                keyboardType={'default'}
                                onChange={this.onChangeStateText}
                                getRef={field => {
                                    this.form.stateField = field;
                                }}
                                value={this.state.state}
                                labelErrorText={State_Input_Error}
                                label={"Select your state"}
                                editable={true}
                                options={DEFAULT_STATES_OPTIONS}
                                type={"Select your state"}
                                dropDownIconColor={Colors.colors.mainBlue}
                            />
                        </View>
                        <PrimaryButton
                            testId = "continue"
                            disabled={this.state.state===''}
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
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        // paddingTop: isIphoneX()? 124 : 100,
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 50,
        // minHeight: windowHeight - 250,
        flex: 1
    },
    signInIcon: {
        marginBottom: 40,
        width: 153,
        height: 153
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
