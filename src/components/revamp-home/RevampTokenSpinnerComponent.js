import React, {Component} from 'react';
import {Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Container, Content} from 'native-base';
import SlotMachine from 'react-native-slot-machine';
import ProfileService from '../../services/Profile.service';
import {addTestID, AlertUtil, Colors, PrimaryButton, TextStyles} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import {connectConnections} from "../../redux";


class RevampTokenSpinnerComponent extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            rewardSaved: false,
            luckyNumber: null,
            unit: null
        };
    }

    async componentDidMount(): void {
        await this.generateReward(0,99);
    }

    saveRewards = async () => {
        const payload = {
            reference: 'REVAMP',
            rewardAmount: this.state.luckyNumber ? this.state.luckyNumber : null,
            rewardUnit: this.state.unit === 'pts' ? "POINTS" : "DOLLARS",
            type: 'REVAMP'
        };
        const rewardsResponse = await ProfileService.saveRewards(payload);
        if (rewardsResponse.errors) {
            this.setState({rewardSaved: false});
            AlertUtil.showErrorMessage(rewardsResponse.errors[0].endUserMessage);
        } else {
            this.props.fetchRevampContext();
            this.setState({rewardSaved: true});
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
                    this.saveRewards();
                }
            },4100);
        });
    };


    navigateToPayItForwardScreen = () => {
        this.props.navigation.replace(Screens.GROUP_PAY_IT_FORWARD_SCREEN, {
            customAmount: this.state.luckyNumber
        })
    };


    render() {

        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const {rewardGenerated}= this.state;
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40}}
                    style={styles.mainWrapper}>
                    <View style={styles.receivingMoney}>
                        <Image
                            {...addTestID('Rewards-points-png1')}
                            style={styles.openGiftImg}
                            source={require('../../assets/images/open-gift-icon.png')}/>

                    </View>

                    <Image
                        resizeMode={'contain'}
                        style={styles.starImage}
                        source={require('../../assets/images/stars.png')}/>

                    <Text style={styles.rewardsTitle}>Let’s see your prize</Text>
                    <Text style={styles.rewardsSubTitle}>You’re doing great! {'\n'}
                        Here is your prize.</Text>

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

                    {this.state.rewardSaved && this.state.luckyNumber && this.state.unit === '$' && (
                        <View>
                            <Text style={styles.rewardsDes}>
                                We'll add this reward to your account! Would you like to spread the love by making a
                                contribution to the Confidant community?
                            </Text>
                            <Text onPress={() => this.navigateToPayItForwardScreen()} style={styles.linkText}>Pay it
                                forward</Text>
                        </View>
                    )}
                </Content>
                <View style={styles.btnStyle}>
                    <PrimaryButton
                        // testId={this.state.rewardSaved && this.state.luckyNumber ? "I Feel Lucky" : "I Feel Lucky"}
                        testId={"Continue"}
                        // text={this.state.rewardSaved && this.state.luckyNumber ? "Continue" : "I Feel Lucky"}
                        text={ "Continue"}
                        onPress={() => {
                            this.props.navigateToNextScreen();
                        }}
                    />
                </View>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    mainWrapper: {},
    starImage: {
        width: '100%',
        height: 260,
        position: 'absolute',
        alignSelf: 'center',
        top: 40
    },
    dollarText: {
        ...TextStyles.mediaTexts.manropeRegular,
        fontSize: 40,
        color: Colors.colors.mainPink40,
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: '#fff',
        top: -22,
        width: 81,
        zIndex: 0,
        overflow: 'hidden'
    },
    afterDigit: {
        ...TextStyles.mediaTexts.manropeRegular,
        fontSize: 40,
        color: Colors.colors.mainPink40,
        textAlign: 'center',
        width: 81,
        backgroundColor: '#fff',
        zIndex: 2,
        overflow: 'hidden'
    },
    rewardsTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        textAlign: 'center'
    },
    rewardsSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
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
        backgroundColor: '#F8FAFC',
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
        fontStyle: 'normal',
        fontWeight: '300',
        fontSize: 20,
        letterSpacing: 0.714286,
        lineHeight: 30,
        marginBottom: 28,
        textAlign: 'center',
        paddingRight: 15,
        paddingLeft: 15,
    },
    linkText: {
        color: '#3FB2FE',
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 20,
        textAlign: 'center',
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        marginBottom: 30,
    },
    receivingMoney: {
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    openGiftImg: {
        marginBottom: 30,
        marginTop: 100,
    }
});

const dynamicSlot = {
    slotWrapper: {
        backgroundColor: '#F8FAFC',
        marginLeft: 0,
        borderRadius: 16,
        overflow: "hidden",

    },

    slotInner: {
        backgroundColor: '#F8FAFC',
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
        borderColor: '#fafafa',
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
export default connectConnections()(RevampTokenSpinnerComponent);
