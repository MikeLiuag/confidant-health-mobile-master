import React, {Component} from 'react';
import {Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Container, Content} from 'native-base';
import GradientButton from '../../components/GradientButton';
import SlotMachine from 'react-native-slot-machine';
import LinearGradient from "react-native-linear-gradient";
import {Screens} from "../../constants/Screens";
import ProfileService from '../../services/Profile.service';
import {AlertUtil, Colors, isIphoneX, TextStyles} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import Analytics from "@segment/analytics-react-native";

export default class RewardPointsScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.appointment = navigation.getParam("appointment", null);
        this.rewardType = navigation.getParam('rewardType', null);
        this.reference = navigation.getParam('reference', null);
        this.feedbackSkipped = navigation.getParam("feedbackSkipped", false);
        this.state = {
            isLoading: false,
            luckyNumber: null,
            unit: null
        };
    }


    async componentDidMount(): void {
        await Analytics.screen(
            'Review Points Screen'
        );
        await this.generateReward(0,99);
    }


    saveRewards = async () => {
        this.setState({isLoading: true});
        const payload = {
            rewardAmount: this.state.luckyNumber ? this.state.luckyNumber : null,
            rewardUnit: this.state.unit === 'pts' ? "POINTS" : "DOLLARS",
            type: this.rewardType,
            reference: this.reference

        };
        const rewardsResponse = await ProfileService.saveRewards(payload);
        if (rewardsResponse.errors) {
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage(rewardsResponse.errors[0].endUserMessage);

        } else {
            this.setState({isLoading: false});
            AlertUtil.showSuccessMessage('Rewards added in profile successfully !');
        }
    };

    generateReward = async (min, max) => {
        let luckyNumber = Math.ceil((Math.random() * (max - min) + min).toFixed(2));
        let unit;
        if (luckyNumber > 2) {
            unit = 'pts';
        } else {
            //probability 0.1
            unit = '$';
        }
        this.setState({luckyNumber, unit}, ()=>{
            setTimeout(()=>{
                this.setState({rewardGenerated: true});
                if(this.state.unit==='pts') {
                    this.saveRewardToProfile();
                }
            },4100);
        });
    };


    navigateToNextScreen = () => {

        if (this.feedbackSkipped || this.appointment.feedback) {
            this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
        } else {
            this.props.navigation.replace(Screens.PRIVATE_FEEDBACK_SCREEN, {
                ...this.props.navigation.state.params,
                rewardAmount: this.state.luckyNumber,
                rewardUnit:this.state.unit
            });
        }
    };


    render() {

        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const {rewardGenerated}= this.state;
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <Content style={styles.mainWrapper}>
                        <Image
                            resizeMode={'contain'}
                            style={styles.starImage}
                            source={require('../../assets/images/stars.png')}/>
                        <Image
                            resizeMode={'contain'}
                            style={{...styles.starImage, top: 300}}
                            source={require('../../assets/images/stars2.png')}/>


                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleProgress}/>
                            <View style={styles.singleProgress}/>
                        </View>


                        <Text style={styles.rewardsTitle}>You’re doing great! {'\n'}
                            Let’s see your prize.</Text>

                        <Text style={styles.rewardsDes}>
                            Taking these steps to a better yourself isn’t easy but it isn’t going unnoticed! Spin the
                            wheel to see if you’ve earned dollars that
                            can be used toward your next appointment, or points to showcase your progress
                        </Text>
                        <View style={styles.slotWrapper}>
                            <View style={styles.singleSlot}>
                                <SlotMachine
                                    // text={this.state.luckyNumber}
                                    padding={0}
                                    width={100}
                                    height={158}
                                    duration={4000}
                                    styles={dynamicSlot}
                                    renderContent={c =>
                                        <View style={styles.dollarFrame}>
                                            <View style={[styles.topWrapper]}>
                                                <Text style={styles.slotText}>{this.state.luckyNumber - 1}</Text>
                                            </View>
                                            <View style={[styles.midWrapper]}>
                                                <Text style={[styles.slotText, rewardGenerated ? styles.slotTextSelected : null]}>{this.state.luckyNumber}</Text>
                                            </View>
                                            <View style={[styles.bottomWrapper]}>
                                                <Text style={styles.slotText}>{this.state.luckyNumber + 1}</Text>
                                            </View>
                                        </View>
                                    }
                                    range="0123456789"/>
                            </View>
                            <View style={styles.singleSlot}>
                                <SlotMachine
                                    // text={this.state.luckyNumber}
                                    padding={0}
                                    width={100}
                                    height={158}
                                    renderContent={c =>
                                        <View style={styles.dollarFrame}>
                                            <View style={[styles.topWrapper]}>
                                                <Text style={styles.prizeText}>{this.state.unit==='$'?'pts':'$'}</Text>
                                            </View>
                                            <View style={[styles.midWrapper]}>
                                                <Text style={[styles.prizeText, rewardGenerated ? styles.prizeTextSelected : null]}>{this.state.unit}</Text>
                                            </View>
                                            <View style={[styles.bottomWrapper]}>
                                                <Text style={styles.prizeText}>{this.state.unit==='$'?'pts':'$'}</Text>
                                            </View>
                                        </View>
                                    }
                                    styles={dynamicSlot}
                                    range="0123456789"/>
                            </View>
                        </View>


                    </Content>
                    <View style={styles.btnStyle}>
                        <GradientButton
                            // testId = "thanks-btn"
                            text="Thanks Alfie!"
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}


const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent',
    color: '#b3bec9',
    fontFamily: 'Roboto-Regular',
    fontSize: 36
};

const styles = StyleSheet.create({
    mainWrapper: {
        paddingTop: isIphoneX() ? 0 : 24,
    },
    starImage: {
        width: '100%',
        height: 300,
        position: 'absolute',
        alignSelf: 'center'
        // top: 0
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 56,
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
    dollarText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 40,
        color: 'rgba(81, 93, 125, 0.15)',
        fontWeight: '300',
        letterSpacing: 1,
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: '#fff',
        top: -20,
        width: 81,
        zIndex: 0,
        overflow: 'hidden'
    },
    afterDigit: {
        fontFamily: 'Roboto-Regular',
        fontSize: 40,
        color: 'rgba(81, 93, 125, 0.15)',
        fontWeight: '300',
        letterSpacing: 1,
        textAlign: 'center',
        width: 81,
        backgroundColor: '#fff',
        zIndex: 2,
        overflow: 'hidden'
    },
    alfieWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgba(0,0,0, 0.15)',
        borderRadius: 80,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 25,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.09)',
        marginBottom: 40,
        marginTop: 60,
        backgroundColor: '#fff',
    },
    alfie: {
        width: 110,
        height: 110,
    },
    rewardsTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        letterSpacing: 1,
        lineHeight: 36,
        marginBottom: 40,
        textAlign: 'center',
        alignSelf: 'center'
    },
    slotWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        marginBottom: 40,
        width: 230,
    },

    singleSlot: {
        width: 110,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 25,
        shadowOpacity: 0.5,
        shadowColor: 'rgba(0,0,0, 0.29)',
        backgroundColor: '#fff',
    },

    dollarFrame: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'space-evenly',
    },

    topWrapper: {
        height: 46,
    },

    midWrapper:{
        height: 46,
        marginTop: 15,
        marginBottom: 15,
        zIndex: 999,
    },

    bottomWrapper:{
        height: 46,
    },

    slotText: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.mainPink40,
    },

    slotTextSelected: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.secondaryText,
    },

    prizeText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.mainPink40,
    },

    prizeTextSelected: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.secondaryText,
    },

    customWheeliOS: {
        width: 145,
        height: 125,
        zIndex: 10,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
        borderTopWidth: 0,
    },
    rewardsDes: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        letterSpacing: 0.5,
        lineHeight: 21,
        marginBottom: 40,
        textAlign: 'center',
        alignSelf: 'center',
        paddingRight: 15,
        paddingLeft: 15
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
});

const dynamicSlot = {
    slotWrapper: {
        backgroundColor: '#fff',
        marginLeft: 0,
        borderRadius: 16,
        overflow: "hidden",

    },

    slotInner: {
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },

    text: {
        top: -2,
        fontFamily: 'Roboto-Regular',
        fontSize: 40,
        color: '#3fb2fe',
        fontWeight: '300'
    },

    innerBorder: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        borderColor: 'black',
        borderWidth: 0,
        zIndex: 1,
        borderRadius: 16,
    },

    outerBorder: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 16,
        zIndex: 1,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        // top: 46,
        // height: 70,
        // backgroundColor: '#D3006A',
    },
}
