import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {Image, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {addTestID, Colors, getHeaderHeight, isIphoneX, PrimaryButton, TextStyles, BackButton} from 'ch-mobile-shared';
import {Container, Content, Text} from 'native-base';

const HEADER_SIZE = getHeaderHeight();
export default class RealPersonScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }

    backClicked = ()=>{
        this.props.navigation.goBack();
    }

    render() {
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
                        <View style={styles.sliderIconWrapper}>
                            <Image
                                style={{ ...styles.providersIcon, height: 249 }}
                                source={require("../../assets/images/onBoarding-3.png")}
                                resizeMode={"contain"} />
                        </View>
                        <View style={styles.contentWrapper}>
                            <Text  style={styles.title}>
                                You’ll be connected to a real person in the app.
                            </Text>
                            <Text style={styles.singleParah}>
                                Your matchmaker is here to support and guide you. Reach out with any questions, if that’s your style.
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

    nextStep = () => {
        this.props.navigation.navigate(Screens.EXCLUSION_CRITERIA_SCREEN, {
            ...this.props.navigation.state.params,
        });
    };
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
