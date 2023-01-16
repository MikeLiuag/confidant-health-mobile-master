import React, {Component} from 'react';
import {AppState, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Container, Content} from 'native-base';
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/alfie-face-new';
import {isIphoneX, PrimaryButton, ProgressBars, Colors, TextStyles, CommonStyles} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import { NavigationActions, StackActions } from "react-navigation";

export default class AlfieQuestionScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            appState: AppState.currentState
        };
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    };


    navigateToNextScreen = () => {
        console.log('hit');
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({
                    routeName: Screens.TAB_VIEW,
                    action: NavigationActions.navigate({
                        routeName: Screens.APPOINTMENTS_SCREEN,
                    }),
                }),
                NavigationActions.navigate({
                    routeName: Screens.TAB_VIEW
                }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
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
                <Content style={styles.wrapper}>
                    <ProgressBars
                        index={3}
                        totalBars={4}
                    />
                    <View style={{alignItems: 'center'}}>
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
                    </View>
                    <Text style={styles.rewardsTitle}>Keep up the great work!</Text>

                    <Text style={styles.rewardsDes}>
                        That's all for now. Check your home screen to see if you have new chatbots, or scroll through the library to learn more about a topic.
                    </Text>


                </Content>
                <View style={styles.btnStyle}>
                    <PrimaryButton
                        // testId = "thanks-btn"
                        text="Continue"
                        onPress={() => {
                            this.navigateToNextScreen();
                        }}
                        arrowIcon={true}
                    />
                </View>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingLeft: 24,
        paddingRight: 24,
        // paddingTop: isIphoneX()? 24 : 0,
    },
    alfieWrapper: {
        ...CommonStyles.styles.shadowBox,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.colors.mainBlue20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40
    },
    alfie: {
        width: 110,
        height: 110,
    },
    rewardsTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginBottom: 8
    },
    rewardsDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        textAlign: 'center',
        marginBottom: 30
    },
    btnStyle: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
});
