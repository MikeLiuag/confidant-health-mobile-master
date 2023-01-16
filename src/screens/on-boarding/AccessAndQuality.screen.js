import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {
    Colors,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from 'ch-mobile-shared';
import {Container, Content, Text} from 'native-base';
import {connectAuth} from '../../redux';
class AccessAndQualityScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }
    backClicked = () => {
        this.props.navigation.goBack();
    };

    nextStep = () => {
        this.props.navigation.navigate(Screens.PROFILE_IMAGE_SCREEN, {
            ...this.props.navigation.state.params,
        });
    };


    render() {

        return (
        <Container style={{ backgroundColor: Colors.colors.screenBG }}>
            <StatusBar
                backgroundColor="transparent"
                barStyle="dark-content"
                translucent
            />
            <View style={styles.backButtonWrapper}>
                {/*<BackButton*/}
                {/*    onPress={this.backClicked}*/}
                {/*/>*/}
            </View>
            <Content showsVerticalScrollIndicator={false}>
                <View style={styles.textBox}>
                    <View style={styles.sliderIconWrapper}>
                        <Image
                            style={[styles.providersIcon, { height: 150 }]}
                            source={require("../../assets/images/onBoarding-6.png")}
                            resizeMode={"contain"} />
                    </View>
                    <View style={styles.contentWrapper}>
                        <Text  style={styles.title}>
                            We’re excited you’re here. We work hard to give you the best experience possible.
                        </Text>
                        <Text style={{...styles.singleParah, marginBottom: 32}}>
                            At Confidant, there are no hidden fees or surprise bills. In fact, if you need some extra help, you can name your price for our services.
                        </Text>
                        <Text style={styles.singleParah}>
                            This is only possible because our amazing members believe everyone should have access to great care and contribute extra when they can.
                        </Text>
                    </View>
                </View>
            </Content>
            <View style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={false}
                    onPress={this.nextStep}
                />
            </View>
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
        marginBottom: 70,
        flex: 1
    },
    sliderIconWrapper: {
        alignItems: "center",
    },
    contentWrapper: {
        paddingTop: 50,
    },
    providersIcon: {
        width: 350,
        maxHeight: 348,
        marginTop: 40,
    },
    title: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: "center",
        marginBottom: 16,
    },
    pinkText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.mainPink,
    },
    singleParah: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.mediumContrast,
        textAlign: "center",
        marginBottom: 16,
    },
    greBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 44 : 24,
    },

});
export default connectAuth()(AccessAndQualityScreen);
