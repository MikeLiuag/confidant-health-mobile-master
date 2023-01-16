import React, {Component} from 'react';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    PrimaryButton,
    TextStyles,
    TransactionSingleActionItem,
} from 'ch-mobile-shared';
import {Button, Text, View} from 'native-base';
import AntIcons from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modalbox';
import {Image, ScrollView, StyleSheet} from 'react-native';

export class PayNowModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCardId: null,
            walletSelected: false
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if(this.props.paymentCards.length>0) {
            if(this.state.selectedCardId===null) {
                this.setState({
                    selectedCardId: this.props.paymentCards[0].cardId
                })
            }
        }
    }

    selectWallet = () => {
        if (this.props.wallet.balance < this.props.amount) {
            AlertUtil.showErrorMessage('Not enough funds in wallet');
            return;
        }
        this.setState({
            selectedCardId: null,
            walletSelected: true,
        });
    };

    canPay = () => {
        if (!this.state.walletSelected && !this.state.selectedCardId) {
            return false;
        }
        if (this.state.walletSelected) {
            if (this.props.wallet.balance < this.props.amount) {
                return false;
            }
        }
        return true;
    };

    render() {
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                onClosed={this.props.onClose}
                isOpen={this.props.visible}
                style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 340}}
                entry={'bottom'}
                position={'bottom'} swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}
                      {...addTestID('swipeBar')}
                />
                <View style={styles.bookActionList}>
                    <View style={styles.filterTopHead}>
                        <Text style={styles.filterHeadText}>Select payment method</Text>
                    </View>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        contentContainerStyle={{
                            justifyContent: 'center',
                        }}
                        style={styles.fundTypeList}>
                        {
                            this.props.wallet && this.props.wallet.balance > 0 && (
                                <Button
                                    onPress={this.selectWallet}
                                    style={this.state.walletSelected ? styles.myWalletBtnSelected : styles.myWalletBtn}
                                    transparent>
                                    <Text uppercase={false} style={styles.myWalletText}>My wallet</Text>
                                    <Text uppercase={false}
                                          style={styles.myWalletValue}>${this.props.wallet.balance}</Text>
                                </Button>
                            )
                        }
                        {
                            this.props.paymentCards.map(card =>

                                <Button
                                    onPress={() => {
                                        this.setState({
                                            selectedCardId: card.cardId,
                                            walletSelected: false,
                                        });
                                    }}
                                    style={card.cardId === this.state.selectedCardId ? styles.masterBtnSelected : styles.masterBtn}
                                    transparent>
                                    <Text uppercase={false} style={styles.masterText}>Saved card</Text>
                                    <View style={styles.masterNumWrap}>
                                        <Image
                                            style={styles.masterImg}
                                            source={card.brand === 'Visa' ? require('../../assets/images/visa.png') : require('../../assets/images/master.png')}

                                        />
                                        <Text style={styles.masterNum}>{card.last4}</Text>
                                    </View>
                                </Button>,
                            )
                        }
                        <Button
                            onPress={()=> {
                                this.setState({
                                    selectedCardId: 'new_card'
                                })
                            }}
                            style={this.state.selectedCardId ==='new_card'? {...styles.newCardBtn,borderWidth:1,borderColor: Colors.colors.secondaryText} : styles.newCardBtn} transparent>

                            <Text uppercase={false} style={styles.newCardText}>New card</Text>
                        </Button>
                    </ScrollView>
                    <PrimaryButton
                        testId="pay-now"
                        disabled = {!this.canPay()}
                        onPress={() => {
                            if(this.state.selectedCardId==='new_card') {
                                this.props.addCardSelected();
                            } else if(this.canPay()){
                                if(this.state.walletSelected) {
                                    this.props.payByWallet();
                                } else {
                                    this.props.payByCard(this.state.selectedCardId);
                                }
                            }
                        }}
                        text={`Pay $${this.props.amount}`}
                    />
                </View>
            </Modal>
        );
    }

}

const styles = StyleSheet.create({
    bookActionList: {},
    singleAction: {
        marginBottom: 16,
    },
    fundTypeList: {
        paddingVertical: 36,
        flexDirection: 'row',
    },
    applePayBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 88,
        height: 78,
        justifyContent: 'center',
    },
    applePayImg: {
        width: 54,
        height: 23,
    },
    myWalletBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 102,
        height: 78,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    myWalletBtnSelected: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 102,
        height: 78,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: Colors.colors.secondaryText,
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: 'center',
    },
    myWalletText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
    },
    myWalletValue: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast,
    },
    masterBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 114,
        height: 78,
        flexDirection: 'column',
        borderWidth: 1,
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: 'center',
    },
    masterBtnSelected: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 114,
        height: 78,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: Colors.colors.secondaryText,
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: 'center',
    },
    masterText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast,
    },
    masterNumWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    masterImg: {
        width: 16,
        height: 10,
    },
    masterNum: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginLeft: 4,
    },
    newCardBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 98,
        height: 78,
        justifyContent: 'center',
    },
    newCardText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast,
    },
    filterTopHead: {
        flexDirection: 'row',
        marginBottom: 4,
        justifyContent: 'space-between'
    },
    filterHeadText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3
    },
});
