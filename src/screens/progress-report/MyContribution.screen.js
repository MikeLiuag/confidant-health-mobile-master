import React, {Component} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Container, Content, Text, View, Button, Left, Body, Right, Header, Title} from 'native-base';
import {
    addTestID, isIphoneX, getHeaderHeight,
    Colors, TextStyles, CommonStyles, BackButton, AddFundsBox, PrimaryButton, AlertUtil, AlfieLoader,
} from 'ch-mobile-shared';
import Modal from 'react-native-modalbox';
import BillingService from '../../services/Billing.service';
import {Screens} from '../../constants/Screens';
import Analytics from "@segment/analytics-react-native";
import {connectAuth} from "../../redux";

const HEADER_SIZE = getHeaderHeight();


class MyContributionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            contributionAmount: null,
            subscriptionNotActive: null,
            membersHelped: 0,
            totalContributed: 0,
        };
    }


    componentDidMount(): void {
        this.fetchSubscription();
        this.contributionsRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.fetchSubscription();
            }
        );
    }



    componentWillUnmount(): void {
        if(this.contributionsRefresher) {
            this.contributionsRefresher.remove();
        }
    }

    updateAmount = (value) => {
        if (value === 'INCREMENT') {
            this.setState({contributionAmount: this.state.contributionAmount + 1});
        } else if (value === 'DECREMENT') {
            this.setState({contributionAmount: this.state.contributionAmount - 1});
        }

    };

    fetchSubscription = async () => {

        const response = await BillingService.getSubscription();
        if (response.errors) {
            AlertUtil.showErrorMessage('Something went wrong with the subscription service.');
            this.setState({isLoading: false});
        } else {
            if (response && response.subscriptionAmount) {
                await this.setState({
                    isLoading: false,
                    contributionAmount: response.subscriptionAmount,
                    subscriptionNotActive: response.cancelled,
                    membersHelped: response.membersHelped || 0,
                    totalContributed: response.totalContributed || 0
                });
            } else {
                this.setState({isLoading: false});
            }
        }
    };


    turnOnSubscription = () => {
        this.detailDrawerClose();
        this.props.navigation.replace(Screens.SUBSCRIPTION_REQUIRED_SCREEN, {
            subscriptionAmount: this.state.contributionAmount,
            manualSubscription: true,
            subscriptionActive: !this.state.subscriptionNotActive
        });
    };

    cancelSubscription = async () => {
        this.setState({
            isLoading: true,
        });
        const response = await BillingService.cancelSubscription();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            AlertUtil.showSuccessMessage('Contribution Paused Successfully.');
            await Analytics.identify(this.props.auth?.meta?.userId, {
                cancelledSubscription: true
            });
            this.setState({
                isLoading: false,
                subscriptionNotActive: true,
            });
        }
    };

    detailDrawerClose = () => {
        this.refs?.modalDetailView?.close();
    };

    navigateToNextScreen = () => {
        // this.props.navigation.navigate(Screens.SOCIAL_DETERMINANTS_SCREEN);
    };

    navigateBack() {
        this.props.navigation.goBack();
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return (<AlfieLoader/>);
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title style={styles.contributionTitle}>My contributions</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content contentContainerStyle={{padding: 24}}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            {this.state.membersHelped} people helped
                        </Text>
                        <Text style={styles.subText}>
                            You have <Text style={styles.subTextPink}>contributed ${this.state.totalContributed}</Text> so far.
                            This <Text style={styles.subTextPink}>helped {this.state.membersHelped} people</Text> to get clinical care they
                            couldn’t afford. We are grateful for your kindness.
                        </Text>
                    </View>
                    <View style={styles.imgWrap}>
                        <Image
                            style={styles.contributionImg}
                            source={require('../../assets/images/onBoarding-5.png')}/>
                    </View>

                </Content>

                <View style={styles.greBox}>
                    <TouchableOpacity
                        style={styles.contributionBox}
                        onPress={() => {
                            this.refs?.modalDetailView?.open();
                        }}
                    >
                        {this.state.contributionAmount!==null &&
                        <View style={styles.moneyWrap}>
                            <Text style={styles.moneyText}>${this.state.contributionAmount}</Text>
                        </View>
                        }


                        <View style={styles.conDetails}>
                            {
                                this.state.subscriptionNotActive ? <Text style={styles.durationTextCancelled}>Contribution paused</Text>: <Text style={styles.durationText}>Monthly contribution</Text>
                            }
                            {
                                this.state.subscriptionNotActive ? <Text style={styles.changeText}>Resume contribution</Text>: <Text style={styles.changeText}>Change contribution</Text>
                            }


                        </View>
                    </TouchableOpacity>
                </View>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 630}}
                    entry={'bottom'}
                    position={'bottom'} ref={'modalDetailView'} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.alfieWrap}>
                            <Image
                                style={styles.alfieImg}
                                resizeMode={'contain'}
                                source={require('../../assets/images/elfie-avatar.png')}/>
                        </View>
                        <Text style={styles.conTitleModal}>Contribute Monthly to the
                            Confidant community</Text>
                        <View style={styles.fundBox}>
                            <AddFundsBox
                                fundTitle={'Monthly contribution amount'}
                                fundAmount={this.state.contributionAmount}
                                incrementAmount={() => {
                                    this.updateAmount('INCREMENT');
                                }}
                                decrementAmount={() => {
                                    if (this.state.contributionAmount - 1 > 0) {
                                        this.updateAmount('DECREMENT');
                                    }
                                }}
                                setCustomAmount={(contributionAmount)=>{
                                    this.setState({
                                        contributionAmount
                                    })
                                }}
                            />
                        </View>
                        <View style={styles.btnBox}>
                            <PrimaryButton
                                onPress={this.turnOnSubscription}
                                text={'Contribute $' + this.state.contributionAmount + ' monthly'}
                            />

                            {!this.state.subscriptionNotActive &&

                            <Button onPress={this.cancelSubscription} style={styles.dontBtn} transparent>
                                <Text style={styles.dontText} uppercase={false}>I don’t want to contribute</Text>
                            </Button>
                            }
                        </View>

                    </Content>
                </Modal>

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 30,
        paddingLeft: 18,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    contributionTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeBold,
    },
    titleWrap: {
        marginBottom: 8,
        alignItems: 'center',
    },
    subText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    subTextPink: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    imgWrap: {
        alignItems: 'center',
    },
    contributionImg: {
        width: 230,
        height: 260,
        marginVertical: 50,
    },
    greBox: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    contributionBox: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 32,
    },
    moneyWrap: {},
    moneyText: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
    },
    conDetails: {
        paddingLeft: 32,
        flex: 1,
    },
    durationText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 4,
    },
    durationTextCancelled: {
        color: Colors.colors.errorText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 4,
    },
    changeText: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.linkTextS,
    },
    alfieWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    alfieImg: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    conTitleModal: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        marginBottom: 24,
        textAlign: 'center',
    },
    fundBox: {
        marginBottom: 20,
    },
    btnBox: {
        alignItems: 'center',
    },
    dontBtn: {
        marginVertical: 24,
    },
    dontText: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
    },
});

export default connectAuth()(MyContributionScreen);
