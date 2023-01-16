import React, {PureComponent} from 'react';
import {Image, ScrollView, StatusBar, StyleSheet,} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {Colors, PrimaryButton, SecondaryButton, TextStyles} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import {REVAMP_ON_BOARDING_CONTEXT_STATUS, REVAMP_ON_BOARDING_TYPES} from "../../constants/CommonConstants";
import {connectRevamp} from "../../redux";
import Analytics from "@segment/analytics-react-native";
import {Screens} from "../../constants/Screens";

class RevampRewardPointScreen extends PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam("revampTypeData", null);
        this.contentfulData = navigation.getParam("contentfulData", null);
        this.state = {
            isLoading: false
        }
    }

    componentDidMount() {
        Analytics.screen(
          this.revampTypeData.name + 'Section - Completed Screen'
        );
    }

    updateRevampOnBoardingContext = async (isNeedBreak) => {
        try {
            // this.setState({isLoading: true})
            let revampOnBoardingContext = this.props.revamp.revampOnBoardingContext;
            let typeInContext = revampOnBoardingContext?.revampTypesContexts?.find(typeContext => typeContext.typeId === this.revampTypeData.id)
            typeInContext.typeStatus = REVAMP_ON_BOARDING_CONTEXT_STATUS.COMPLETED.key
            this.props.updateRevampOnBoardingContext({revampOnBoardingContext,
            onSuccess:()=>{
                if (isNeedBreak) {
                this.navigateToHome();
            } else {
                    if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.PLAN.key){
                        this.props.navigation.replace(Screens.REVAMP_TOKEN_SPINNER_SCREEN);
                    } else {
                        this.navigateToRevampOnBoardingProgressScreen();
                    }
            }}});
        } catch (e) {
            console.log(e);
        }
    };

    navigateToHome = () => {
        this.props.navigation.navigate(Screens.SERVICE_LIST_SCREEN);
    };

    navigateToRevampOnBoardingProgressScreen = () => {
        this.props.navigation.navigate(Screens.REVAMP_ON_BOARDING_PROGRESS_SCREEN);
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading || this.props.revamp.isLoading) {
            return <Loader/>
        }
        const revampTypeData = this.revampTypeData;
        const contentfulData = this.contentfulData;
        return (
            <Container style={{backgroundColor: '#146C29'}}>

                <Content showsVerticalScrollIndicator={false}>
                    <Image
                        style={styles.mainBgImg}
                        source={require('../../assets/images/reward-success.png')}/>
                    <View style={styles.mainContentWrapper}>
                        <Image
                            style={styles.reward}
                            source={revampTypeData.name === "Plan" || revampTypeData.name === "sundayCheckIn" ?  require('../../assets/images/success_illustration_plan.png') : require('../../assets/images/success_illustration.png') }/>
                        <Text style={styles.mainHeading}>{contentfulData.tokenText}</Text>
                        <Text style={styles.subHeading}>{contentfulData.tokenSubText}</Text>

                    </View>
                </Content>
                <View style={styles.continueButtonWrapper}>

                    {revampTypeData && revampTypeData.name && revampTypeData.name !== "Plan" && revampTypeData.name !== "sundayCheckIn" &&

                        <SecondaryButton
                            bgColor={'rgba(255, 255, 255, 0.10)'}
                            textColor={Colors.colors.white}
                            arrowIcon={false}
                            text="I need a break"
                            borderColor={'rgba(255, 255, 255, 0.10)'}
                            style={{...TextStyles.mediaTexts.manropeExtraBold}}
                            onPress={() => {
                                this.updateRevampOnBoardingContext(true)
                            }}

                        />
                    }
                    <PrimaryButton
                        bgColor={Colors.colors.white}
                        textColor={Colors.colors.successText}
                        arrowIcon={false}
                        text={revampTypeData && revampTypeData.name && revampTypeData.name === "Plan" ? "Finish & spin the wheel" : "Continue"}
                        onPress={() => {
                            if (revampTypeData && revampTypeData.name && revampTypeData.name === "sundayCheckIn") {
                                this.props.navigation.navigate(Screens.SERVICE_LIST_SCREEN);
                            } else {
                                this.updateRevampOnBoardingContext(false)
                            }

                        }}
                    />

                </View>
            </Container>
        );
    };
}


const styles = StyleSheet.create({
    reward: {
        marginBottom: 50,
        marginTop: 40,
        textAlign: 'center',
        alignSelf: 'center',
        height: 160,
        width: 170,
    },
    mainBgImg: {
        width: '100%',
        position: 'absolute'
    },
    continueButtonWrapper: {
        padding: 24,

    },
    mainContentWrapper: {
        padding: 45
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,

        color: Colors.colors.white,
        textAlign: 'center'
    },
    subHeading: {
        ...TextStyles.mediaTexts.manropeLight,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.white,
        marginTop: 16,
        textAlign: 'center'

    },
    headTextWrap: {
        display: 'flex',
        flexDirection: 'row',
    },
    headMainText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
        marginLeft: 16,
        marginTop: 15
    },
    iconBg: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        shadowColor: '#eee',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.01,
        elevation: 9,
        borderRadius: 5

    },
});

export default connectRevamp()(RevampRewardPointScreen);
