import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    BackButton,
    FloatingInputField,
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {ConsentContent} from '../../components/ConsentContent';
import Modal from 'react-native-modalbox';
import {PrivacyContent} from '../../components/PrivacyContent';

const windowHeight = Dimensions.get('window').height;

export default class PrivacyDisclosureScreen extends React.PureComponent<Props>{
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            privacyDrawer: false,
            name: ''
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = async () => {
        //this.privacyDrawerClose();
        this.props.navigation.navigate(Screens.CHOOSE_PATH_SCREEN, {
            ...this.props.navigation.state.params
        });
    };

    privacyDrawerClose = ()=>{
        this.setState({
            privacyDrawer: false
        })
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
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
                        <Image
                            {...addTestID('lock-icon-png')}
                            style={styles.signInIcon}
                            source={require('../../assets/images/new-Secure-icon2.png')} />
                        <Text style={styles.privacyMainText}>We always keep your information secure.</Text>
                        <Text style={styles.privacySubText}>We will never share your information without your consent, ever.</Text>
                    </View>
                </Content>
                <View style={styles.greBtn}>
                    <Text style={styles.linkTextMain}> By clicking continue, you accept the Confidant Health
                        <Text {...addTestID('click-privacy-policy')} style={styles.linkText} onPress={() => this.props.navigation.navigate(Screens.PRIVACY_POLICY_SCREEN)}> Privacy Policy </Text>
                        and<Text {...addTestID('click-terms-and-conditions')} style={styles.linkText} onPress={() => this.props.navigation.navigate(Screens.TERMS_OF_SERVICE_SCREEN)} > Terms and Conditions.</Text>
                    </Text>
                    <PrimaryButton
                        arrowIcon={false}
                        onPress={()=>{
                            this.navigateToNextScreen();
                            /*this.setState({
                                privacyDrawer: true
                            })*/
                        }}
                        text="Continue"
                    />
                </View>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.privacyDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '77%', backgroundColor: Colors.colors.screenBG }}
                    entry={"bottom"}
                    isOpen={this.state.privacyDrawer}
                    position={"bottom"}  swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <KeyboardAvoidingView
                        style={{flex: 1, bottom: 0}}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <PrivacyContent/>
                            <View>
                                <FloatingInputField
                                    testId={'name-input'}
                                    keyboardType={'default'}
                                    changeText={(name)=>{
                                        this.setState({name});
                                    }}
                                    returnKeyType={'done'}
                                    value={this.state.name}
                                    // labelErrorText={'Incorrect name'}
                                    labelText={'Your full name'}
                                    editable={true}
                                />
                            </View>
                            <View style={styles.btnWrap}>
                                <PrimaryButton
                                    onPress={() => this.navigateToNextScreen()}
                                    disabled={this.state.name===''}
                                    text={'I agree'}
                                />
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>

                </Modal>
            </Container>
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
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
        flex: 1
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    privacyMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    privacySubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    linkTextMain: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        textAlign: 'center',
        color: Colors.colors.mediumContrast,
        marginBottom: 24
    },
    linkText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.primaryText
    },
    greBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
    btnWrap: {
        paddingTop: 24,
        paddingBottom: isIphoneX()? 34 : 24
    }
});
