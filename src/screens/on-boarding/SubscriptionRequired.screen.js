import React, {Component} from 'react';
import {Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {Button, Container, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    ContributionBox,
    CommonStyles,
    BackButton
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {SEGMENT_EVENT, STRIPE_ERROR} from '../../constants/CommonConstants';
import Loader from '../../components/Loader';
import BillingService from '../../services/Billing.service';
import Analytics from '@segment/analytics-react-native';
import moment from 'moment';
import {AddPaymentCardModal} from '../../components/payment/AddPaymentCardModal';
import {connectPayment} from '../../redux';
import {PayNowModal} from '../../components/payment/PayNowModal';

const leftDistance = 550 - ((Dimensions.get('window').width/2) - 45);

const PAYMENT_SUGGESTIONS = [
    {amount: 1, popular: false},
    {amount: 2, popular: false},
    {amount: 3, popular: false},
    {amount: 4, popular: false},
    {amount: 5, popular: false},
    {amount: 10, popular: true},
    {amount: 15, popular: false},
    {amount: 20, popular: false},
    {amount: 30, popular: false},
    {amount: 50, popular: false},
];

class SubscriptionRequiredScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.subscriptionAmount = navigation.getParam('subscriptionAmount', null);
        this.manualSubscription = navigation.getParam('manualSubscription', false);
        this.subscriptionActive = navigation.getParam('subscriptionActive', false);


        this.state = {
            subscriptionAmount: this.subscriptionAmount ? this.subscriptionAmount : 10,
            selectedSuggestionIndex: this.subscriptionAmount ? -1 : 5,
            isLoading: true,
            addNewCardModal: false,
            modalOpen: false,
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Subscription Required Screen'
        );
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
            this.navigateToNextScreen();
        }
    };

    async componentWillMount() {
        this.props.fetchCardsList();
        if (this.subscriptionAmount) {
            if (this.props.payment.cardsList.length > 0) {
                this.setState({
                    modalOpen: true,
                    isLoading: false,
                });
            } else {
                this.setState({
                    addNewCardModal: true,
                    isLoading: false,
                });
            }
        } else if (this.manualSubscription) {
            this.setState({
                isLoading: false,
            });
        } else {
            const response = await BillingService.getSubscriptionStatus();
            if (response.errors) {
                AlertUtil.showErrorMessage('Something went wrong with the subscription service.');
                this.setState({isLoading: false});
            } else {
                if (response.subscriptionCancelled || !response.subscriptionRequired) {
                    const data = this.props.navigation.getParam('data', null);
                    this.props.navigation.replace(Screens.PENDING_CONNECTIONS_SCREEN, {data});
                } else {
                    this.setState({
                        isLoading: false
                    });
                }
            }
        }

    }


    turnOnSubscription = async (paymentToken, onPaymentSuccess, onPaymentError) => {
        this.setState({
            isLoading: true,
        });
        const response = await BillingService.subscribeForApp({
            paymentToken,
            amount: Number(this.state.subscriptionAmount),
        });
        if (response.errors) {
            onPaymentError(response.errors[0].endUserMessage);
            this.setState({
                isLoading: false,
            });
        } else {
            onPaymentSuccess();
            if (this.subscriptionAmount) {
                AlertUtil.showSuccessMessage('Your Monthly Subscription has been renewed');
                this.contributionSubscriptionUpdated();
                this.props.navigation.replace(Screens.MY_CONTRIBUTION_SCREEN,{
                    ...this.props.navigation.state.params,
                });
            } else if (this.manualSubscription) {
                AlertUtil.showSuccessMessage('Your monthly subscriptions have been turned on');
                this.contributionSubscriptionStarted();
                this.props.navigation.replace(Screens.MY_CONTRIBUTION_SCREEN,{
                    ...this.props.navigation.state.params,
                });
            } else {
                AlertUtil.showSuccessMessage('Your monthly subscriptions have been turned on');
                this.contributionSubscriptionStarted();
                this.props.navigation.replace(Screens.ON_BOARDING_CONTRIBUTION_SCREEN,{
                    ...this.props.navigation.state.params,
                });
            }
        }
    };

    contributionSubscriptionUpdated = () => {
        const segmentContributionSubscriptionUpdatedPayload = {
            userId: this.props.auth?.meta?.userId,
            contributionAmount: this.subscriptionAmount,
            updatedAt: moment.utc(Date.now()).format(),
        };
        Analytics.track(SEGMENT_EVENT.CONTRIBUTION_SUBSCRIPTION_UPDATED, segmentContributionSubscriptionUpdatedPayload);
    };

    contributionSubscriptionStarted = () => {
        const segmentContributionSubscriptionStartedPayload = {
            userId: this.props.auth?.meta?.userId,
            contributionAmount: this.state.subscriptionAmount,
            startedAt: moment.utc(Date.now()).format(),
            category: 'Goal Completion',
            label: 'Contribution Subscription Started'
        };
        Analytics.track(SEGMENT_EVENT.CONTRIBUTION_SUBSCRIPTION_STARTED, segmentContributionSubscriptionStartedPayload);
    };

    renderPaymentSuggestions = () => {
        return <ScrollView showsHorizontalScrollIndicator={false}
                           contentContainerStyle={styles.paymentCarousal}
                           horizontal
                           ref={(ref) => {
                               this.scrollView = ref;
                           }}
                           onLayout={() => {
                               setTimeout(() => {
                                   if (this.scrollView) {
                                       this.scrollView.scrollTo({x: leftDistance, y: 0, animated: true});
                                   }
                               }, 10);
                           }}>
            {
                PAYMENT_SUGGESTIONS.map((item, index) => (
                    <TouchableOpacity key={`suggestion-${index}`}
                                      style={[
                                          styles.paymentBox,
                                          this.state.selectedSuggestionIndex === index && {
                                              borderWidth: 1,
                                              borderColor: Colors.colors.mainPink60,
                                          },
                                      ]}
                                      onPress={() => {
                                          this.selectPaymentSuggestion(index);
                                      }}
                    >
                        <Text style={styles.payText}>{`$${item.amount}`}</Text>
                        {
                            item.popular && <Text style={styles.popularText}>Popular</Text>
                        }

                    </TouchableOpacity>
                ))
            }
        </ScrollView>;
    };

    selectPaymentSuggestion = (index) => {
        let {selectedSuggestionIndex} = this.state;
        let subscriptionAmount;
        if (selectedSuggestionIndex === index) {
            selectedSuggestionIndex = -1;
            subscriptionAmount = 0;
        } else {
            selectedSuggestionIndex = index;
            subscriptionAmount = PAYMENT_SUGGESTIONS[index].amount;
        }
        this.setState({selectedSuggestionIndex, subscriptionAmount});
    };

    navigateToNextScreen = () => {
        if (this.manualSubscription) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.replace(Screens.PENDING_CONNECTIONS_SCREEN,{
                ...this.props.navigation.state.params,
            });
        }

    };

    addCard = async (creditCardInput) => {
        this.setState({isLoading: true, addNewCardModal: false});
        let creditCardToken;
        try {
            creditCardToken = await BillingService.getStripeToken(creditCardInput);
            if (creditCardToken.error) {
                if (creditCardToken.error.message.includes('The card number is longer than the maximum supported' +
                    ' length of 16.')) {
                    AlertUtil.showErrorMessage('This is not a valid stripe card');
                } else {
                    AlertUtil.showErrorMessage(creditCardToken.error.message);
                }
                this.setState({isLoading: false});
            } else {
                // Send a request to your server with the received credit card token
                let paymentResponse = await BillingService.addCard(creditCardToken.id);
                if (paymentResponse.errors) {
                    AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                    this.setState({isLoading: false});
                } else {
                    // this.props.fetchCardsList();
                    this.payViaCard(paymentResponse.cardId);
                }

            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false});
        }
    };

    payViaCard = async (cardId) => {
        try {
            this.setState({
                isLoading: true, addNewCardModal: false, modalOpen: false,
            });
            let paymentSuccessCallback = ()=>{};
            if (!this.subscriptionActive) {
                paymentSuccessCallback = () => {
                    AlertUtil.showSuccessMessage('Payment Successful');
                };
            }
            await this.turnOnSubscription(cardId, paymentSuccessCallback, (errorMessage) => {
                AlertUtil.showErrorMessage(errorMessage);
                this.setState({isLoading: false});
            });
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };

    closePaymentModal = () => {
        this.setState({
            modalOpen: false,
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
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
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop: 0}}>
                    <View>
                        <View style={styles.textBox}>
                            <Image
                                {...addTestID('Provider-Icon-png')}
                                style={styles.signInIcon}
                                source={require('../../assets/images/new-pre-Contribute-icon.png')}/>

                            <Text
                                {...addTestID('Heading-1')}
                                style={styles.magicMainText}>
                                Join our mission to make behavioral healthcare accessible to all.
                            </Text>
                            <Text
                                {...addTestID('Heading-2')}
                                style={styles.magicSubText}>
                                100% of monthly contributions go to clinical care for those who can’t
                                afford to pay full price.
                            </Text>
                        </View>

                        {this.renderPaymentSuggestions()}

                        <View style={{paddingHorizontal: 24}}>
                            <ContributionBox
                                subAmount={this.state.subscriptionAmount}
                            />
                        </View>
                    </View>

                </ScrollView>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue"
                        onPress={() => {
                            // this.props.navigation.navigate(Screens.GENERIC_PAYMENT_SCREEN, {
                            //     paymentDetails: {
                            //         title: 'Confirm and Pay',
                            //         amount: Number(this.state.subscriptionAmount),
                            //         subTitle: "Payment for App Subscription",
                            //         paymentType: 'APP_SUBSCRIPTIONS'
                            //     },
                            //     overridePaymentCallback: this.turnOnSubscription
                            // });
                            if (this.props.payment.cardsList.length > 0) {
                                this.setState({
                                    modalOpen: true,
                                });
                            } else {
                                this.setState({
                                    addNewCardModal: true,
                                });
                            }

                        }}
                        text="Continue"
                    />
                    <Text style={{ ...CommonStyles.styles.blueLinkText }}
                          onPress={() => {
                              this.skipSubscription();
                          }}>
                        Skip for now
                    </Text>
                </View>
                <PayNowModal
                    onClose={this.closePaymentModal}
                    visible={this.state.modalOpen}
                    paymentCards={this.props.payment.cardsList}
                    amount={Number(this.state.subscriptionAmount)}
                    addCardSelected={() => {
                        this.setState({
                            modalOpen: false,
                            addNewCardModal: true,
                        });
                    }}
                    payByCard={this.payViaCard}
                />
                <AddPaymentCardModal
                    isOpen={this.state.addNewCardModal}
                    onClose={() => {
                        this.setState({
                            addNewCardModal: false,
                        });
                    }}
                    onSubmit={this.addCard}
                />

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
        // paddingTop: isIphoneX() ? 124 : 100,
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 32,
    },
    signInIcon: {
        marginBottom: 20,
        width: 120,
        height: 120,
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 10,
        textAlign: 'center',
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 0,
        textAlign: 'center',
        color: Colors.colors.mediumContrast,
    },
    greBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent',
    },
    leftGradient: {
        height: 100,
        width: 50,
        backgroundColor: 'rgba(255,255,255,0)',
        position: 'absolute',
        zIndex: 10,
        left: 0,
    },
    rightGradient: {
        height: 100,
        width: 50,
        backgroundColor: 'rgba(255,255,255,0)',
        position: 'absolute',
        zIndex: 10,
        right: 0,
    },
    popularText: {
        marginTop: 5,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.secondaryText,
    },
    paymentBox: {
        ...CommonStyles.styles.shadowBox,
        width: 98,
        height: 75,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        elevation: 2,
        marginBottom: 24,
    },
    payText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.primaryText,
    },
    paymentCarousal: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 20,
        paddingLeft: 20,
    },
    skipBtn: {
        alignSelf: 'flex-end',
        marginTop: 15,
        position: 'absolute',
        zIndex: 1,
    },
    skipText: {
        color: Colors.colors.primaryText,
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 22.5,
        textTransform: 'capitalize',
    },
});
export default connectPayment()(SubscriptionRequiredScreen);
