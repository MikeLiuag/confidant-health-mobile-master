import React, {Component} from 'react';
import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {addTestID, AlertUtil, AlfieLoader, getHeaderHeight} from 'ch-mobile-shared';
import {STRIPE_ERROR,} from '../../constants/CommonConstants';
import {connectPayment} from '../../redux';
import BillingService from '../../services/Billing.service';
import Analytics from '@segment/analytics-react-native';
import {Screens} from '../../constants/Screens';
import {Body, Button, Container, Content, Header, Left, Radio, Right, Text, Title} from "native-base";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
const HEADER_SIZE = getHeaderHeight();
class AddPaymentMethodAndPayScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.onSuccess = navigation.getParam('onSuccess', null);
        this.type = navigation.getParam('type', null);
        this.reference = navigation.getParam('reference', null);
        const customAmount = navigation.getParam('amount', null);
        this.state = {
            selectedPaymentType: '',
            selectedPaymentMeta: '',
            isLoading: true,
            customAmount: customAmount
        };
    }

    async componentDidMount(): void {
        this.setDefaultState();
        this.props.fetchWallet();
        this.props.fetchCardsList();
    };

    /**
     * @function setDefaultState
     * @description This method is used to set default Payment details .
     */

    setDefaultState = () => {

        const {wallet, cardsList} = this.props.payment;
        const {customAmount} = this.state;

        let selectedPaymentMeta, selectedPaymentType;
        if (wallet.balance > customAmount) {
            selectedPaymentMeta = "WALLET";
            selectedPaymentType = "WALLET_PAYMENT";
        } else if (cardsList && cardsList.length > 0) {
            selectedPaymentMeta = cardsList[0];
            selectedPaymentType = "SAVED_CARD";
        } else {
            selectedPaymentMeta = "";
            selectedPaymentType = "NEW_CARD";
        }
        this.setState({selectedPaymentMeta, selectedPaymentType,isLoading: false});
    };


    /**
     * @function changePaymentType
     * @description This method is used to navigate change Payment type & Meta .
     * @params paymentType, paymentMeta
     */

    changePaymentType = (paymentType, paymentMeta) => {
        this.setState({
            selectedPaymentType: paymentType,
            selectedPaymentMeta: paymentMeta,
        });
    };


    getPaymentDetails = (selectedPaymentType, selectedPaymentMeta) => {

        let title, method;
        if (selectedPaymentType === 'SAVED_CARD') {
            title = "Confirm Pay";
            method = ()=>this.payViaCard(selectedPaymentMeta);
        } else if (selectedPaymentType === 'NEW_CARD') {
            title = "Add New Card";
            method = ()=>this.addCard();
        } else if (selectedPaymentType === 'WALLET_PAYMENT' && this.props.payment.wallet.balance >= this.state.customAmount) {
            title = "Pay From Wallet";
            method = ()=>this.payViaWallet(selectedPaymentMeta);
        }
        return {title,method};
    }


    /**
     * @function addCard
     * @description This method is used to navigate add new card screen.
     */
    addCard = () => {
        this.props.navigation.navigate(Screens.PAYMENT_SCREEN, {
            showAddCardScreen: true,
            ...this.props.navigation.state.params,
            onSuccess: this.navigateOnSuccess
        });
    };


    navigateOnSuccess = async (prePaymentDetails) => {
        await Analytics.identify(this.props.auth?.meta?.userId, {
            hasCardAddedSuccessfully : true
        });

        this.goBack();
        this.onSuccess(prePaymentDetails);
    };

    /**
     * @function payFromWallet
     * @description This method is used to pay donation through wallet.
     */

    payViaWallet = async () => {
        try {
            this.setState({isLoading: true});
            const {customAmount} = this.state;
            const payload = {
                amount: customAmount,
                paymentType: this.type,
                reference: this.reference,
                metaData: {
                    type: this.type,
                    amount: customAmount,
                    groupChannelUrl: this.reference
                }
            };

            const walletResponse = await BillingService.deductGenericWalletPayment(payload);
            if (walletResponse.errors) {
                AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                //Analytics.track(`Payment type ${this.type} captured via wallet`, payload);
                AlertUtil.showSuccessMessage('Payment successful');
                this.props.fetchWalletSilently();
                if (this.onSuccess) {
                    const prePaymentDetails= {
                        amountPaid: customAmount, chargeId : null, paymentMethod:"Wallet"
                    }
                    this.navigateOnSuccess(prePaymentDetails);
                }
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false, payNow: false});
        }
    };


    /**
     * @function payViaCard
     * @description This method is used to pay donation through selected card.
     */
    payViaCard = async () => {
        try {
            this.setState({isLoading: true, payNow: false, processingPayment: true});
            const {customAmount,selectedPaymentMeta} = this.state;
            const payload = {
                amount: customAmount,
                paymentType: this.type,
                paymentToken: selectedPaymentMeta.cardId,
                reference: this.reference
            };
            const paymentResponse = await BillingService.deductGenericCardPayment(payload);
            if (paymentResponse.errors) {
                AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                //Analytics.track(`Payment type ${this.type} captured via card`, payload);
                AlertUtil.showSuccessMessage("Payment successful");
                this.props.fetchWalletSilently();
                const stripeChargeId = paymentResponse.chargeId;
                if (this.onSuccess) {
                    const prePaymentDetails= {
                        amountPaid: customAmount, chargeId : stripeChargeId, paymentMethod:"Stripe"
                    }
                    this.navigateOnSuccess(prePaymentDetails);
                }
            }

        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };

    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {

        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading || this.props.payment.isLoading) {
            return <AlfieLoader/>;
        }
        const {selectedPaymentMeta, selectedPaymentType} = this.state;
        const savedCardsView = this.props.payment.cardsList.map((item, index) => {
            return (
                <TouchableOpacity
                    key={index}
                    style={selectedPaymentMeta.cardId === item.cardId ? styles.singleTypeSelected : styles.singleType}
                    onPress={() => this.changePaymentType('SAVED_CARD', item)}>
                    <Radio
                        color={'#3fb2fe'}
                        selectedColor={'#fff'}
                        selected={selectedPaymentMeta.cardId === item.cardId}
                        style={selectedPaymentMeta.cardId === item.cardId ? styles.radioBtnSelected : styles.radioBtn}
                        onPress={() => this.changePaymentType('SAVED_CARD', item)}
                    />
                    <Text style={styles.typeCheckText}>{item.brand} Card</Text>
                    <Text style={styles.typeCheckTextTwo}>Ending {item.last4}</Text>
                </TouchableOpacity>
            );
        });
        const paymentMethodDetails = this.getPaymentDetails(selectedPaymentType, selectedPaymentMeta);
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', 'rgba(247,249,255,0.5)', '#f7f9ff']}
                    style={{flex: 1}}>
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                            barStyle="dark-content"
                            translucent
                        />
                        <Left>
                            <Button
                                {...addTestID('back')}
                                onPress={this.goBack}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body style={{flex: 3}}>
                            <Title style={styles.groupTitle}>{'Select Payment Method'}</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content style={{paddingTop: 25}}>
                        <View>
                            <View style={styles.paymentTypes}>
                                <View style={styles.typeList}>
                                    <TouchableOpacity
                                        style={selectedPaymentType === 'WALLET_PAYMENT' ? styles.singleTypeSelected : styles.singleType}
                                        onPress={() => this.changePaymentType('WALLET_PAYMENT', 'WALLET')}>
                                        <Radio
                                            color={'#3fb2fe'}
                                            selectedColor={'#fff'}
                                            selected={selectedPaymentType === 'WALLET_PAYMENT'}
                                            style={selectedPaymentType === 'WALLET_PAYMENT' ? styles.radioBtnSelected : styles.radioBtn}
                                            onPress={() =>
                                                this.changePaymentType('WALLET_PAYMENT', 'WALLET')
                                            }
                                        />
                                        <Text style={styles.typeCheckText}>My Wallet</Text>
                                        <Text style={styles.typeCheckTextTwo}>
                                            ${this.props.payment.wallet.balance} available
                                        </Text>
                                    </TouchableOpacity>
                                    {savedCardsView}
                                    <TouchableOpacity
                                        style={selectedPaymentType === 'NEW_CARD' ? styles.singleTypeSelected : styles.singleType}
                                        onPress={() => this.changePaymentType('NEW_CARD', '')}>
                                        <Radio
                                            color={'#3fb2fe'}
                                            selectedColor={'#fff'}
                                            selected={selectedPaymentType === 'NEW_CARD'}
                                            style={selectedPaymentType === 'NEW_CARD' ? styles.radioBtnSelected : styles.radioBtn}
                                            onPress={() =>
                                                this.changePaymentType('NEW_CARD', '')
                                            }
                                        />
                                        <View>
                                            <Text style={styles.typeCheckText}>New Card</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {selectedPaymentType === 'WALLET_PAYMENT' && this.props.payment.wallet.balance < this.state.customAmount ?
                                    <View style={styles.disableBox}>
                                        <Text style={styles.disableBoxText}>
                                            Not Enough Funds On Your Wallet
                                        </Text>
                                    </View> :
                                    <View style={styles.payViaWalletBox}>
                                        <Text
                                            onPress={paymentMethodDetails.method}
                                            style={styles.payViaWalletText}>
                                            {paymentMethodDetails.title}
                                        </Text>
                                    </View>
                                }
                            </View>
                        </View>
                    </Content>
                </LinearGradient>
            </Container>
        );
    }
}

const styles = StyleSheet.create({

    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE
    },
    backButton: {
        marginLeft: 15,
        width: 35
    },
    groupTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3
    },
    providerRole: {
        color: '#515D7D',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },


    paymentTypes: {
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 24,
    },
    typeList: {
        marginBottom: 24,
    },
    singleType: {
        borderWidth: 0.5,
        borderColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#f5f5f5',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 1,
        backgroundColor: '#fff',
        padding: 22,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
    },
    singleTypeSelected: {
        borderWidth: 0.5,
        borderColor: 'rgba(63, 178, 254, 0.07)',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        padding: 22,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
    },

    typeCheck: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4,
        marginLeft: -10,
        marginRight: 10,
    },
    typeCheckSelected: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#3fb2fe',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4,
        marginLeft: -10,
        marginRight: 10,
    },
    typeCheckText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#25345C',
        paddingLeft: 16,
        flex: 1,
    },
    typeCheckTextTwo: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        letterSpacing: 0.3,
        color: '#515D7D',
        textAlign: 'right',
    },
    applePay: {
        width: 48,
        marginLeft: 18,
    },
    notEnoughBox: {
        backgroundColor: '#F8F9FB',
        padding: 16,
        marginBottom: 24,
    },
    payViaWalletBox: {
        padding: 16,
        marginBottom: 20,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    notEnoughText: {
        color: '#B3BEC9',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    disableBox: {
        padding: 16,
        marginBottom: 20,
        backgroundColor: '#d8d8d8',
        borderColor: '#d8d8d8',



        // borderRadius: 4,
    },
    disableBoxText: {
        color: '#646c73',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    payViaWalletText: {
        color: '#FFF',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        textAlign: 'center',
    },

    radioBtn: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    radioBtnSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
});

export default connectPayment()(AddPaymentMethodAndPayScreen);
