import React, {Component} from 'react';
import {Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Left, Text, View} from 'native-base';
import {
    AddFundsBox,
    addTestID,
    AlertUtil,
    AlfieLoader,
    BackButton,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from 'ch-mobile-shared';
import BillingService from '../../services/Billing.service';
import {Screens} from '../../constants/Screens';
import {connectPayment} from '../../redux';
import {SavingsContent} from '../../components/SavingsContent';
import {AddPaymentCardModal} from '../../components/payment/AddPaymentCardModal';
import {APPOINTMENT_STATUS, SEGMENT_EVENT, STRIPE_ERROR} from '../../constants/CommonConstants';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import AppointmentService from '../../services/Appointment.service';
import Analytics from '@segment/analytics-react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import {ProgressBar} from "react-native-paper";
import Modal from "react-native-modalbox";

const HEADER_SIZE = getHeaderHeight();


class NewPaymentDetailsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedProvider = navigation.getParam('selectedProvider', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.selectedSchedule = navigation.getParam('selectedSchedule', null);
        this.onConfirmOrRequestAppointmentByMember = navigation.getParam('onConfirmOrRequestAppointmentByMember', null);
        this.appointment = navigation.getParam('appointment', null);
        this.primaryConcern = navigation.getParam('primaryConcern', null);
        this.payee = navigation.getParam('payee', null);
        const selectedServiceCost = this.selectedService && this.selectedService?.recommendedCost
            ? this.selectedService.recommendedCost.toString()
            : '1';

        this.state = {
            isLoading: false,
            walletSelected: this.props.payment?.wallet?.balance > selectedServiceCost,
            selectedCardId: this.props.payment?.wallet?.balance < selectedServiceCost ? (this.props.payment?.cardsList &&
                this.props.payment?.cardsList?.length > 0 && this.props.payment?.cardsList[0]?.cardId || 'new_card'):null,
            cost:
                this.selectedService
                    ? this.selectedService?.cost.toString()
                    : '1',
        };
    }

    componentDidMount(): void {
        this.props.fetchWallet();
        this.props.fetchCardsList();
    }

    navigateBack() {
        this.props.navigation.goBack();
    }

    getCostPercentage = (cost, total) => {
        return cost / total * 100;
    };

    getPercentage = (read, total) => {
        if (total === 0) {
            return 0;
        } else {
            return read * 100 / total;
        }
    };

    selectWallet = () => {
        if (this.props.payment.wallet.balance < this.state.cost) {
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
            if (this.props.payment.wallet.balance < this.state.cost) {
                return false;
            }
        }
        return Number(this.state.cost) > 0;

    };


    addCard = async (creditCardInput) => {
        this.setState({isLoading: true, cardModalOpen: false});
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
                } else {
                    this.setState({
                        selectedCardId: paymentResponse.cardId,
                        walletSelected : false
                    });
                    this.props.fetchCardsList();
                    await Analytics.identify(this.props.auth?.meta?.userId, {
                        hasCardAddedSuccessfully : true
                    });
                    AlertUtil.showSuccessMessage('Card added successfully');
                }
                this.setState({isLoading: false});
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false});
        }

    };

    bookOrConfirmAppointment = () => {
        this.setState({
            isLoading: true,
        });
        if (this.appointment) {
            this.confirmAppointment();
        } else {
            this.bookAppointment();
        }
    };


    confirmAppointment = async () => {
        const {appointment} = this;
        let segmentEvent,response;
        if(appointment.isChanged) {
            segmentEvent = SEGMENT_EVENT.APPOINTMENT_CHANGE_REQUESTED;
            const payload = {
                appointmentId: appointment.appointmentId,
                participantId: appointment.participantId,
                serviceId: appointment.serviceId,
                slot: appointment.selectedSchedule.slot,
                day: parseInt(appointment.selectedSchedule.day),
                month: parseInt(appointment.selectedSchedule.month),
                year: appointment.selectedSchedule.year,
                comment: null,
                timeZone: momentTimeZone.tz.guess(true),
                payee:this.payee
            };
            console.log(payload);
            response = await AppointmentService.requestChanges(payload.appointmentId, payload)
        } else {
            segmentEvent = SEGMENT_EVENT.APPOINTMENT_CONFIRMED;
            const payload = {
                appointmentId: appointment.appointmentId,
                paymentDetails: null,
            };
            response = await AppointmentService.confirmAppointment(payload);
        }
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            this.payForAppointment(appointment.appointmentId, segmentEvent);
        }

    };

    bookAppointment = async () => {
        try {
            const payloadForApi = {
                participantId: this.selectedProvider.userId,
                providerName: this.selectedProvider.name,
                serviceId: this.selectedService.id,
                slot: this.selectedSchedule.slot,
                day: this.selectedSchedule.day,
                month: parseInt(this.selectedSchedule.month),
                year: this.selectedSchedule.year,
                primaryConcern: this.primaryConcern,
                timeZone: momentTimeZone.tz.guess(true),
                payee:this.payee
            };
            console.log(payloadForApi);
            const response = await AppointmentService.requestAppointment(payloadForApi);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                // this.setState({isLoading: false, paymentDone: true});
                // await Analytics.track(SEGMENT_EVENT.APPOINTMENT_REQUESTED, segmentPayload);
                // this.performDangerousNavigation();
                this.payForAppointment(response.id, SEGMENT_EVENT.APPOINTMENT_REQUESTED);
            }
        } catch (e) {
            console.log(e);
            this.setState({
                isLoading: false,
            });
        }
    };

    trackSegment = async (paymentMethod, segmentEvent) => {
        const segmentPayload = {
            selectedProvider: this.selectedProvider?.name,
            appointmentDuration: this.selectedService?.duration,
            appointmentCost: this.selectedService?.cost,
            appointmentMarketRate: this.selectedService?.marketCost,
            appointmentRecommendedPayment: this.selectedService?.recommendedCost,
            selectedService: this.selectedService?.name,
            selectedSchedule: this.selectedSchedule?.dateDesc,
            requestedAt: moment.utc(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
            startTime: this.selectedSchedule?.slotStartTime?.time + this.selectedSchedule?.slotStartTime?.amPm,
            endTime: this.selectedSchedule?.slotEndTime?.time + this.selectedSchedule?.slotEndTime?.amPm,
            appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
            primaryConcern: this.primaryConcern,
            userId: this.props.auth.meta.userId,
            serviceType: this.selectedService?.serviceType,
            paymentAmount: this.state.cost,
            paymentMethod: paymentMethod,
            amountInWallet: this.props.payment.wallet.balance,
            confidantFundsInWallet: this.props.payment.wallet.balance,
        };

        await Analytics.track(segmentEvent, segmentPayload);

    };

    payViaCard = async (appointmentId, cardId, segmentEvent) => {
        try {
            const {cost} = this.state;
            const payload = {
                amount: cost,
                paymentType: 'APPOINTMENT_CHARGES',
                paymentToken: cardId,
                reference: appointmentId,
            };
            const paymentResponse = await BillingService.payForAppointmentByCard(appointmentId, payload);
            if (paymentResponse.errors) {
                AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage('Payment successful');
                await Analytics.identify(this.props.auth?.meta?.userId, {
                    hasScheduledAnAppointment: true
                });
                await this.trackSegment('Stripe', segmentEvent);
                this.performDangerousNavigation();
            }

        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };

    payViaWallet = async (appointmentId, segmentEvent) => {
        try {
            const {cost} = this.state;
            const payload = {
                amount: cost,
                paymentType: 'APPOINTMENT_CHARGES',
                reference: appointmentId,
                metaData: {
                    type: 'APPOINTMENT_CHARGES',
                    amount: cost,
                    appointmentId,
                },
            };

            const walletResponse = await BillingService.deductGenericWalletPayment(payload);
            if (walletResponse.errors) {
                AlertUtil.showErrorMessage(walletResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage('Payment successful');
                this.props.fetchWalletSilently();
                await Analytics.identify(this.props.auth?.meta?.userId, {
                    hasScheduledAnAppointment : true
                });
                await this.trackSegment('Wallet', segmentEvent);
                this.performDangerousNavigation();
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false, payNow: false});
        }
    };

    payForAppointment = (appointmentId, segmentEvent) => {
        if (this.canPay()) {
            if (this.state.walletSelected) {
                this.payViaWallet(appointmentId, segmentEvent);
            } else {
                this.payViaCard(appointmentId, this.state.selectedCardId, segmentEvent);
            }
        }
    };

    //TODO: Replace this with proper implementation
    performDangerousNavigation = () => {
        let {appointment} = this.state;
        let isRequested;
        if (this.appointment) {
            isRequested = !!this.appointment.isChanged;
            appointment = this.appointment;
        } else {
            isRequested = true;
        }
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({
                    routeName: Screens.TAB_VIEW,
                    action: NavigationActions.navigate({
                        routeName: Screens.APPOINTMENTS_SCREEN,
                    }),
                }),
                NavigationActions.navigate({
                    routeName: Screens.APPOINTMENT_SUBMITTED,
                    params: {
                        selectedProvider: this.selectedProvider,
                        selectedService: this.selectedService,
                        selectedSchedule: this.selectedSchedule,
                        appointment: appointment,
                        isRequest: isRequested,
                    },
                }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    };

    showMarketRateDrawer = () => {
        this.refs?.marketRateDrawer?.open()
    };
    showOurCostDrawer = () => {
        this.refs?.ourCostDrawer?.open()
    };
    showRecommendedAmountDrawer = () => {
        this.refs?.recommendedAmountDrawer?.open()
    };

    getPaymentText = () => {
        const actual = this.state.cost / this.selectedService?.marketCost;
        const actualResult = parseFloat(actual * 100).toFixed(0);
        //const savings = 100 - actualResult;
        const dollarSaved = parseFloat(this.selectedService?.recommendedCost - this.state?.cost).toFixed(2)
        const contribution = parseFloat(this.state.cost - this.selectedService?.cost).toFixed(2);
        const communityPaying = parseFloat(this.selectedService?.cost - this.state.cost).toFixed(2);
        return (
            <View style={styles.subTitleWrap}>
                {(() => {
                    if (this.state.cost > this.selectedService.cost) {
                        return (
                            <View>
                                <Text style={styles.subDesTitle}>You’re paying the recommended amount</Text>
                                <Text style={styles.subDesText}>
                                    You’re{' '}
                                    {dollarSaved > 1 ? (
                                        <Text style={styles.subDesText}>
                                            <Text style={styles.subDesText}>saving ${dollarSaved}</Text> and{''}
                                        </Text>
                                    ) : null}{' '}
                                    <Text style={styles.subDesText}>
                                        contributing ${contribution}
                                    </Text>{' '}
                                    to the Confidant Community. 100% of you're  <Text style={styles.subDesText}>${contribution}</Text> will go to someone else’s clinical care.
                                </Text>
                            </View>
                        );
                    } else if (this.state.cost === this.selectedService?.cost) {
                        return (
                            <View>
                                <Text style={styles.subDesTitle}>You’re paying our cost</Text>
                                <Text style={styles.subDesText}>
                                    You’re <Text style={styles.subDesText}>saving ${dollarSaved}</Text>{' '}
                                    and not contributing to the Confidant Community.
                                </Text>
                            </View>
                        );
                    } else if (this.state.cost < this.selectedService.cost) {
                        return (
                            <View>
                                <Text style={styles.subDesTitle}>You’re paying less then our cost</Text>
                                <Text style={styles.subDesText}>
                                    Confidant community is helping you to cover{' '}
                                    <Text style={styles.subDesText}> ${communityPaying}</Text> for
                                    your appointment.
                                </Text>
                            </View>
                        );
                    }
                })()}
            </View>
        )
    }
    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }
        // const progressValue = this.getPercentage(this.getReadCount(), this.state.contentList.length) / 100;
        const progressValueMarketRate = this.getCostPercentage(this.selectedService.recommendedCost, this.selectedService.marketCost) / 100;
        const progressValueOurCost = this.getCostPercentage(this.selectedService.cost, this.selectedService.marketCost) / 100;
        const progressValueRecommendedAmount = this.getCostPercentage(this.selectedService.recommendedCost, this.selectedService.marketCost) / 100;
        const isInvalidCost = this.state.cost === '' || isNaN(Number(this.state.cost)) || Number(this.state.cost) > 100000;
        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
                        <Body/>
                    </Header>
                    <Content  showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 24}}>
                        <View style={styles.titleWrap}>
                            <Text style={{...CommonStyles.styles.commonAptHeader}}>
                                Pick your price
                            </Text>
                            <Text style={styles.subText}>
                                If you can pay it forward, we hope you do. If you can’t afford our costs, the Confidant
                                Community will cover the difference.
                            </Text>
                        </View>
                        <View style={{marginBottom: 24}}>
                            <AddFundsBox
                                fundAmount={this.state.cost}
                                decrementAmount={() => {
                                    this.setState({
                                        cost: this.state.cost - 1,
                                    });
                                }}
                                incrementAmount={() => {
                                    this.setState({
                                        cost: Number(this.state.cost) + 1,
                                    });
                                }}
                                setCustomAmount={(cost) => {
                                    this.setState({
                                        cost,
                                    });
                                }}
                            />
                        </View>
                        {!isInvalidCost && this.state.cost>0 && (
                            this.getPaymentText()
                        )}
                        <View style={styles.rateList}>
                            <View style={styles.singleRate}>
                                <View style={styles.rateContent}>
                                    <View style={styles.rateHead}>
                                        <TouchableOpacity
                                            style={styles.infoBtn}
                                            onPress={this.showMarketRateDrawer}
                                            transparent>
                                            <Icon name={'info'} type={'Feather'} style={styles.infoIcon}/>
                                        </TouchableOpacity>
                                        <Text style={styles.rateTitle}>Market rate</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.rateValue, {color: Colors.colors.secondaryText}]}>
                                            {this.selectedService.marketCost
                                                ? '$' + this.selectedService.marketCost
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <ProgressBar style={styles.progressBarr}
                                             progress={progressValueMarketRate}
                                             color={Colors.colors.secondaryIcon}/>
                            </View>

                            <View style={styles.singleRate}>
                                <View style={styles.rateContent}>
                                    <View style={styles.rateHead}>
                                        <TouchableOpacity
                                            style={styles.infoBtn}
                                            onPress={this.showOurCostDrawer}
                                            transparent>
                                            <Icon name={'info'} type={'Feather'} style={styles.infoIcon}/>
                                        </TouchableOpacity>
                                        <Text style={styles.rateTitle}>Our cost</Text>
                                    </View>
                                    <View>
                                        <Text
                                            style={[styles.rateValue, {color: Colors.colors.primaryText}]}>{this.selectedService.cost
                                            ? '$' + this.selectedService.cost
                                            : 'N/A'}</Text>
                                    </View>

                                </View>
                                <ProgressBar style={styles.progressBarr}
                                             progress={progressValueOurCost}
                                             color={Colors.colors.mainBlue}/>
                            </View>

                            <View style={styles.singleRate}>
                                <View style={styles.rateContent}>
                                    <View style={styles.rateHead}>
                                        <TouchableOpacity
                                            style={styles.infoBtn}
                                            onPress={this.showRecommendedAmountDrawer}
                                            transparent>
                                            <Icon name={'info'} type={'Feather'} style={styles.infoIcon}/>
                                        </TouchableOpacity>
                                        <Text style={styles.rateTitle}>Recommended amount</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.rateValue, {color: Colors.colors.successText}]}>
                                            {this.selectedService.recommendedCost
                                                ? '$' + this.selectedService.recommendedCost
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <ProgressBar style={styles.progressBarr}
                                             progress={progressValueRecommendedAmount}
                                             color={Colors.colors.successIcon}/>
                            </View>
                        </View>
                        {/*<View style={styles.rangeWrapper}>*/}
                        {/*    <View style={styles.valueBox}>*/}
                        {/*        /!* {*/}
                        {/*            this.selectedService.marketCost < 1 && *!/*/}

                        {/*        <Text style={styles.minValue}>$0</Text>*/}
                        {/*        <Text style={styles.maxValue}>{this.selectedService.marketCost*/}
                        {/*            ? '$' + this.selectedService.marketCost*/}
                        {/*            : 'N/A'}</Text>*/}
                        {/*    </View>*/}
                        {/*    <View style={styles.rangeInner}>*/}
                        {/*        <View style={styles.pinkBar}/>*/}
                        {/*        <View*/}
                        {/*            style={[styles.greenBar, {width: this.getCostPercentage(this.selectedService.recommendedCost, this.selectedService.marketCost) + '%'}]}>*/}
                        {/*            <View style={styles.greenValue}>*/}
                        {/*                <Text*/}
                        {/*                    style={styles.greenValueText}>${this.selectedService.recommendedCost}</Text>*/}
                        {/*                <Image*/}
                        {/*                    style={styles.greenIndicator}*/}
                        {/*                    source={require('../../assets/images/green-indicator.png')}/>*/}
                        {/*            </View>*/}
                        {/*        </View>*/}
                        {/*        <View*/}
                        {/*            style={[styles.blueBar, {width: this.getCostPercentage(this.selectedService.cost, this.selectedService.marketCost) + '%'}]}>*/}
                        {/*            <View style={styles.blueValue}>*/}
                        {/*                <Text style={styles.blueValueText}>${this.selectedService.cost}</Text>*/}
                        {/*                <Image*/}
                        {/*                    style={styles.greenIndicator}*/}
                        {/*                    source={require('../../assets/images/blue-indicator.png')}/>*/}
                        {/*            </View>*/}
                        {/*        </View>*/}
                        {/*    </View>*/}
                        {/*</View>*/}
                        {/*{!isInvalidCost && this.state.cost>0 && (*/}
                        {/*    <SavingsContent*/}
                        {/*        userCost={this.state.cost}*/}
                        {/*        selectedServiceCost={this.selectedService.cost}*/}
                        {/*        recommendedCost={this.selectedService.recommendedCost}*/}
                        {/*        marketCost={this.selectedService.marketCost}*/}
                        {/*    />*/}
                        {/*)}*/}
                        <View>
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                contentContainerStyle={{
                                    justifyContent: 'center',
                                }}
                                style={styles.fundTypeList}>
                                {
                                    this.props.payment.wallet.balance > 0 && (
                                        <Button
                                            onPress={this.selectWallet}
                                            style={this.state.walletSelected ? styles.myWalletBtnSelected : styles.myWalletBtn}
                                            transparent>
                                            <Text uppercase={false} style={styles.myWalletText}>My wallet</Text>
                                            <Text uppercase={false}
                                                  style={styles.myWalletValue}>${this.props.payment.wallet.balance}</Text>
                                        </Button>
                                    )
                                }
                                {
                                    this.props.payment.cardsList.map(card =>

                                        <Button
                                            onPress={() => {
                                                this.setState({
                                                    selectedCardId: card.cardId,
                                                    walletSelected: false
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
                                            selectedCardId: 'new_card',
                                            walletSelected : false
                                        })
                                    }}
                                    style={this.state.selectedCardId ==='new_card'? {...styles.newCardBtn,borderWidth:1,borderColor: Colors.colors.secondaryText} : styles.newCardBtn} transparent>

                                    <Text uppercase={false} style={styles.newCardText}>New card</Text>
                                </Button>
                            </ScrollView>
                        </View>
                        <View style={styles.greBox}>
                            <PrimaryButton
                                text={this.state.selectedCardId ==='new_card'?'Add new card':'Pay $' + this.state.cost}
                                onPress={()=>{
                                    if(this.state.selectedCardId ==='new_card'){
                                        this.setState({
                                            cardModalOpen: true,
                                        });
                                    }else{
                                        this.bookOrConfirmAppointment()
                                    }
                                }}
                                disabled={!this.canPay()}
                            />
                        </View>
                    </Content>
                    <AddPaymentCardModal
                        isOpen={this.state.cardModalOpen}
                        onClose={() => {
                            this.setState({
                                cardModalOpen: false,
                            });
                        }}
                        onSubmit={this.addCard}
                    />
                    <Modal
                        backdropPressToClose={true}
                        backdropColor={ Colors.colors.overlayBg}
                        backdropOpacity={1}
                        // onClosed={true}
                        style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 200 }}
                        entry={"bottom"}
                        position={"bottom"} ref={"marketRateDrawer"} swipeArea={100}>
                        <View style={{...CommonStyles.styles.commonSwipeBar}}
                              {...addTestID('swipeBar')}
                        />
                        <View style={styles.infoDetails}>
                            <View style={styles.infoTopWrapper}>
                                <Text style={styles.infoMainText}>Market rate</Text>
                                <Text style={[styles.infoMainValue, {color: Colors.colors.secondaryText}]}>
                                    {this.selectedService.marketCost
                                    ? '$' + this.selectedService.marketCost
                                    : 'N/A'}
                                </Text>
                            </View>
                            <Text style={styles.infoSubText}>
                                This is the average cost for
                                this service in your area
                            </Text>
                        </View>
                    </Modal>
                    <Modal
                        backdropPressToClose={true}
                        backdropColor={ Colors.colors.overlayBg}
                        backdropOpacity={1}
                        // onClosed={true}
                        style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 200 }}
                        entry={"bottom"}
                        position={"bottom"} ref={"ourCostDrawer"} swipeArea={100}>
                        <View style={{...CommonStyles.styles.commonSwipeBar}}
                              {...addTestID('swipeBar')}
                        />
                        <View style={styles.infoDetails}>
                            <View style={styles.infoTopWrapper}>
                                <Text style={styles.infoMainText}>Our cost</Text>
                                <Text style={[styles.infoMainValue, {color: Colors.colors.primaryText}]}>
                                    {this.selectedService.cost
                                        ? '$' + this.selectedService.cost
                                        : 'N/A'}
                                </Text>
                            </View>
                            <Text style={styles.infoSubText}>
                                This is our cost to deliver
                                these services to you
                            </Text>
                        </View>
                    </Modal>
                    <Modal
                        backdropPressToClose={true}
                        backdropColor={ Colors.colors.overlayBg}
                        backdropOpacity={1}
                        // onClosed={true}
                        style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 200 }}
                        entry={"bottom"}
                        position={"bottom"} ref={"recommendedAmountDrawer"} swipeArea={100}>
                        <View style={{...CommonStyles.styles.commonSwipeBar}}
                              {...addTestID('swipeBar')}
                        />
                        <View style={styles.infoDetails}>
                            <View style={styles.infoTopWrapper}>
                                <Text style={styles.infoMainText}>Recommended amount</Text>
                                <Text style={[styles.infoMainValue, {color: Colors.colors.successText}]}>
                                    {this.selectedService.recommendedCost
                                        ? '$' + this.selectedService.recommendedCost
                                        : 'N/A'}
                                </Text>
                            </View>
                            <Text style={styles.infoSubText}>
                                Includes a contribution to
                                the Confidant Community
                            </Text>
                        </View>
                    </Modal>
                </Container>
            </KeyboardAvoidingView>
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
    infoBtn: {
        height: 24,
        marginRight: 8,
    },
    infoIcon: {
        fontSize: 24,
        color: Colors.colors.primaryIcon,
    },
    infoTopWrapper:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    infoMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    infoMainValue: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
    },
    infoSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.highContrast
    },
    titleWrap: {
        marginBottom: 0,
    },
    subTitleWrap: {
        marginBottom: 24,
    },
    subDesTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8,
    },
    subDesText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeRegular,
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
    },
    progressBarr: {
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 8,
        height: 8,
        marginTop: 12,
    },
    rateList: {
        marginBottom: 24,
    },
    singleRate: {
        marginBottom: 24,
    },
    rateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    rateHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    rateDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.colors.secondaryColor,
        marginRight: 8,
        borderWidth: 0,
    },
    rateTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
    },
    rateDes: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular,
    },
    rateValue: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeMedium,
        textAlign: 'right',
    },
    rangeWrapper: {
        marginBottom: 4,
    },
    valueBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    minValue: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,


    },
    maxValue: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    rangeInner: {
        borderRadius: 12,
        padding: 6,
        position: 'relative',
        ...CommonStyles.styles.shadowBox,
        borderWidth: 1,
    },
    pinkBar: {
        height: 12,
        borderRadius: 8,
        backgroundColor: Colors.colors.secondaryIcon,
        flex: 1,
    },
    greenBar: {
        height: 12,
        borderRadius: 8,
        backgroundColor: Colors.colors.successIcon,
        position: 'absolute',
        width: '50%',
        top: 6,
        left: 6,
    },
    greenValue: {
        position: 'absolute',
        right: 0,
    },
    greenValueText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        top: -37,
        right: -5,
    },
    greenIndicator: {
        position: 'absolute',
        right: 0,
        top: -11,
    },
    blueBar: {
        height: 12,
        borderRadius: 8,
        backgroundColor: Colors.colors.primaryIcon,
        position: 'absolute',
        width: '25%',
        top: 6,
        left: 6,
    },
    blueValue: {
        position: 'absolute',
        right: 0,
    },
    blueValueText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        top: -37,
        right: -25,
        width:30
    },
    blueIndicator: {
        position: 'absolute',
        right: 0,
        top: -11,
    },
    contributionBox: {
        paddingVertical: 32,
    },
    conSubText: {
        color: Colors.colors.mediumContrast,
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

    greBox: {
        paddingBottom: isIphoneX() ? 10 : 0,
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
    blueText: {
        color: '#318AC4',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 26,
        letterSpacing: 0.8,
    },
    redText: {
        color: '#D0021B',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 26,
        letterSpacing: 0.8,
    },
});
export default connectPayment()(NewPaymentDetailsScreen);
