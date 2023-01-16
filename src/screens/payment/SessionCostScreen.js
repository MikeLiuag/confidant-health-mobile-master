import React, {Component} from 'react';
import {
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import {Button, Left, Container, Content, Header, Text} from 'native-base';
import {
    addTestID,
    AlertUtil,
    isIphoneX,
    getHeaderHeight
} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import {STRIPE_ERROR} from '../../constants/CommonConstants';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import {Screens} from '../../constants/Screens';
import CreditCardsListComponent from '../../components/payment/CreditCardsListComponent';
import {connectPayment} from '../../redux/modules/payment';
import BillingService from '../../services/Billing.service';
import Analytics from '@segment/analytics-react-native';
const HEADER_SIZE = getHeaderHeight();

class SessionCostScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.appointment = navigation.getParam("appointment", null);
        this.delayedFeedback = navigation.getParam("delayedFeedback", false);

        this.state = {
            isLoading: false,
            appointmentId: null,
            cardId: null,
            payNow: false,
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Session Cost Screen'
        );
    }

    navigateBack = () => {
        if (this.referrerScreen) {
            this.props.navigation.navigate(this.referrerScreen);
        }
        else {
            this.props.navigation.navigate(Screens.APPOINTMENTS_SCREEN);
        }
    };

    cardListScreen = (showSection = false) => {
        this.props.navigation.navigate(Screens.CARD_LIST_SCREEN, {
            showDeleteSection: showSection,
        });
    };


    onPaymentSuccess = () => {
        this.props.navigation.replace(Screens.REWARD_POINTS_SCREEN,this.props.navigation.state.params);
    };

    payBill = async () => {
        try {
            // Create a credit card token
            this.setState({isLoading: true, payNow: false});
            console.log('Starting payment for Appointment ID:' + this.state.appointmentId);
            const paymentResponse = await BillingService.payAppointmentWithCard(this.state.appointmentId, this.state.cardId);

            if (paymentResponse.errors) {
                console.log(paymentResponse.errors);
                AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                this.setState({isLoading: false, payNow: false});
            } else {
                // Analytics.track('Payment - Session Payment Made', {
                //     appointmentId: this.state.appointmentId,
                // });
                console.log('Payment Successful for appointment : ' + this.state.appointmentId);
                AlertUtil.showSuccessMessage(paymentResponse.message);
                this.setState({isLoading: false, payNow: false});
                this.onPaymentSuccess();
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false, payNow: false});
        }


    };

    showPayNowButton = (appointmentId, cardId) => {
        this.setState({payNow: true, appointmentId: appointmentId, cardId: cardId});
    };

    addCardScreen = () => {
        this.props.navigation.navigate(Screens.PAYMENT_SCREEN, {
            showAddCardScreen: true,
        });
    };

    payFromWallet = async () => {

        try {
            // Create a credit card token
            this.setState({isLoading: true});
            console.log('Starting payment for Appointment - ' + this.appointment.appointmentId + ' - vie wallet');
            const walletResponse = await BillingService.payFromWallet(this.appointment.appointmentId);
            console.log('RESPONSE FROM SERVER');
            console.log(walletResponse);
            if (walletResponse.errors) {
                console.log(walletResponse.errors);
                AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                // Analytics.track('Payment - Session Payment Made via wallet', {
                //     appointmentId: this.appointment.appointmentId,
                // });
                console.log('Payment Successful for appointment : ' + this.appointment.appointmentId);
                AlertUtil.showSuccessMessage(walletResponse.message);
                this.setState({isLoading: false});
                this.onPaymentSuccess();
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false, payNow: false});
        }


    }

    async componentDidMount(): void {
        this.payNowSub = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.setState({payNow: false});
            },
        );
        this.props.fetchCardsList();
        this.props.fetchWalletSilently();

    }

    componentWillUnmount = () => {
        if (this.payNowSub) {
            this.payNowSub.remove();
        }
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const wallet = this.props.payment.wallet;

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        {!this.delayedFeedback && (
                            <Left>
                                <Button
                                    {...addTestID('Back')}
                                    onPress={() => this.navigateBack()}
                                    transparent
                                    style={styles.backButton}>
                                    <Icon name="angle-left" size={32} color="#3fb2fe"/>
                                </Button>
                            </Left>
                        )}
                    </Header>
                    <Content>
                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}></View>
                            <View style={styles.singleHalfProgress}>
                                <View style={styles.halfInner}></View>
                            </View>
                            <View style={styles.singleProgress}></View>
                            <View style={styles.singleProgress}></View>
                            <View style={styles.singleProgress}></View>
                        </View>
                        <Text
                            {...addTestID('telehealth-session-payment')}
                            style={styles.paymentTitle}>Pay For Your Session</Text>
                        <Text
                            {...addTestID('service-cost')}
                            style={styles.costValue}>${this.appointment.recommendedCost}</Text>
                        <Text
                            {...addTestID('session-cost')}
                            style={styles.costText}>Amount Due</Text>


                        <Text style={styles.balanceText}>Account Balance : ${this.props.payment.wallet.balance}</Text>


                        {wallet.balance >= this.appointment.recommendedCost ?
                            <View style={styles.greBtn}>
                                <GradientButton
                                    disabled={this.state.isLoading}
                                    testId="pay-via-wallet"
                                    onPress={() => {
                                        this.payFromWallet()
                                    }}
                                    text="Pay via wallet"
                                />
                            </View>
                            : null
                        }

                        {/*<View style={styles.greBtn}>*/}
                        {/*<Text style={styles.insufficientText}>Insufficient funds</Text>*/}
                        {/*<GradientButton*/}
                        {/*onPress={()=>{*/}
                        {/*this.props.navigation.navigate(Screens.ADD_FUNDS_SCREEN);*/}
                        {/*}}*/}
                        {/*text="Add Funds"*/}
                        {/*/>*/}
                        {/*</View>*/}


                        <CreditCardsListComponent
                            addCard={this.addCardScreen}
                            cardList={this.cardListScreen}
                            showPayNowButton={this.showPayNowButton}
                            cardListData={this.props.payment.cardsList}
                            isLoading={this.props.payment.isLoading || this.state.isLoading}
                            appointmentId={this.appointment.appointmentId}

                        />

                    </Content>
                    {/*<Button transparent style={styles.detailsBtn}*/}
                    {/*onPress={() => {*/}
                    {/*this.props.navigation.navigate(Screens.INVOICE_SCREEN, {*/}
                    {/*serviceCost: this.appointment.serviceCost,*/}
                    {/*});*/}
                    {/*}}>*/}
                    {/*<Text style={styles.detailsText} uppercase={false}>See Session Details</Text>*/}
                    {/*</Button>*/}
                    {this.props.payment.cardsList.length < 1 ?
                        <View style={styles.greBtn}>
                            <View
                                {...addTestID('personal-info')}
                                style={styles.lockRow}>
                                <Icon name="lock" size={25} color="#b3bec9"/>
                                <Text style={styles.lockText}>Your Personal Information is Always Kept Secured</Text>
                            </View>
                            <GradientButton
                                testId="add-card"
                                onPress={() => this.addCardScreen()}
                                text="Add Card"
                            />
                        </View>
                        : null}
                    {this.props.payment.cardsList.length > 0 && this.state.payNow ?

                        <View
                            {...addTestID('Pay-with-a-card')}
                            style={styles.greBtn}>
                            <View
                                {...addTestID('personal-info')}
                                style={styles.lockRow}>
                                <Icon name="lock" size={25} color="#b3bec9"/>
                                <Text style={styles.lockText}>Your Personal Information is Always Kept Secured</Text>
                            </View>
                            <GradientButton
                                testId="pay-with-card"
                                onPress={() => this.payBill()}
                                text="Pay With A Card"
                            />
                        </View>
                        : null}


                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 15,
        width: 35,
    },
    paymentTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginBottom: 35,
        paddingLeft: 40,
        width: '90%',
        paddingRight: 40,
        alignSelf: 'center',
    },
    costValue: {
        color: '#77c70b',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 48,
        textAlign: 'center',
        lineHeight: 52,
        marginBottom: 16,
    },
    costText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 12,
        letterSpacing: 1.5,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 35,
    },
    cardBox: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    cardListHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    methodText: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 15,
        fontSize: 14,
        letterSpacing: 0.47,
        fontWeight: '500',
    },
    manageBtn: {
        marginRight: 0,
        paddingRight: 0,
    },
    manageText: {
        color: '#3fb2fe',
        fontSize: 14,
        letterSpacing: 0.3,
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        paddingRight: 0,
    },
    cardList: {},
    singleCard: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 17,
    },
    cardImg: {
        width: 38,
        height: 30,
    },
    cardDes: {
        flex: 2,
        paddingLeft: 24,
    },
    cardName: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 13,
        fontSize: 13,
        letterSpacing: 0.28,
        marginBottom: 4,
    },
    cardNum: {
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.28,
        fontFamily: 'Roboto-Regular',
    },
    insufficientText: {
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.28,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center'
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    lockText: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0,
        paddingLeft: 10,
    },
    detailsBtn: {
        alignSelf: 'center',
        // marginBottom: 14,
    },
    detailsText: {
        color: '#3fb2fe',
        fontSize: 14,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    greBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 40
    },
    singleProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4
    },
    singleSelectedProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        marginLeft: 4,
        marginRight: 4
    },
    singleHalfProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4,
        overflow: 'hidden'
    },
    halfInner: {
        backgroundColor: '#3fb2fe',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 12
    },
    balanceText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        fontWeight: '600',
        color: '#25345C',
        letterSpacing: 0.5,
        lineHeight: 15,
        textAlign: 'center',
        marginBottom: 10,
    },
});
export default connectPayment()(SessionCostScreen);
