import React, {Component} from 'react';
import {Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {Button, Container, Content, Input, Text, View} from 'native-base';
import {addTestID, AlertUtil, getHeaderHeight,  Colors, PrimaryButton, TextStyles, CommonStyles } from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import {SEGMENT_EVENT, STRIPE_ERROR} from '../../constants/CommonConstants';
import Loader from "../../components/Loader";
import ProfileService from "../../services/Profile.service";
import {connectPayment} from "../../redux";
import Analytics from "@segment/analytics-react-native";
import {PayNowModal} from '../../components/payment/PayNowModal';
import BillingService from '../../services/Billing.service';
import {AddPaymentCardModal} from '../../components/payment/AddPaymentCardModal';

const HEADER_SIZE = getHeaderHeight();

const leftDistance = 550 - ((Dimensions.get('window').width/2) - 45);

const PAYMENT_SUGGESTIONS = [
    {amount: 1, popular: false},
    {amount: 2, popular: false},
    {amount: 3, popular: false},
    {amount: 4, popular: false},
    {amount: 5, popular: true},
    {amount: 10, popular: false},
    {amount: 20, popular: false},
    {amount: 50, popular: false},
];


class CommunityPaymentScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.groupInfo = navigation.getParam('connection', null);
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            isLoading: !!this.groupInfo,
            donationDetails: null,
            customAmount: '10',
            selectedPaymentMeta: '',
            selectedPaymentType: '',
            selectedSuggestionIndex: 5,
            modalOpen: false
        };
    }

    /**
     * @function getGroupDetails
     * @description This method is used to get group details.
     */

    getGroupDetails = async () => {
        try {
            const groupsResponse = await ProfileService.getGroupDetails(this.groupInfo.channelUrl);
            if (groupsResponse.errors) {
                AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
                this.goBack();
            } else {
                if (groupsResponse.isAdmin) {
                    this.goBack();
                } else {
                    if (groupsResponse.donationsEnabled && groupsResponse.groupDonationSettings) {
                        this.setState({
                            isLoading: false,
                            donationDetails: groupsResponse.groupDonationSettings,
                        });
                    } else {
                        this.goBack();
                    }
                }
            }
        } catch (e) {
            this.goBack();
        }
    }

    componentDidMount = async () => {
        if(this.groupInfo) {
            await this.getGroupDetails();
        }

        this.props.fetchWalletSilently();
        this.props.fetchCardsList();
    };

    /**
     * @function navigateToNextScreen
     * @description This method is used to navigate payment method screen.
     */

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.ADD_PAYMENT_METHOD_AND_PAY_SCREEN, {
            amount: this.state.customAmount,
            type : "DONATIONS",
            onSuccess : this.navigateToGroupContributionScreen,
            reference: this.groupInfo.channelUrl
        });
    };

    goBack = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function selectPaymentSuggestion
     * @description This method is used to select payment value from suggested payment list .
     */

    selectPaymentSuggestion = (index) => {
        let {selectedSuggestionIndex} = this.state;
        let customAmount;
        if (selectedSuggestionIndex === index) {
            selectedSuggestionIndex = -1;
            customAmount = 0;
        } else {
            selectedSuggestionIndex = index;
            customAmount = PAYMENT_SUGGESTIONS[index].amount.toString();
        }
        this.setState({selectedSuggestionIndex, customAmount});
    };


    /**
     * @function renderPaymentSuggestions
     * @description This method is used to render suggested payment values .
     */
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
                                              borderColor: Colors.colors.mainBlue60
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
    }


    /**
     * @function navigateToGroupContributionScreen
     * @description This method is used to navigate group Contribution screen.
     */

    navigateToGroupContributionScreen = () => {

        const segmentContributionMadePayload = {
            userId: this.props.auth.meta.userId,
            contributionAmount: this.state.customAmount,
            contributionType:'Group-Donations'
        }
        Analytics.track(SEGMENT_EVENT.CONTRIBUTION_MADE,segmentContributionMadePayload);
        this.props.navigation.replace(Screens.GROUP_CONTRIBUTION_SCREEN, {
            groupInfo : this.groupInfo
        });
    };


    /**
     * @function onChangedCost
     * @description This method is used to remove zero from start.
     */

    onChangedCost = serviceCost => {
        return serviceCost.replace(/^0+/, '');
    };


    /**
     * @function validateCost
     * @description This method is used to validate cost.
     */

    validateCost = () => {
        const costRegex = /^\d+\.\d{0,2}$/;
        let cost = this.state.cost;
        if (cost.startsWith('.')) {
            cost = '0' + cost;
        }
        if (cost.indexOf('.') === -1) {
            cost = cost + '.0';
        }
        if (cost.indexOf('.') === cost.length - 1) {
            return false;
        }
        const costError = !costRegex.test(cost);
        return !costError;
    };

    getSelectedIndex = (cost)=>{
        let index = -1
        PAYMENT_SUGGESTIONS.filter((item,PaymentIndex)=>{
            if(item.amount.toString() === cost){
                index = PaymentIndex;
            }
        });
        return index;
    }

    getMainText = ()=>{
      if(this.groupInfo) {
          return `Thanks for participating in the ${this.groupInfo.name}`;
      } else {
          return `Contribute to Confidant Community`;
      }
    };

    skipPayment = ()=>{
        this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
    }

    openPaymentModal = () => {
        this.setState({
            modalOpen:true
        })
    };

    closePaymentModal = () => {
        this.setState({
            modalOpen:false
        })
    };


    /**
     * @function payViaWallet
     * @description This method is used to pay amount from wallet.
     */
    payViaWallet = async () => {
        this.setState({
            isLoading: true
        })
        try {
            const {customAmount} = this.state;
            const payload = {
                amount: customAmount,
                paymentType: 'DONATIONS',
                reference: this.groupInfo?this.groupInfo.channelUrl:this.appointment.appointmentId,
                metaData: {
                    type: 'DONATIONS',
                    amount: customAmount,
                    appointmentId: this.appointment && this.appointment.appointmentId,
                    channelUrl: this.groupInfo && this.groupInfo.channelUrl
                },
            };

            const walletResponse = await BillingService.deductGenericWalletPayment(payload);
            if (walletResponse.errors) {
                AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage('Payment successful');
                this.props.fetchWalletSilently();
                this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false, payNow: false});
        }
    };


    /**
     * @function payViaCard
     * @description This method is used to pay amount from card.
     */
    payViaCard = async (cardId) => {
        this.setState({
            isLoading: true
        })
        try {
            const {customAmount} = this.state;
            const payload = {
                amount: customAmount,
                paymentType: "DONATIONS",
                paymentToken: cardId,
                reference: this.groupInfo?this.groupInfo.channelUrl:this.appointment.appointmentId,
            };
            const paymentResponse = await BillingService.deductGenericCardPayment(payload);
            if (paymentResponse.errors) {
                console.log(paymentResponse.errors);
                AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                this.setState({ isLoading: false});
            } else {
                //Analytics.track("Payment type " + this.paymentDetails.paymentType + " captured via card", payload);
                AlertUtil.showSuccessMessage("Payment Successful");
                this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };


    /**
     * @function addCard
     * @description This method is used to add new card to the list.
     */
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
                    this.props.fetchCardsList();
                    this.payViaCard(paymentResponse.cardId);
                }

            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false});
        }
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content contentContainerStyle={{paddingTop: 20, paddingBottom: 25}}>
                    <View style={styles.textBox}>

                        <Image
                            {...addTestID('Group-Icon-png')}
                            style={styles.signInIcon}
                            source={require('../../assets/images/group-donation-icon.png')}/>

                        {/*<Image*/}
                        {/*    {...addTestID('Group-Icon-png')}*/}
                        {/*    style={styles.headerImg}*/}
                        {/*    source={{uri: this.groupInfo?.profilePicture ? S3_BUCKET_LINK + this.groupInfo.profilePicture : S3_BUCKET_LINK + DEFAULT_IMAGE}}/>*/}

                        <Text
                            {...addTestID('Heading-1')}
                            style={styles.donationMainText}>
                            {this.getMainText()}
                        </Text>
                        <Text
                            {...addTestID('Heading-2')}
                            style={styles.donationSubText}>
                            Contributions from the community made it possible for you to name your price for this appointment. If you can, it’d be great if you could contribute a little extra too - 100% of your contribution helps others who can’t afford to pay the full price.
                        </Text>
                    </View>
                    {this.renderPaymentSuggestions()}
                    <View style={{paddingHorizontal: 24}}>
                        <View
                            style={styles.yourPayment}>
                            <Text style={styles.payingText}>Your contribution</Text>
                            <Input
                                {...addTestID('cost-input')}
                                style={styles.paymentInput}
                                value={'$'+this.state.customAmount}
                                keyboardType="decimal-pad"
                                onBlur={() => {
                                    this.validateCost();
                                }}
                                onChangeText={cost => {
                                    let customAmount = cost.substring(1);
                                    if(!isNaN(Number(customAmount))) {
                                        this.setState({
                                            customAmount: this.onChangedCost(customAmount),
                                            selectedSuggestionIndex : this.getSelectedIndex(customAmount)
                                        });
                                    }

                                }}
                            />
                        </View>
                    </View>

                    <View
                        {...addTestID('group-donation')}
                        style={styles.greBtn}>
                        <PrimaryButton
                            testId="continue"
                            disabled = {!this.state.customAmount}
                            onPress={() => {
                                this.openPaymentModal();
                            }}
                            text="Continue"
                        />
                    </View>
                    <Button
                        onPress={() => {
                            this.skipPayment();
                        }}
                        transparent style={styles.skipBtn}>
                        <Text style={{...CommonStyles.styles.blueLinkText, marginTop:5}}>No, Thanks</Text>
                    </Button>
                </Content>
                <PayNowModal
                    onClose={this.closePaymentModal}
                    visible={this.state.modalOpen}
                    wallet={this.props.payment.wallet}
                    paymentCards={this.props.payment.cardsList}
                    amount={this.state.customAmount}
                    addCardSelected={()=>{
                        this.setState({
                            modalOpen: false,
                            addNewCardModal: true
                        })
                    }}
                    payByWallet={this.payViaWallet}
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
    header: {
        height: HEADER_SIZE,
        paddingLeft: 22
    },
    signInIcon: {
        marginTop: 40,
        marginBottom: 40
    },
    headerImg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 24
    },
    textBox: {
        marginTop: 40,
        alignItems: 'center',
        paddingLeft: 40,
        paddingRight: 40,
        marginBottom: 24
    },
    blueBg: {},
    donationMainText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 20,
        textAlign: 'center'
    },
    donationSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    donationSubNoteText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextS,
        textAlign: 'center',
        color: Colors.colors.mediumContrast,
        marginBottom: 22,
        paddingLeft: 16,
        paddingRight: 16
    },
    optionList: {
        paddingTop: 30,
        paddingBottom: 30
    },
    multiList: {
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 26,
        paddingTop: 22,
        paddingBottom: 22,
        paddingRight: 18
    },
    multiListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.321429,
        color: '#515d7d',
        paddingLeft: 18,
        flex: 1,
        fontWeight: '500',
        lineHeight: 15
    },
    multiListDescText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        letterSpacing: 0.3,
        color: '#515d7d',
        flex: 1,
        fontWeight: 'normal',
        lineHeight: 14
    },
    multiCheck: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        paddingLeft: 1
    },
    multiCheckSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
        paddingLeft: 0,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    paymentOptions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        color: '#b3bec9',
        fontSize: 13,
        lineHeight: 16,
        fontFamily: 'Roboto-Regular',
        textTransform: 'capitalize',
    },
    inputContainer: {
        borderBottomColor: '#ebebeb',
        borderBottomWidth: 1,
    },
    input: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Roboto-Regular',
        color: '#515d7d',
    },
    yourPayment: {
        ...CommonStyles.styles.shadowBox,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginTop: 24,
        marginBottom: 32,
        backgroundColor: Colors.colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.borderColorLight,
        height: 64
    },
    payingText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    paymentInput: {
        backgroundColor: Colors.colors.white,
        ...CommonStyles.styles.manropeMedium,
        ...CommonStyles.styles.bodyTextL,
        borderRadius: 4,
        maxWidth: 100,
        height: 48,
        textAlign: 'right',
        color: Colors.colors.highContrast
    },
    savingText: {
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        lineHeight: 26,
        letterSpacing: 0.8,
        textAlign: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 24,
        marginTop: 24,
    },
    redText: {
        color: '#D0021B',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 26,
        letterSpacing: 0.8,
    },
    paymentTypes: {
        padding: 24
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
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    singleTypeSelected: {
        borderWidth: 0.5,
        borderColor: 'rgba(63, 178, 254, 0.07)',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        padding: 22,
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
        paddingLeft: 20,
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
    popularText: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.mediumContrast
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
        marginBottom: 24
    },
    payText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.primaryText
    },
    paymentCarousal: {
        // height: 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 20,
        paddingLeft: 20
    },
    contributionBoxes: {
        padding: 10,
    },
    btnStyle: {
        marginBottom: 24,
    },
    greBtn: {
        paddingTop: 15,
        paddingHorizontal: 24
    },
    skipBtn: {
        alignSelf: 'center',
        marginTop: 20,
        // paddingBottom: 10
    },

});


export default connectPayment()(CommunityPaymentScreen);
