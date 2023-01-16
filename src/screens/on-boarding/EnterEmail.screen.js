import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, AppState, KeyboardAvoidingView, Keyboard, Platform, NativeModules} from 'react-native';
import {Container, Text, View, Content } from 'native-base';
import {
    addTestID, isIphoneX,
    Colors, PrimaryButton, TextStyles, FloatingInputField, Nick_Name_Input_Error, BackButton, CommonStyles
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';

export default class EnterEmailScreen extends Component<Props> {

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.PRIVACY_DISCLOSURE_SCREEN);
    };
    skipNow = () => {

    }
    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <KeyboardAvoidingView
                style={{ flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.textBox}>
                            {/*<Image*/}
                            {/*    style={styles.signInIcon}*/}
                            {/*    source={require('../../assets/images/new-Welcome-icon-blue.png')}/>*/}
                            <Text style={styles.magicMainText}>
                                Please confirm your email, so we can save your progress in the app.
                            </Text>
                            <Text style={styles.magicSubText}>
                                We’ll send you a link to log in securely.
                            </Text>
                        </View>
                    </Content>

                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <View style={{ marginBottom: 16 }}>
                            {/*<FloatingInputField*/}
                            {/*    testId={'name-input'}*/}
                            {/*    hasError={this.state.hasNameError}*/}
                            {/*    hasFocus={this.state.nameFocus}*/}
                            {/*    keyboardType={'default'}*/}
                            {/*    blur={this.validateName}*/}
                            {/*    focus={this.focusName}*/}
                            {/*    changeText={this.onChangeText}*/}
                            {/*    returnKeyType={'next'}*/}
                            {/*    submitEditing={this.performLogin}*/}
                            {/*    value={this.state.nickname}*/}
                            {/*    labelErrorText={Nick_Name_Input_Error}*/}
                            {/*    labelText={"First name or Nickname"}*/}
                            {/*    inputIconType={'Feather'}*/}
                            {/*    inputIconName={'user'}*/}
                            {/*    editable={true}*/}
                            {/*    clearText={()=>{this.clearText("nickname")}}*/}
                            {/*/>*/}
                        </View>
                        <View style={{ marginBottom: 16 }}>
                            {/*<FloatingInputField*/}
                            {/*    testId={'name-input'}*/}
                            {/*    hasError={this.state.hasNameError}*/}
                            {/*    hasFocus={this.state.nameFocus}*/}
                            {/*    keyboardType={'default'}*/}
                            {/*    blur={this.validateName}*/}
                            {/*    focus={this.focusName}*/}
                            {/*    changeText={this.onChangeText}*/}
                            {/*    returnKeyType={'next'}*/}
                            {/*    submitEditing={this.performLogin}*/}
                            {/*    value={this.state.nickname}*/}
                            {/*    labelErrorText={Nick_Name_Input_Error}*/}
                            {/*    labelText={"First name or Nickname"}*/}
                            {/*    inputIconType={'Feather'}*/}
                            {/*    inputIconName={'user'}*/}
                            {/*    editable={true}*/}
                            {/*    clearText={()=>{this.clearText("nickname")}}*/}
                            {/*/>*/}
                        </View>
                        <View style={{ marginBottom: 16 }}>
                            {/*<FloatingInputField*/}
                            {/*    testId={'name-input'}*/}
                            {/*    hasError={this.state.hasNameError}*/}
                            {/*    hasFocus={this.state.nameFocus}*/}
                            {/*    keyboardType={'default'}*/}
                            {/*    blur={this.validateName}*/}
                            {/*    focus={this.focusName}*/}
                            {/*    changeText={this.onChangeText}*/}
                            {/*    returnKeyType={'next'}*/}
                            {/*    submitEditing={this.performLogin}*/}
                            {/*    value={this.state.nickname}*/}
                            {/*    labelErrorText={Nick_Name_Input_Error}*/}
                            {/*    labelText={"First name or Nickname"}*/}
                            {/*    inputIconType={'Feather'}*/}
                            {/*    inputIconName={'user'}*/}
                            {/*    editable={true}*/}
                            {/*    clearText={()=>{this.clearText("nickname")}}*/}
                            {/*/>*/}
                        </View>
                        <PrimaryButton
                            testId='continue'
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                            text="Continue"
                        />
                        <Text style={styles.emailBottomText}>Your email is confidential and never shared.</Text>
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    alfie: {
        width: 110,
        height: 110,
    },
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        marginTop: 40,
        marginBottom: 40,
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
    },
    emailBottomText:{
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.mediumContrast,
        marginTop: 32,
        textAlign: 'center',
    }
});

