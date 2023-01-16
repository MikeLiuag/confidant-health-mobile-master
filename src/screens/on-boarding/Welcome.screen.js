import React, { Component } from 'react';
import { Screens } from '../../constants/Screens';
import OnBoardingSlider from '../../components/on-boarding/OnBoardingSlider';
import AuthStore from './../../utilities/AuthStore';
import {LOGGED_OUT} from "../../constants/CommonConstants";
import {Image, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {
    addTestID,
    BackButton,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles
} from 'ch-mobile-shared';
import {Container, Content, Text} from 'native-base';
import EnterEmailScreen from "./EnterEmail.screen";
import { createStyles, maxWidth } from 'react-native-media-queries';


const HEADER_SIZE = getHeaderHeight();
export default class WelcomeScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state={
            isLoading: true
        }
    }
    async componentWillMount(): void {
        const authToken = await AuthStore.getAuthToken();
        if (authToken && authToken!== LOGGED_OUT) {
            this.props.navigation.replace(Screens.MAGIC_LINK_SCREEN);
        } else {
            this.setState({isLoading: false});
        }
    }

    render() {
        if(this.state.isLoading) {
            return null;
        }
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
                        <View style={styles.sliderIconWrapper}>
                            <Image
                                style={styles.providersIcon}
                                source={require("../../assets/images/onBoarding-1.png")}
                                resizeMode={"contain"} />
                        </View>
                        <View style={styles.contentWrapper}>
                            <Text  style={styles.title}>
                                Feel better, drink less, use less, or quit entirely.
                            </Text>
                            <Text  style={styles.singleParah}>
                                Mental health and addiction recovery services on demand.
                            </Text>
                        </View>
                    </View>
                </Content>
                <View {...addTestID("view")} style={styles.greBtn}>
                    <PrimaryButton
                        text="Continue"
                        testId="continue"
                        arrowIcon={false}
                        onPress={() => {
                            this.getStarted();
                        }}
                    />
                    <Text style={{ ...CommonStyles.styles.blueLinkText }}
                          onPress={this.onLogin}>
                        I already have an account
                    </Text>
                </View>
            </Container>
        );
    }

    getStarted = () => {
        this.props.navigation.navigate(Screens.PRIVACY_DISCLOSURE_SCREEN);
    };
    onLogin = () => {
        this.props.navigation.replace(Screens.MAGIC_LINK_SCREEN);
    };
}
const mainStyles = {
    textBox: {
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
        marginTop: 90,
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
};
export const styles = createStyles(
    mainStyles,
    maxWidth(414, {
        providersIcon: {
            width: 320,
            maxHeight: 280
        },
    }),
    maxWidth(375, {
        textBox:{
            marginTop: 50,
            marginBottom: 20
        },
        providersIcon: {
            width: 240,
            maxHeight: 240
        },
        contentWrapper: {
            paddingTop: 20
        },
        title: {
            ...TextStyles.mediaTexts.TextH5
        },
        singleParah: {
            ...TextStyles.mediaTexts.bodyTextS
        },
        greBtn: {
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 16
        },
    }),
    maxWidth(320, {
        providersIcon: {
            width: 230,
            maxHeight: 230
        },
    }),
);
