import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {Image, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {addTestID, Colors, getHeaderHeight, isIphoneX, PrimaryButton, TextStyles, BackButton} from 'ch-mobile-shared';
import {Container, Content, Text} from 'native-base';

const HEADER_SIZE = getHeaderHeight();
export default class PersonalizedWelcomeScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.nickname = navigation.getParam('nickname', null);
        this.data = navigation.getParam('data', null);
    }

    backClicked = ()=>{
        this.props.navigation.goBack();
    }

    render() {
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
                        <View style={styles.sliderIconWrapper}>
                            <Image
                                style={[styles.providersIcon, { height: 248 }]}
                                source={require("../../assets/images/onBoarding-4.png")}
                                resizeMode={"contain"} />
                        </View>
                        <View style={styles.contentWrapper}>
                            <Text  style={styles.title}>
                                Welcome, {this.nickname}!{'\n'}
                                We want to help you
                                reach your goals.
                            </Text>
                            <Text style={styles.singleParah}>
                                We’ve helped hundreds of people through personalized clinical and virtual care. We’re going to ask you a few questions to get started.
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
        this.props.navigation.navigate(Screens.SELECT_GOALS_SCREEN, {
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
    mainWrapper:{
        flex: 1,
    },
    slide: {
        flex: 1,
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
