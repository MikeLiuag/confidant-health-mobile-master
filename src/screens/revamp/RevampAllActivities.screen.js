import React, {Component} from 'react';
import {Image, Platform, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title, View} from 'native-base';
import {
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
    valueExists
} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {connectRevamp} from "../../redux";
import AntDesign from "react-native-vector-icons/AntDesign";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {Screens} from "../../constants/Screens";
import Modal from "react-native-modalbox";

const HEADER_SIZE = getHeaderHeight();

class RevampAllActivitiesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            selectedActivity: null,
            showActivityModal: false
        }
    }

    navigateToAddActivitiesScreen = () => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_ADD_ACTIVITIES_SCREEN)
    };
    setSelectedActivityNull = () => {
        this.setState({selectedActivity: null, showActivityModal: false})
    }

    navigateCheckInActivityScreen = (selectedActivity) => {
        this.setState({showActivityModal: false})
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_CHECK_IN_ACTIVITY, {
            ...navigation.state.params,
            selectedActivity,
            removeActivityFromAnswers: this.setSelectedActivityNull,
            refScreen: 'UserActivities'
        })
    };

    navigateToScheduleActivityScreen = (selectedActivity) => {
        this.setState({showActivityModal: false})
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_SCHEDULE_ACTIVITY, {
            ...navigation.state.params,
            selectedActivity,
            removeActivityFromAnswers: this.setSelectedActivityNull,
            refScreen: 'UserActivities',
            revampTypeData: {
                name:"Schedule"
            }
        })
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const {isLoading} = this.state;
        if (isLoading) {
            return <Loader/>
        }
        const {selectedActivity, showActivityModal} = this.state;
        // console.log('selectedActivity state', selectedActivity)
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <View style={styles.backButton}>
                            <BackButton
                                onPress={() => {
                                    this.props.navigation.goBack();
                                }}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title style={styles.headerText}/>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.navigateToAddActivitiesScreen();
                                }}
                        >
                            <AntDesign size={30} color={Colors.colors.mainBlue} name="plus"/>
                        </Button>
                    </Right>
                </Header>
                <Content style={styles.mainContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>

                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            style={{
                                width: 120,
                                height: 120,
                            }}
                            resizeMode={'contain'}
                            source={require('../../assets/images/UserActivities.png')}/>
                        <View style={{
                            ...styles.mainContentWrapper,
                            marginBottom: 32,
                            marginTop: 24
                        }}>

                            <Text style={styles.mainHeading}>Activities</Text>
                            <Text style={styles.subHeading}>
                                Do you know what triggers your mood?
                                What makes you feel better or worse?
                                Track your activities to reveal the answers.
                            </Text>
                        </View>
                        <View style={styles.sectionWrapper}>
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                paddingHorizontal: 24
                            }}>
                                {
                                    this.props.revamp.revampContext.activities.map((item) => {
                                        return <View style={{marginRight: 17, marginBottom: 17, width: '45%'}}>
                                            <Button
                                                style={
                                                    selectedActivity && selectedActivity.name === item.activity.name
                                                        ? styles.imageBtnActive : styles.imageBtnInactive}
                                                onPress={() => {
                                                    if (selectedActivity && selectedActivity.name === item.activity.name) {
                                                        this.setState({
                                                            selectedActivity: null,
                                                            showActivityModal: false
                                                        })
                                                    } else {
                                                        this.setState({
                                                            selectedActivity: item.activity,
                                                            showActivityModal: true
                                                        })
                                                    }
                                                }}
                                                keyExtractor={item => item.activity.name}
                                            >
                                                <View style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: 155,
                                                    width: 155,
                                                    borderRadius: 8,
                                                    position: 'relative',
                                                    paddingHorizontal: 16,
                                                    paddingBottom: 30,
                                                    paddingTop: 32,

                                                }}>
                                                    <View style={{position: 'absolute', top: 8, right: 8}}>
                                                        {this.props.revamp.revampContext?.activities
                                                            && this.props.revamp.revampContext.activities
                                                                .some(activityContext => {
                                                                    return activityContext.activity.name === item.activity.name
                                                                        && activityContext.schedule
                                                                })
                                                            &&
                                                            <Image resizeMode={'contain'}
                                                                   style={{height: 19.9, width: 20}}
                                                                   source={require("../../assets/images/calenderCheck.png")}/>
                                                        }
                                                    </View>
                                                    <View style={styles.activityBox}>
                                                        <Image resizeMode={'contain'}
                                                               style={{...styles.contentImage}}
                                                               source={{uri: item.activity.icon && S3_BUCKET_LINK + item.activity.icon}}
                                                        />
                                                        <Text style={styles.activityName}>{item.activity.name}</Text>
                                                        <Text style={styles.checkInsText}>{
                                                            this.props.revamp.revampContext?.activities
                                                            && this.props.revamp.revampContext.activities
                                                                .some(activityContext => {
                                                                    return activityContext.activity.name === item.activity.name
                                                                        && activityContext.checkIns
                                                                        && activityContext.checkIns.length > 0
                                                                })
                                                                ? this.props.revamp.revampContext.activities
                                                                .find(activityContext => activityContext.activity.name === item.activity.name).checkIns.length + ' check-ins'
                                                                : 'No check-ins'
                                                        }</Text>
                                                    </View>
                                                </View>
                                            </Button>
                                        </View>
                                    })
                                }
                            </View>
                        </View>
                    </View>
                </Content>
                {!showActivityModal
                    && selectedActivity === null
                    && <View style={styles.greBtns}>
                        <PrimaryButton
                            color={Colors.colors.whiteColor}
                            onPress={() => {
                                this.navigateToAddActivitiesScreen();
                            }}
                            text="Add activities"
                            size={24}
                        />
                    </View>
                }


                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={()=>{this.setState({showActivityModal: false, selectedActivity:null})}}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '60%'
                    }}
                    isOpen={showActivityModal}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={{
                            marginTop: 14,
                            marginBottom: 40,
                            paddingLeft: 24,
                            paddingRight: 24,
                            alignItems: 'center',
                        }}>
                            {selectedActivity && valueExists(selectedActivity.icon) &&
                                <Image style={styles.popupIconImg}
                                       resizeMode={'contain'}
                                       source={{uri: selectedActivity.icon && S3_BUCKET_LINK + selectedActivity.icon}}
                                />
                            }
                            <View>
                                <Text
                                    style={{
                                        ...styles.modalMainHeading,
                                        marginBottom: 0
                                    }}>{selectedActivity && selectedActivity.name}</Text>

                                <Text style={styles.checkInsText2}>{
                                    selectedActivity &&
                                    this.props.revamp.revampContext?.activities
                                    && this.props.revamp.revampContext.activities
                                        .some(activityContext => {
                                            return activityContext.activity.name === selectedActivity.name
                                                && activityContext.checkIns
                                                && activityContext.checkIns.length > 0
                                        })
                                        ? this.props.revamp.revampContext.activities
                                        .find(activityContext => activityContext.activity.name === selectedActivity.name).checkIns.length + ' check-ins'
                                        : 'No check-ins'
                                }</Text>
                            </View>

                        </View>
                        {/*<SecondaryButton*/}
                        {/*    onPress={() => {this.navigateToQuestions();}}*/}
                        {/*    text="Schedule"*/}
                        {/*/>*/}

                    </Content>
                    <View style={{paddingBottom: isIphoneX()? 34 : 24}}>
                        <SecondaryButton
                            onPress={() => {this.navigateToScheduleActivityScreen(selectedActivity.name);}}
                            text="Schedule"
                        />
                    <PrimaryButton
                        onPress={() => {this.navigateCheckInActivityScreen(selectedActivity.name);}}
                        text="Check-in"
                    />
                    </View>
                </Modal>

            </Container>
        );
    }
    ;
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        backgroundColor: 'transparent',
        // ...CommonStyles.styles.headerShadow
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerRow: {
        flex: 3,
        alignItems: 'center',
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    questionWrapper: {
        marginTop: 0,
        // paddingHorizontal: 24,
    },
    questionsBg: {
        width: '100%',
        position: 'absolute',
        // top: HEADER_SIZE + 7,
        zIndex: -1,
    },
    iconImg: {
        height: 24,
        width: 24,
        // marginBottom:100,
    },
    popupIconImg: {
        height: 89,
        width: 120,
        marginBottom: 24,
    },
    sectionWrapper: {
        paddingBottom: 56,
        // padding: 14
    },
    mainContentWrapper: {
        paddingHorizontal: 24,
    },
    statementList: {
        paddingHorizontal: 24,
        marginBottom: 102,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    }
    , subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center'

    },
    headTextWrap: {
        display: 'flex',
        flexDirection: 'row'
    },
    headMainText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
        marginLeft: 16,
        marginTop: 15,
        // justifyContent: 'center',
        // alignItems: 'center',

    },
    iconBg: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        borderRadius: 5

    },


    selectionTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.highContrast,
        marginTop: 4
    },
    modalMainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        marginBottom: 16
    },
    modalSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,

    },
    popupHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingBottom: 24,
        color: Colors.colors.highContrast,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentImage: {
        height: 40,
        width: 40
    },
    contentTitle: {
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingTop: 16,
    },
    contentDescs: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    activityBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activityName: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginTop: 16
    },
    checkInsText: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
        textAlign: 'center'
    },
    checkInsText2: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.lowContrast,
        textAlign: 'center'
    },
    imageButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 29,
        paddingHorizontal: 29
    },
    secondaryButton: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 16,
    },
    imageBtnActive: {
        borderRadius: 12,
        borderWidth: 1,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 0,
        height: 155,
        width: 155,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.primaryColorBG
    },
    imageBtnInactive: {
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'transparent',
        height: 155,
        width: 155,
        marginBottom: 0,
        ...CommonStyles.styles.shadowBox,
    },
    btnActive: {
        borderRadius: 8,
        borderWidth: 1,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 0,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.primaryColorBG,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        textTransform: 'none',
        paddingTop: 28,
        paddingBottom: 28,

    },
    btnInactive: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        marginBottom: 0,
        ...CommonStyles.styles.shadowBox,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        textTransform: 'none',
        backgroundColor: Colors.colors.whiteColor,
        paddingTop: 28,
        paddingBottom: 28,
    },
    btnText: {
        textTransform: 'none',
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',


    },
    contentWrap: {
        flexDirection: 'row',
        // padding:12,
        position: 'relative',
        alignItems: 'center'
    },
    textAreaInput: {
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
    },
    textAreaMainHeading: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    textAreaSubHeading: {
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        // marginBottom: 8
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
        zIndex: -1
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        paddingTop: 40,

        alignSelf: 'center',
        position: 'absolute',
        // top: Platform.OS === 'ios'? isIphoneX()? 112 : 80 : 55,
        bottom: 0,
        left: 0,
        right: 0,
        borderColor: 'rgba(37,52,92,0.1)',
        borderTopWidth: 0.5,
        elevation: 1,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 0.5,
        shadowColor: 'rgba(37,52,92,0.1)',
        zIndex: 0,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },
    valuesSelectedWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25
    },
    sectionItem: {
        ...CommonStyles.styles.shadowBox,
        // borderWidth: 1,
        // borderColor: 'red',
        padding: 24,
        // margin:20,
        width: '98%',
        marginBottom: 8,
        borderRadius: 12,
        height: 137,
        backgroundColor: Colors.colors.whiteColor,
    },
    sectionItemHeading: {
        display: 'flex',
        flexDirection: 'row',
    },
    sectionItemContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    secondaryBtn: {
        marginBottom: 16
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        // marginTop: 32,
        textAlign: 'center'
    },
    actionBtnWrapper: {
        paddingLeft: 24,
        paddingRight: 24,
    },
    actionPrimaryBtn: {
        marginBottom: 40,
    },
    greBtns: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        backgroundColor: 'transparent'
    }
});

export default connectRevamp()(RevampAllActivitiesScreen);

