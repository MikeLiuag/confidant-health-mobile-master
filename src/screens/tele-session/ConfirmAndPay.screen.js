import React, {Component} from 'react';
import {Image, Platform, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Input, Left, Right, Text, Title, View,} from 'native-base';
import {addTestID, AlertUtil, AlfieLoader, getAvatar, getHeaderHeight,} from 'ch-mobile-shared';
import LinearGradient from 'react-native-linear-gradient';
import {DEFAULT_AVATAR_COLOR, APPOINTMENT_STATUS, SEGMENT_EVENT} from '../../constants/CommonConstants';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Rating} from 'react-native-elements';
import {connectPayment} from '../../redux';
import {SavingsContent} from '../../components/SavingsContent';
import Analytics from '@segment/analytics-react-native';
import GradientButton from '../../components/GradientButton';
import {Screens} from '../../constants/Screens';
import momentTimeZone from 'moment-timezone';
import AppointmentService from '../../services/Appointment.service';
import {NavigationActions, StackActions} from 'react-navigation';
import moment from "moment";

const HEADER_SIZE = getHeaderHeight();

class ConfirmAndPayScreen extends Component<Props> {
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
    const appointment = navigation.getParam('appointment', null);
    this.primaryConcern = navigation.getParam('primaryConcern', null);
    this.state = {
      isLoading: false,
      cost:
          this.selectedService && this.selectedService.recommendedCost
              ? this.selectedService.recommendedCost.toString()
              : '1',
      selectedPaymentType: '',
      selectedPaymentMeta: '',
      costFocus: false,
      hasCostError: false,
      paymentDone: false,
      appointment: appointment,
    };
  }

  async componentDidMount(): void {
    await Analytics.screen(
        'Confirm and Pay Screen'
    );
    this.props.fetchWallet();
    this.props.fetchCardsList();
  }

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

  onChangedCost = serviceCost => {
    return serviceCost.replace(/^0+/, '');
  };

  getPaidText = (value)=>{
    if(value === this.selectedService?.recommendedCost){
      return {hasPaidRecommendedAmount: true};
    }else if(value < this.selectedService?.cost){
      return {hasPaidLessThanOurCost: true};
    }else if(value > this.selectedService?.cost){
      return {hasPaidMoreThanOurCost: true};
    }else{
      return {hasPaidDollarOne: true};
    }
  }

  bookAppointment = async (prePaymentDetails) => {
    await Analytics.identify(this.props.auth?.meta?.userId, this.getPaidText(this.state.cost));
    this.setState({
      isLoading: true
    });
    try {
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
        paymentMethod: prePaymentDetails?.paymentMethod,
        amountInWallet: this.props.payment.wallet.balance,
        confidantFundsInWallet: this.props.payment.wallet.balance,
        category: 'Goal Completion',
        label: 'Appointment Requested',
      };

      const payloadForApi = {
        participantId: this.selectedProvider.userId,
        providerName: this.selectedProvider.name,
        serviceId: this.selectedService.id,
        slot: this.selectedSchedule.slot,
        day: this.selectedSchedule.day,
        month: parseInt(this.selectedSchedule.month),
        year: this.selectedSchedule.year,
        paymentDetails: {
          amountPaid: this.state.cost,
          chargeId: prePaymentDetails.chargeId,
          paymentMethod: prePaymentDetails.paymentMethod,
        },
        primaryConcern: this.primaryConcern,
        timeZone: momentTimeZone.tz.guess(true),
      };

      const response = await AppointmentService.requestAppointment(payloadForApi);
      if (response.errors) {
        AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        this.setState({isLoading: false});
      } else {
        // this.setState({isLoading: false, paymentDone: true});
        await Analytics.identify(this.props.auth?.meta?.userId, {
          hasScheduledAnAppointment : true
        });
        await Analytics.track(SEGMENT_EVENT.APPOINTMENT_REQUESTED, segmentPayload);
        this.performDangerousNavigation();
      }
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
      });
    }
  };


  //TODO: Replace this with proper implementation
  performDangerousNavigation = () => {
    const {appointment} = this.state;
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
            isRequest: true,
          },
        }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  };

  startChat = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: Screens.TAB_VIEW})],
    });

    this.props.navigation.dispatch(resetAction);
  };

  getSlotDesc = () => {
    return (
        this.selectedSchedule.slotStartTime.time +
        ' ' +
        this.selectedSchedule.slotStartTime.amPm
    );
  };

  navigateToNextScreen = () => {
    this.props.navigation.navigate(Screens.ADD_PAYMENT_METHOD_AND_PAY_SCREEN, {
      ...this.props.navigation.state.params,
      amount: this.state.cost,
      type: "APPOINTMENT_CHARGES",
      onSuccess: this.onConfirmOrRequestAppointmentByMember ? this.confirmOrRequestAppointmentByMember : this.bookAppointment,
      reference: this.selectedService.id,

    });
  };

  confirmOrRequestAppointmentByMember = (prePaymentDetails) => {
    Analytics.identify(this.props.auth?.meta?.userId, this.getPaidText(prePaymentDetails?.amountPaid));
    this.navigateBack();
    this.onConfirmOrRequestAppointmentByMember(prePaymentDetails);
  }

  navigateBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    StatusBar.setBarStyle('dark-content', true);
    if (this.state.isLoading) {
      return <AlfieLoader/>;
    }
    const isInvalidCost = this.state.cost === '' || isNaN(Number(this.state.cost)) || Number(this.state.cost) > 100000;
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
                    onPress={this.navigateBack}
                    transparent
                    style={styles.backButton}>
                  <Icon name="angle-left" size={32} color="#3fb2fe"/>
                </Button>
              </Left>
              <Body style={{flex: 2}}>
                <Title style={styles.groupTitle}>
                  {this.state.paymentDone ? 'You are booked!' : 'Confirm & Pay'}
                </Title>
              </Body>
              <Right/>
            </Header>
            <Content>
              <View style={styles.providerReviewSection}>
                <View style={styles.providerSide}>
                  <View>
                    {this.selectedProvider.profilePicture ? (
                        <Image
                            {...addTestID('Pro-Image')}
                            style={styles.proImage}
                            resizeMode="cover"
                            source={{uri: getAvatar(this.selectedProvider)}}
                        />
                    ) : (
                        <View
                            style={{
                              ...styles.proBgMain,
                              backgroundColor: this.selectedProvider.colorCode
                                  ? this.selectedProvider.colorCode
                                  : DEFAULT_AVATAR_COLOR,
                            }}>
                          <Text style={styles.proLetterMain}>
                            {this.selectedProvider.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.providerName}>
                      {this.selectedProvider.name}
                    </Text>
                    {this.selectedProvider.designation && (
                        <Text style={styles.providerRole}>
                          {this.selectedProvider.designation}
                        </Text>
                    )}
                  </View>
                </View>
                <View style={styles.ratingSection}>
                  <Rating
                      readonly
                      type="star"
                      showRating={false}
                      ratingCount={5}
                      imageSize={25}
                      selectedColor="#ffca00"
                      startingValue={
                        this.selectedProvider.combinedRating
                            ? this.selectedProvider.combinedRating
                            : '0'
                      }
                      fractions={2}
                  />
                  <Text style={styles.reviewText}>
                    {this.selectedProvider.totalReviews
                        ? this.selectedProvider.totalReviews
                        : '0'}{' '}
                    reviews
                  </Text>
                </View>
              </View>
              <View style={styles.serviceSection}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {this.selectedService.name}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {this.selectedService.durationText} session
                  </Text>
                </View>
                <View style={styles.timeDate}>
                  <Text style={styles.dateText}>
                    {moment(this.selectedSchedule.dateDesc).format('dddd MMMM Do')}
                  </Text>
                  <Text style={styles.timeText}>{this.getSlotDesc()}</Text>
                </View>
              </View>
              {(() => {
                if (this.state.paymentDone) {
                  return (
                      <View style={styles.paymentDoneBox}>
                        <Image
                            style={styles.niceArt}
                            resizeMode="cover"
                            source={require('../../assets/images/nice-work.png')}
                        />
                        <Text style={styles.doneText}>
                        Appointment Request Sent and We’ve notified your provider of you appointment request. They’ll get back to you with a response within 24hrs.
                        </Text>
                        <GradientButton
                            onPress={() => {
                              this.startChat();
                            }}
                            text="Go to chat"
                        />
                      </View>
                  );
                } else {
                  return (
                      <View>
                        <View style={styles.paymentBlock}>
                          <View style={styles.costList}>
                            <View style={styles.singleCost}>
                              <Text style={styles.costText}>Market Rate</Text>
                              <Text style={styles.costValue}>
                                {this.selectedService.marketCost
                                    ? '$' + this.selectedService.marketCost
                                    : 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.singleCost}>
                              <Text style={styles.costText}>Our Cost</Text>
                              <Text style={styles.costValue}>
                                {this.selectedService.cost
                                    ? '$' + this.selectedService.cost
                                    : 'N/A'}
                              </Text>
                            </View>
                            <View
                                style={{...styles.singleCost, borderBottomWidth: 0}}>
                              <Text style={styles.costText}>
                                Recommended Payment
                              </Text>
                              <Text style={styles.costValue}>
                                {this.selectedService.recommendedCost
                                    ? '$' + this.selectedService.recommendedCost
                                    : 'N/A'}
                              </Text>
                            </View>
                          </View>
                          <View
                              style={
                                this.state.cost >= this.selectedService.cost
                                    ? styles.yourPayment
                                    : styles.yourPaymentLow
                              }>
                            <Text style={styles.payingText}>You are paying</Text>
                            <Input
                                {...addTestID('cost-input')}
                                style={styles.paymentInput}
                                value={this.state.cost}
                                keyboardType="decimal-pad"
                                onBlur={() => {
                                  this.validateCost();
                                }}
                                onChangeText={cost => {
                                  if (!isNaN(Number(cost))) {
                                    this.setState({
                                      cost: this.onChangedCost(cost),
                                    });
                                  }
                                }}
                            />
                          </View>

                          {!isInvalidCost && (
                              <SavingsContent
                                  userCost={this.state.cost}
                                  selectedServiceCost={this.selectedService.cost}
                                  recommendedCost={this.selectedService.recommendedCost}
                                  marketCost={this.selectedService.marketCost}
                              />
                          )}

                          <GradientButton
                              testId="Continue"
                              disabled={isInvalidCost}
                              onPress={() => this.navigateToNextScreen()}
                              text="Continue"
                          />
                        </View>
                      </View>
                  );
                }
              })()}
            </Content>
          </LinearGradient>
        </Container>
    );
  }
}

const styles = StyleSheet.create({
  paymentDoneBox: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 34,
    //shadowColor: '#000',
    shadowColor: 'rgba(37, 52, 92, 0.09)',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 8,
    shadowOpacity: 1.0,
    backgroundColor: 'red',
  },niceArt: {
        marginBottom: 40,
        marginTop: 40,
    },
    doneText: {
        color: '#25345C',
        textAlign: 'center',
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        lineHeight: 26,
        letterSpacing: 0.8,
        paddingLeft: 25,
        paddingRight: 25,
        marginBottom: 40,
    },
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
    serviceSection: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.03)',
        shadowOffset: {
            width: 0,
            height: 7
        },
        shadowOpacity: 1.0,
        shadowRadius: 6
    },
    serviceInfo: {
        width: '55%',
    },
    serviceName: {
        color: '#22242A',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    sessionTime: {
        color: '#515D7D',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
    },
    timeDate: {
        width: '40%',
    },
    dateText: {
        color: '#22242A',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.28,
        marginBottom: 8,
        textAlign: 'right',
    },
    timeText: {
        color: '#22242A',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.28,
        textAlign: 'right',

  },
  providerReviewSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#F5F5F5',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowRadius: 8,
    shadowOpacity: 0.9,
    elevation: 0,
  },
  providerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  proImage: {
    width: 55,
    height: 55,
    borderRadius: 27,
    marginRight: 16,
  },
  proBgMain:{
    width: 65,
    height: 65,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  proLetterMain: {
    fontFamily: 'Roboto-Bold',
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  providerName: {
    color: '#25345C',
    fontFamily: 'Roboto-Bold',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 16,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  providerRole: {
    color: '#515D7D',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  ratingSection: {},
  reviewText: {
    color: '#515D7D',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.7,
    textAlign: 'right',
    marginTop: 8,
  },
  paymentBlock: {
    padding: 24,
  },
  costList: {
    marginBottom: 16,
  },
  singleCost: {
    flexDirection: 'row',

    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  costText: {
    color: '#22242A',
    fontFamily: 'Roboto-Bold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  costValue: {
    color: '#25345C',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    lineHeight: 16,
    letterSpacing: 0.47,
    textAlign: 'right',
  },
  yourPayment: {
    backgroundColor: 'rgba(119, 199, 11, 0.1)',
    // backgroundColor: 'rgba(63, 178, 254, 0.07)',
    // backgroundColor: 'rgba(255, 179, 3, 0.07)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourPaymentLow: {
    // backgroundColor: 'rgba(255, 0, 0, 0.1)',
    backgroundColor: 'rgba(63, 178, 254, 0.07)',
    // backgroundColor: 'rgba(255, 179, 3, 0.07)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payingText: {
    color: '#22242A',
    fontFamily: 'Roboto-Bold',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  paymentInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    maxWidth: 100,
    height: 48,
    color: '#25345C',
    fontFamily: 'Roboto-Regular',
    fontSize: 20,
    letterSpacing: 0.63,
    textAlign: 'center',
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

export default connectPayment()(ConfirmAndPayScreen);
