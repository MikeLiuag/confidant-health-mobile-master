import React, {Component} from 'react';
import {Screens} from '../../constants/Screens';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {
    AlertUtil,
    Colors,
    CommonStyles,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from 'ch-mobile-shared';
import {Container, Content, Text} from 'native-base';
import BillingService from '../../services/Billing.service';
import Loader from '../../components/Loader';

export default class ContributionGateScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.nickname = navigation.getParam('nickname', null);
        this.data = navigation.getParam('data', null);
        this.state = {
            isLoading: false
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    skipSubscription = async () => {
        this.setState({isLoading: true});
        const response = await BillingService.updateSubscriptionStatus();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            this.props.navigation.replace(Screens.PENDING_CONNECTIONS_SCREEN,{
                ...this.props.navigation.state.params,
            });
        }
    };

    nextStep = () => {
        this.props.navigation.navigate(Screens.SUBSCRIPTION_REQUIRED_SCREEN, {
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
                            style={{ ...styles.providersIcon, height: 269 }}
                            source={require("../../assets/images/onBoarding-2.png")}
                            resizeMode={"contain"} />
                    </View>
                    <View style={styles.contentWrapper}>
                        <Text  style={styles.title}>
                            Our community is here to support each other.
                        </Text>
                        <Text style={styles.singleParah}>
                            By making an ongoing contribution, you could change someone’s life.  100% of contributions go to clinical care for those who can’t
                            afford to pay full price.
                        </Text>
                    </View>
                </View>
            </Content>
            <View style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={false}
                    onPress={this.skipSubscription}
                />
                <Text onPress={this.nextStep} style={{ ...CommonStyles.styles.blueLinkText }}>
                    I want to contribute
                </Text>
            </View>
            {
                this.state.isLoading && <Loader/>
            }
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
        marginBottom: 60,
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
        marginTop: 30,
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
        paddingBottom: isIphoneX() ? 34 : 14,
    },

});
