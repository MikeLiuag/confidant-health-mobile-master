import React, {Component} from 'react';
import { StatusBar, StyleSheet, Text, View,} from 'react-native';
import {Button, Container, Content, Form,} from 'native-base';
import {AlertUtil, isIphoneX, PrimaryButton, ProgressBars, Colors, TextStyles, CommonStyles, BackButton} from 'ch-mobile-shared';
import ProfileService from '../../services/Profile.service';
import {Screens} from '../../constants/Screens';
import Loader from "../../components/Loader";
import Analytics from '@segment/analytics-react-native';
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import { connectAppointments } from "../../redux";

class SendFeedbackScreen extends Component {
    static navigationOptions = {
        header: null,
    };


    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.providerId = navigation.getParam("providerId", null);
        this.appointment = navigation.getParam("appointment", null);
        this.appointmentId = this.appointment.appointmentId;
        this.encounterId = navigation.getParam("encounterId", null);
        this.sessionId = navigation.getParam("sessionId", null);
        this.ratingScore = navigation.getParam('ratingScore', null);
        this.privateFeedback = navigation.getParam("privateFeedback", null);
        this.publicFeedback = navigation.getParam("publicFeedback", null);
        this.rewardAmount = navigation.getParam("rewardAmount", null);
        this.sessionConnected = navigation.getParam("sessionConnected", false);
        this.sessionWorks = navigation.getParam("sessionWorks", false);
        this.rewardUnit = navigation.getParam("rewardUnit", null);
        this.additionalContribution = navigation.getParam('amount', null);
        this.startedAt = navigation.getParam('startedAt', null);
        this.completedAt = navigation.getParam('completedAt', null);
        this.delayedFeedback = navigation.getParam("delayedFeedback", false);
        this.state = {
            isLoading: false
        };
    }

    navigateToNextScreen = () => {
        if(this.delayedFeedback) {
            this.props.navigation.pop(2);
        } else {
            this.props.navigation.replace(Screens.SESSION_REWARD_SCREEN, {
                appointment: this.appointment
            });
        }

    };

    shareFeedback = async () => {
        this.setState({isLoading: true});
        const requestBody: any = {
            privateFeedback: this.privateFeedback,
            providerId: this.providerId,
            publicComment: this.publicFeedback,
            rating: this.ratingScore,
            sessionId: this.sessionId,
            appointmentId: this.appointmentId,
            encounterId: this.encounterId,
            sessionConnected: this.sessionConnected,
            sessionWorks: this.sessionWorks
        };
        const feedbackResponse = await ProfileService.shareFeedback(requestBody);
        if (feedbackResponse.message) {
            AlertUtil.showSuccessMessage(feedbackResponse.message);
            const segmentFeedbackCompletedPayload = {
                telesessionId: this.sessionId,
                encounterId: this.encounterId,
                userId: this.props.auth.meta?.userId,
                providerId: this.providerId,
                startedAt: this.startedAt,
                startTime: this.appointment?.startTime,
                endTime: this.appointment?.endTime,
                appointmentName: this.appointment?.serviceName,
                appointmentDuration: this.appointment?.serviceDuration,
                appointmentCost: this.appointment?.serviceCost,
                paymentAmount: this.appointment?.prePayment?.amountPaid,
                completedAt: this.completedAt,
                starRating: this.ratingScore,
                additionalContribution: this.additionalContribution,
                pointsEarned: this.rewardUnit === 'pts' ? this.rewardAmount : null,
                dollarsEarned: this.rewardUnit !== 'pts' ? this.rewardAmount : null,
                leftPublicFeedback: this.publicFeedback,
                leftPrivateFeedback: this.privateFeedback,
                sessionConnected: this.sessionConnected,
                sessionWorks: this.sessionWorks
            }
            await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_FEEDBACK_COMPLETED, segmentFeedbackCompletedPayload);
            this.setState({isLoading: false});
            this.navigateToNextScreen();
        } else {
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage(feedbackResponse.errors[0].endUserMessage);
        }
    };

    editFeedback = () => {
        this.props.navigation.replace(Screens.PRIVATE_FEEDBACK_SCREEN, this.props.navigation.state.params);
    };

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content
                    showsVerticalScrollIndicator={false}
                    style={styles.wrapper}>
                    <View style={styles.backBtnView}>
                        <BackButton
                            onPress={this.backClicked}
                        />
                    </View>
                    <ProgressBars
                        index={1}
                        totalBars={4}
                    />
                    <Text style={styles.title}>Check Your Feedback</Text>
                    <Form>
                        <View style={styles.textareaWrapper}>
                            <Text style={styles.textareaLabel}>Public Feedback</Text>
                            <Text style={styles.textBox}>{this.publicFeedback}</Text>
                        </View>
                    </Form>
                </Content>

                <View style={styles.btnStyle}>
                    <PrimaryButton
                        testId="share-feedback"
                        disabled={!this.publicFeedback}
                        onPress={() => {
                            this.shareFeedback();
                        }}
                        text="Send Feedback"
                        arrowIcon={true}
                    />
                    <Button
                        //{...addTestID('Skip-btn')}
                        onPress={() => {
                            this.editFeedback();
                        }}
                        transparent style={styles.skipBtn}>
                        <Text style={styles.blueLinkText}>Edit Feedback</Text>
                    </Button>
                </View>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: isIphoneX()? 24 : 0,
    },
    skipBtn: {
        alignSelf: 'center',
        marginTop: 20
    },
    backBtnView: {
        position: 'absolute',
        left: 0,
        top: 36
    },
    title: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 20
    },
    textareaWrapper: {
        marginBottom: 20,
    },
    textareaLabel: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        marginBottom: 5,
    },
    textBox: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    blueLinkText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryText,
        textAlign: 'center',
        // marginTop: 20
    },
    btnStyle: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
    }
});

export default connectAppointments()(SendFeedbackScreen);
