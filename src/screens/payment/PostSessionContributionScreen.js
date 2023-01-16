import React, {Component} from 'react';
import {ScrollView, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, Container, Content, Text} from 'native-base';
import {addTestID, isIphoneX } from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import LinearGradient from 'react-native-linear-gradient';
import {Screens} from '../../constants/Screens';
import {connectPayment} from "../../redux";
import AppointmentService from '../../services/Appointment.service';
import Loader from '../../components/Loader';
import Analytics from "@segment/analytics-react-native";
import { SEGMENT_EVENT } from "../../constants/CommonConstants";

const PAYMENT_SUGGESTIONS = [
    {amount: 2, popular: false},
    {amount: 5, popular: false},
    {amount: 10, popular: true},
    {amount: 20, popular: false},
    {amount: 50, popular: false},
];

class PostSessionContributionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.appointment = navigation.getParam('appointment', null);
        this.feedbackSkipped = navigation.getParam('feedbackSkipped', false);

        this.state = {
            isLoading: false,
            prePaymentDetails: {
                marketRate: this.appointment.marketCost || this.appointment.serviceCost,
                cost: this.appointment.serviceCost,
                paid: (this.appointment.prePayment && this.appointment.prePayment.amountPaid) || 0,
            },
            selectedSuggestionIndex: -1,
            amountToContribute: 0,
        };
    };


    selectPaymentSuggestion = (index) => {
        let {selectedSuggestionIndex} = this.state;
        let amountToContribute;
        if (selectedSuggestionIndex === index) {
            selectedSuggestionIndex = -1;
            amountToContribute = 0;
        } else {
            selectedSuggestionIndex = index;
            amountToContribute = PAYMENT_SUGGESTIONS[index].amount;
        }
        this.setState({selectedSuggestionIndex, amountToContribute});
    };

    renderPaymentSuggestions = () => {
        return <View>


            <View style={styles.leftGradient}>
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    locations={[0.0, 0.7, 1.0]}
                    colors={['#fff', 'rgba(255,255,255,0)', 'rgba(255,255,255,0)']}
                    style={{flex: 1}}
                >
                </LinearGradient>
            </View>
            <ScrollView showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.paymentCarousal}
                        horizontal
                        ref={(ref) => {
                            this.scrollView = ref;
                        }}
                        onLayout={() => {
                            setTimeout(() => {
                                if (this.scrollView) {
                                    this.scrollView.scrollTo({x: 80, y: 0, animated: true});
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
                                                  borderColor: '#3DB3FE'
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
            </ScrollView>
            {/*<View style={styles.rightGradient}/>*/}

            <View style={styles.rightGradient}>
                <LinearGradient
                    end={{x: 0, y: 0}}
                    start={{x: 1, y: 0}}
                    locations={[0, 0.7, 0.7]}
                    colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0)']}
                    style={{flex: 1}}
                >
                </LinearGradient>
            </View>


        </View>;
    };

    associateSuccessfulPayment = async (chargeId) => {
        this.setState({ isLoading: true});
        const payload = {
            amountPaid: Number(this.state.amountToContribute),
            chargeId,
        };

        if (chargeId) {
            payload.paymentMethod = 'Stripe';
        } else {
            payload.paymentMethod = 'Wallet';
        }
        const response = await AppointmentService.associateSessionPostPayment(this.appointment.appointmentId, payload);
        if (response.errors) {
            console.log('Unable to associate post payment with appointment');
        }

        const segmentContributionMadePayload = {
            userId: this.props.auth.meta.userId,
            contributionAmount: payload.amountPaid,
            contributionType:'SESSION_POST_PAYMENT'
        }
        await Analytics.track(SEGMENT_EVENT.CONTRIBUTION_MADE,segmentContributionMadePayload);

        this.props.navigation.replace(Screens.COMMUNITY_CONGRATS_SCREEN, {
            ...this.props.navigation.state.params,
            amount: payload.amountPaid,
            appointment: this.appointment,
            rewardType: 'APPOINTMENT',
            reference: this.appointment.appointmentId,
        });

    };


    skipPayment = () => {

        if (this.feedbackSkipped || this.appointment.feedback) {
            this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
        } else {
            this.props.navigation.replace(Screens.PRIVATE_FEEDBACK_SCREEN, this.props.navigation.state.params);
        }
    };

    navigateToNext = () => {
        if (this.state.amountToContribute > 0) {
            this.props.navigation.navigate(Screens.GENERIC_PAYMENT_SCREEN, {
                paymentDetails: {
                    title: 'Contribution to Community',
                    amount: Number(this.state.amountToContribute),
                    subTitle: 'Confirm & Pay',
                    paymentType: 'SESSION_POST_PAYMENT',
                    reference: this.appointment.appointmentId,
                },
                onPaymentSuccess: this.associateSuccessfulPayment,
            });

        } else {
            this.skipPayment();
        }
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const {marketRate, cost, paid} = this.state.prePaymentDetails;
        const lessThanCost = paid < cost;
        const saved = (100 - cost / marketRate * 100).toFixed(0);
        const contribution = paid - cost;
        const contributionRequired = paid <= cost;

        if (this.state.isLoading) {
            return <Loader/>;
        }

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Content
                        contentContainerStyle={{padding: isIphoneX()? 0 : 24}}
                        scrollIndicatorInsets={{right: 1}}>
                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                        </View>
                        <Text
                            {...addTestID('telehealth-post-payment')}
                            style={styles.paymentTitle}>Contribute to Confidant community</Text>
                        {/*<View style={styles.contributionBoxes}>*/}
                        {/*    <View style={styles.firstRow}>*/}
                        {/*        <View style={styles.marketBox}>*/}
                        {/*            <Text style={styles.paymentAmountText}>${marketRate}</Text>*/}
                        {/*            <Text style={styles.paymentDesc}>Market Rate</Text>*/}
                        {/*        </View>*/}
                        {/*        <View style={styles.costBox}>*/}
                        {/*            <Text style={styles.paymentAmountText}>${cost}</Text>*/}
                        {/*            <Text style={styles.paymentDesc}>Our Cost</Text>*/}
                        {/*        </View>*/}
                        {/*    </View>*/}
                        {/*    {*/}
                        {/*        !lessThanCost && (*/}
                        {/*            <View style={styles.centerRow}>*/}
                        {/*                <Text style={styles.paymentAmountText}>${paid}</Text>*/}
                        {/*                <Text style={styles.paymentDesc}>You Paid</Text>*/}
                        {/*            </View>*/}
                        {/*        )*/}
                        {/*    }*/}


                        {/*    <View style={styles.firstRow}>*/}
                        {/*        {*/}
                        {/*            !lessThanCost ? (*/}
                        {/*                <View style={styles.savingBox}>*/}
                        {/*                    <Text style={styles.paymentAmountText}>{saved}%</Text>*/}
                        {/*                    <Text style={styles.paymentDesc}>You Saved</Text>*/}
                        {/*                </View>*/}
                        {/*            ) : (*/}
                        {/*                <View style={styles.lessPaid}>*/}
                        {/*                    <Text style={styles.paymentAmountText}>${paid}</Text>*/}
                        {/*                    <Text style={styles.paymentDesc}>You Paid</Text>*/}
                        {/*                </View>*/}
                        {/*            )*/}
                        {/*        }*/}
                        {/*        {*/}
                        {/*            contribution >= 0 && (*/}
                        {/*                <View style={styles.contributionBox}>*/}
                        {/*                    <Text style={styles.paymentAmountText}>${contribution}</Text>*/}
                        {/*                    <Text style={styles.paymentDesc}>You Contributed</Text>*/}
                        {/*                </View>*/}
                        {/*            )*/}
                        {/*        }*/}
                        {/*        {*/}
                        {/*            lessThanCost && (*/}
                        {/*                <View style={styles.communityPaid}>*/}
                        {/*                    <Text style={styles.paymentAmountText}>${contribution * -1}</Text>*/}
                        {/*                    <Text style={styles.paymentDesc}>Community Paid</Text>*/}
                        {/*                </View>*/}
                        {/*            )*/}
                        {/*        }*/}


                        {/*    </View>*/}
                        {/*</View>*/}
                        <View style={styles.communityDescriptor}>
                            <Text
                                style={styles.communityText}>{contributionRequired ? 'Can you make a contribution? 100% of your funds go to ' +
                                '                                help someone else.' : '100% of your contribution goes to patient care.'}</Text>
                        </View>
                        {
                            contributionRequired && this.renderPaymentSuggestions()
                        }

                    </Content>

                    <View style={styles.btnStyle}>
                        <Button
                            onPress={() => {
                                this.skipPayment();
                            }}
                            transparent style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip For Now</Text>
                        </Button>
                        <GradientButton
                            testId="continue"
                            onPress={this.navigateToNext}
                            text="Continue"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
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
        color: '#505D7E',
        fontWeight: '500',
    },
    paymentBox: {
        width: 90,
        height: 90,
        borderRadius: 10,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 1.0,
        shadowRadius: 2.84,
        marginRight: 16,
        elevation: 2,
        marginBottom: 25,
        marginTop: 25

    },
    payText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 22,
        color: '#3DB3FE',
    },
    paymentCarousal: {
        // width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        // alignItems: 'flex-start',
        paddingRight: 20,
        // marginRight: 10,
        // backgroundColor: '#FAF6E9'
    },
    contributionBoxes: {
        marginLeft: 24,
        marginRight: 24,
        paddingBottom: 26
    },
    communityText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        letterSpacing: 0.8,
        textAlign: 'center',
        color: '#515D7D',
        lineHeight: 25.5,
    },
    communityDescriptor: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 40,
        marginBottom: 40
    },
    firstRow: {
        flexDirection: 'row',
        marginBottom: 16
    },
    skipBtn: {
        alignSelf: 'center',
        // marginTop: 10,
        paddingTop: 0
    },
    skipText: {
        color: '#3FB2FE',
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 22.5
    },
    lessPaid: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 10,
        backgroundColor: '#FAF6E9',
        height: 110,
        borderRadius: 10,
    },
    paymentAmountText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 15,
        letterSpacing: 0.3,
        fontWeight: '500',
        color: '#22242A',
        lineHeight: 15,
        marginBottom: 16
    },
    paymentDesc: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        fontSize: 15,
        letterSpacing: 0.47,
        lineHeight: 17.5,
        color: '#25345C'
    },
    marketBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(247, 135, 149, 0.12)',
        marginRight: 8,
        height: 98,
        width: 155,
        borderRadius: 8,
    },
    costBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#EEEAFF',
        height: 98,
        width: 155,
        borderRadius: 10,
        marginLeft: 8,

    },
    centerRow: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(243, 219, 115, 0.16)',
        height: 98,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#F3DB73',
        marginBottom: 16,
    },
    savingBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(119, 199, 11, 0.1)',
        marginRight: 8,
        height: 98,
        width: 155,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#77C70B',
    },
    contributionBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(63, 178, 254, 0.12)',
        marginLeft: 8,
        height: 98,
        width: 155,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3FB2FE',
    },
    communityPaid: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#E7F3FE',
        margin: 10,
        height: 110,
        borderRadius: 10,
    },
    paymentTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginBottom: 24,
        paddingLeft: 40,
        width: '90%',
        paddingRight: 40,
        alignSelf: 'center',
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    singleProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4,
    },
    singleSelectedProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        marginLeft: 4,
        marginRight: 4,
    },
    singleHalfProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4,
        overflow: 'hidden',
    },
    halfInner: {
        backgroundColor: '#3fb2fe',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 12,
    },
    btnStyle: {
        padding: 24,
        paddingBottom: 24,
        alignItems: 'center'
    },
});
export default connectPayment()(PostSessionContributionScreen);
