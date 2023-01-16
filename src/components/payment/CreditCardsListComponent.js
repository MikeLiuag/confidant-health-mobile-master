import React, { Component } from "react";
import {FlatList, Image, StyleSheet, TouchableOpacity, TouchableHighlight, View} from 'react-native';
import {Button, Content, Text} from 'native-base';
import { Screens } from "../../constants/Screens";
import Icon from 'react-native-vector-icons/FontAwesome';
import {addTestID, AlertUtil, isIphoneX} from 'ch-mobile-shared';
import Loader from 'ch-mobile-shared/src/components/Loader';
import { SwipeListView } from 'react-native-swipe-list-view';

export default class CreditCardsListComponent extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            highlighted: this.props.cardId
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if(this.props.cardId && prevProps.cardId!==this.props.cardId) {
            this.setState({
                highlighted: this.props.cardId
            })
        }
    }


    render() {
        if (this.props.isLoading) {
            return <View style={{ height: 200}}><Loader/></View>;
        }

        return this.props.cardListData && this.props.cardListData.length > 0 ?
                    <View {...addTestID('card-box')}
                          style={styles.cardBox}>
                        {!this.props.showDeleteSection?

                        <View style={styles.cardListHead}>
                            <Text {...addTestID('payment-method')}
                                  style={styles.methodText}>Payment Method(s)</Text>
                            <Button
                                {...addTestID('Manage')}
                                style={styles.manageBtn}
                                transparent
                                onPress={()=> this.props.cardList(true)}>
                                <Text {...addTestID('manage-txt')}
                                      uppercase={false} style={styles.manageText}>Manage</Text>
                            </Button>
                        </View>
                       :null}



                        <SwipeListView
                            data={this.props.cardListData}
                            renderItem={({item}) => (
                                <TouchableHighlight
                                    {...addTestID('Pay-Now-Button')}
                                    underlayColor={'#FFF'}
                                    onPress={() => {
                                        this.props.showDeleteSection ? null :  this.props.showPayNowButton(this.props.appointmentId, item.cardId);this.setState({highlighted: item.cardId})
                                    }}
                                >
                                    <View {...addTestID('card-button')}
                                          key={item.last4}
                                          style={this.state.highlighted===item.cardId? {...styles.singleCard, borderColor:this.props.showDeleteSection? 'rgba(0,0,0,0.05)' : '#3fb2fe'} : styles.singleCard}>
                                        <Image
                                            {...addTestID('Visa-png')}
                                            resizeMode='contain'
                                            style={styles.cardImg}
                                            source={item.brand === 'Visa' ? require('../../assets/images/visa.png') : require('../../assets/images/master.png')}/>
                                        <View style={styles.cardDes}>
                                            <Text {...addTestID('card-holder-name')}
                                                  style={styles.cardName}>{item.cardHolderName}</Text>
                                            <Text {...addTestID('card-ending')}
                                                  style={styles.cardNum}>Ending {item.last4}</Text>
                                        </View>

                                    </View>

                                </TouchableHighlight>
                            )}
                            renderHiddenItem={({item})=> (
                                this.props.showDeleteSection && (<View style={styles.rowBack}>
                                    <Button
                                        {...addTestID('Delete')}
                                        onPress={() =>{this.props.deleteCard(item.cardId)}}
                                        transparent
                                        style={styles.backRightBtn}>
                                        <Text style={{color: 'white', textAlign: 'center'}}>Delete</Text>
                                    </Button>
                                </View>)
                            )}
                            keyExtractor={(item, index) => {
                                return index.toString();
                            }}
                            rightOpenValue={-85}
                            stopRightSwipe={-90}
                            closeOnScroll={true}
                            closeOnRowPress={true}
                            closeOnRowBeginSwipe={true}
                            closeOnRowOpen={true}
                            disableRightSwipe={true}
                            swipeToOpenPercent={100}
                            swipeToClosePercent={100}
                        />


                    </View>
            :
            <View style={{ padding: 24}}>
                <Text style={styles.notFoundText}>You need to add a card to your account to pay.Click Add Card at the bottom of this page.</Text>
            </View>



    }
}

const styles = StyleSheet.create({
    backTextWhite: {
        color: '#FFF'
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingLeft: 15,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: '#fff',
        minHeight: 65,
        overflow: 'hidden'
    },
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85,
        backgroundColor: '#d0021b',
        height: 65
    },
    notFoundText: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 19.5,
        letterSpacing: 0,
        textAlign: 'center'
    },
    outlineBtn: {
        borderColor: '#3fb2fe',
        borderWidth: 0.3,
        borderRadius: 8,
        backgroundColor: '#fff',
        height: 65,
        justifyContent: 'center',
        elevation: 0,
        marginTop: 20,
        marginBottom: 8,
        shadowColor: '#969fa8',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 10,
        shadowOpacity: 0.01
    },
    outlineText: {
        color: '#3fb2fe',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    cardBox: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5'
    },
    cardListHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    methodText: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 15,
        fontSize: 14,
        letterSpacing: 0.47,
        fontWeight: '500'
    },
    manageBtn: {
        marginRight: 0,
        paddingRight: 0
    },
    manageText: {
        color: '#3fb2fe',
        fontSize: 14,
        letterSpacing: 0.3,
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        paddingRight: 0
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
        minHeight: 65
        // padding: 17
    },
    cardImg: {
        width: 38,
        height: 30,
        marginLeft: 24
    },
    cardDes: {
        flex: 2,
        paddingLeft: 24
    },
    cardName: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 13,
        fontSize: 13,
        letterSpacing: 0.28,
        marginBottom: 4
    },
    cardNum: {
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.28,
        fontFamily: 'Roboto-Regular'
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    lockText: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0,
        paddingLeft: 10
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
    dltBtn: {
        backgroundColor: '#d0021b',
        height: 65,
    },
    dltText: {
        color: '#fff',
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.3
    },
});
