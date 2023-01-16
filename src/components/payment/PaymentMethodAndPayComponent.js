import React, {Component} from "react";
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Radio, Right, Text, Title} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import {addTestID, AlfieLoader, getHeaderHeight} from 'ch-mobile-shared';
import LinearGradient from "react-native-linear-gradient";

const HEADER_SIZE = getHeaderHeight();

export default class PaymentMethodAndPayComponent extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading,
            selectedPaymentType: '',
            selectedPaymentMeta: '',
            costFocus: false,
            hasCostError: false,
        };
    }

    componentDidMount() {
        this.setPaymentDetails();
    };

    /**
     * @function setPaymentDetails
     * @description This method is used to set default Payment details .
     */

    setPaymentDetails = ()=>{
        const {walletBalance, cost, cardsList} = this.props;
        if (walletBalance > cost) {
            this.setState({
                selectedPaymentMeta: "WALLET",
                selectedPaymentType: "WALLET_PAYMENT"
            })
        } else if (cardsList && cardsList.length > 0) {
            const selectedPaymentMeta = cardsList[0];
            this.setState({
                selectedPaymentMeta,
                selectedPaymentType: "SAVED_CARD"
            })
        } else {
            this.setState({
                selectedPaymentMeta: "",
                selectedPaymentType: "NEW_CARD"
            })
        }
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

    render() {

        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }
        const {selectedPaymentMeta, selectedPaymentType} = this.state;
        const savedCardsView = this.props.cardsList.map((item, index) => {
            return (
                <View
                    key={index}
                    style={selectedPaymentMeta.cardId === item.cardId ? styles.singleTypeSelected : styles.singleType}>
                    <Radio
                        color={'#3fb2fe'}
                        selectedColor={'#fff'}
                        selected={selectedPaymentMeta.cardId === item.cardId}
                        style={selectedPaymentMeta.cardId === item.cardId ? styles.radioBtnSelected : styles.radioBtn}
                        onPress={() => this.changePaymentType('SAVED_CARD', item)}
                    />
                    <Text style={styles.typeCheckText}>{item.brand} Card</Text>
                    <Text style={styles.typeCheckTextTwo}>Ending {item.last4}</Text>
                </View>
            );
        });

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
                                onPress={this.props.navigateBack}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body style={{flex: 2}}>
                            <Title style={styles.groupTitle}>{'Select Payment Method'}</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content style={{paddingTop: 25}}>
                        <View>
                            <View style={styles.paymentTypes}>
                                <View style={styles.typeList}>
                                    <View
                                        style={selectedPaymentType === 'WALLET_PAYMENT' ? styles.singleTypeSelected : styles.singleType}>
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
                                            ${this.props.walletBalance} available
                                        </Text>
                                    </View>
                                    {savedCardsView}
                                    <View
                                        style={selectedPaymentType === 'NEW_CARD' ? styles.singleTypeSelected : styles.singleType}>
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
                                    </View>
                                </View>

                                {(() => {
                                    if (selectedPaymentType === 'SAVED_CARD') {
                                        return (
                                            <View style={styles.payViaWalletBox}>
                                                <Text
                                                    onPress={() => {
                                                        this.props.payViaCard(selectedPaymentMeta);
                                                    }}
                                                    style={styles.payViaWalletText}>
                                                    Confirm Pay
                                                </Text>
                                            </View>
                                        );
                                    } else if (
                                        selectedPaymentType === 'NEW_CARD'
                                    ) {
                                        return (
                                            <View style={styles.payViaWalletBox}>
                                                <Text
                                                    onPress={() => {
                                                        this.props.addCard();
                                                    }}
                                                    style={styles.payViaWalletText}>
                                                    Add New Card
                                                </Text>
                                            </View>
                                        );
                                    } else if (
                                        selectedPaymentType === 'WALLET_PAYMENT' &&
                                        this.props.walletBalance >= this.props.cost
                                    ) {
                                        return (
                                            <View style={styles.payViaWalletBox}>
                                                <Text
                                                    onPress={() => {
                                                        this.props.payFromWallet(selectedPaymentMeta);
                                                    }}
                                                    style={styles.payViaWalletText}>
                                                    Pay Via Wallet
                                                </Text>
                                            </View>
                                        );
                                    } else if (
                                        selectedPaymentType === 'WALLET_PAYMENT' &&
                                        this.props.walletBalance < this.props.cost
                                    ) {
                                        return (
                                            <View style={styles.disableBox}>
                                                <Text style={styles.disableBoxText}>
                                                    Not Enough Funds On Your Wallet
                                                </Text>
                                            </View>
                                        );
                                    } else {
                                        return null;
                                    }
                                })()}
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
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 15,
        width: 35,
    },
    groupTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
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
        marginBottom: 24,
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
        marginBottom: 24,
        backgroundColor: '#d8d8d8',
        borderColor: '#d8d8d8',
        borderRadius: 4,
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