import React, {Component} from "react";
import {Image, Platform, StatusBar, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {Button, Container, Content, Header, Left, Right, Text, View} from "native-base";
import {addTestID, Colors, CommonStyles, getHeaderHeight, PrimaryButton, TextStyles,} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import {connectRevamp} from "../../redux";
import {Screens} from "../../constants/Screens";
import Loader from "../../components/Loader";

const HEADER_SIZE = getHeaderHeight();

class SundayCheckInHomeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderHeader = () => {
        return (
            <Header
                {...addTestID("Header")}
                noShadow transparent style={styles.chatHeader}>
                <StatusBar
                    backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                    translucent
                    barStyle={"dark-content"}
                />
                <Left>
                    <Button
                        {...addTestID("Back")}
                        onPress={() => {
                            this.props.fetchRevampSundayCheckin();
                            this.props.navigation.goBack()
                        }}
                        transparent
                        style={styles.backButton}>
                        <EntypoIcons size={30} color={Colors.colors.white} name="chevron-thin-left"/>
                    </Button>
                </Left>
                <Right/>
                {/*<Right>*/}
                {/*    <Button*/}
                {/*        onPress={this.showInfoDrawer}*/}
                {/*        transparent>*/}
                {/*        <AntIcons size={20} color={Colors.colors.whiteColor} name="infocirlceo"/>*/}
                {/*    </Button>*/}
                {/*</Right>*/}
            </Header>
        )
    }

    navigateToCheckInScreen = (data) => {
        let currentIndex = 0;
        let revampSundayCheckIn = this.props.revamp.revampSundayCheckIn;
        if (data.name === "Progress"){
            if (revampSundayCheckIn.progress.rewardProgress > 0 ){
                currentIndex = 1 ;
            }
        }

        if (data.name === "Mind & Body") {
            if (revampSundayCheckIn.mindAndBody.questionsAnswers && revampSundayCheckIn.mindAndBody.questionsAnswers.length > 0){
                currentIndex = revampSundayCheckIn.mindAndBody.questionsAnswers.length;
            }
        }
        this.props.navigation.navigate(Screens.REVAMP_SUNDAY_CHECK_IN_QUESTIONS_SCREEN, {
            revampTypeData: data,
            currentIndex
        })
    }

    navigateToPlanCheckInScreen = (data) => {
        this.props.navigation.navigate(Screens.REVAMP_PLAN_SUNDAY_CHECKIN_SCREEN, {
            revampTypeData: data
        })
    }

    saveRewards = async () => {

        let revampSundayCheckIn = this.props.revamp.revampSundayCheckIn;
        revampSundayCheckIn.sundayCheckInStatus = 'COMPLETED'
        this.props.updateRevampSundayCheckin({revampSundayCheckIn});
        let revampContext = this.props.revamp.revampContext;
        if(revampContext.tokens && revampContext.tokens >= 0){
            revampContext.tokens += 1;
        } else {
            revampContext.tokens = 1;
        }
        this.props.updateRevampContext(revampContext);
        this.props.fetchRevampSundayCheckin();
        this.props.navigation.replace(Screens.REVAMP_REWARD_POINT_SCREEN,
            {
                revampTypeData: {name: "sundayCheckIn"},
                contentfulData: {
                    tokenText: 'You have earned 1 token for completing your weekly check-in!',
                    tokenSubText: 'Great work! You can earn more tokens by logging ' +
                        'activities throughout the week. Keep the momentum going! '
                }
            })
    };

    render() {
        if (this.props.revamp.isLoading){
            return <Loader/>
        }
        StatusBar.setBarStyle("dark-content", true);
        let completedCount = 0;
        if (this.props.revamp.revampSundayCheckIn) {
            if (this.props.revamp.revampSundayCheckIn?.progress?.status === "COMPLETED") {
                completedCount += 1;
            }
            if (this.props.revamp.revampSundayCheckIn?.mindAndBody?.status === "COMPLETED") {
                completedCount += 1;
            }
            if (this.props.revamp.revampSundayCheckIn?.plan?.status === "COMPLETED") {
                completedCount += 1;
            }
        }
        return (
            <Container>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        start={{x: 0, y: 0.75}}
                        end={{x: 1, y: 0.25}}
                        colors={["#4389A2", "#5C258D"]}
                        style={styles.homeMainBg}>
                        {this.renderHeader()}
                        <View style={styles.homeTopTextWrap}>
                            <Text style={[styles.mainTitle, {textAlign: "center"}]}>Sunday check-in</Text>
                            <Text style={styles.homeSubTitle}>
                                How was your week? What will you tackle in the week to come?
                                Check-in on progress and revisit your plan.
                            </Text>
                            <View style={styles.contentWrapper}>

                                <View style={styles.sectionWrapper}>
                                    <View style={{paddingRight: 24}}>
                                        <Image
                                            {...addTestID('contribute-img')}
                                            resizeMode={'contain'}
                                            style={{height: 64, width: 64}}
                                            source={require('../../assets/images/ProgressSundayCheckIn.png')}/>
                                    </View>
                                    <View>
                                        <Text style={styles.mainHeading}>Progress</Text>
                                        <Text style={styles.subHeading}>Are you getting closer to your reward?</Text>
                                        {
                                            this.props.revamp.revampSundayCheckIn?.progress?.status === "COMPLETED"
                                                ?
                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                    <Icon name='check-circle' size={20}
                                                          color={Colors.colors.successIcon}/>
                                                    <Text style={styles.buttonTextSuccess}>Check-in completed</Text>
                                                </View>
                                                :
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        this.navigateToCheckInScreen(progressQuestion)
                                                    }}
                                                    style={styles.checkInButton}>
                                                    <Text style={styles.buttonText}>Do a check-in</Text>
                                                    <AntDesign name='arrowright' size={20} color="#005EBE"/>
                                                </TouchableOpacity>
                                        }
                                    </View>
                                </View>

                                <View style={styles.sectionWrapper}>
                                    <View style={{paddingRight: 24}}>
                                        <Image
                                            {...addTestID('contribute-img')}
                                            resizeMode={'contain'}
                                            style={{height: 64, width: 64}}
                                            source={require('../../assets/images/BrainMindandBody.png')}/>
                                    </View>
                                    <View>
                                        <Text style={styles.mainHeading}>Mind & Body</Text>
                                        <Text style={styles.subHeading}>How are you feeling mentally and
                                            physically?</Text>
                                        {
                                            this.props.revamp.revampSundayCheckIn?.mindAndBody?.status === "COMPLETED"
                                                ?
                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                    <Icon name='check-circle' size={20}
                                                          color={Colors.colors.successIcon}/>
                                                    <Text style={styles.buttonTextSuccess}>Check-in completed</Text>
                                                </View>
                                                :
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        this.navigateToCheckInScreen(mindAndBodyQuestions)
                                                    }}
                                                    style={styles.checkInButton}>
                                                    <Text style={styles.buttonText}>Do a check-in</Text>
                                                    <AntDesign name='arrowright' size={20} color="#005EBE"/>
                                                </TouchableOpacity>
                                        }
                                    </View>
                                </View>

                                <View style={styles.sectionWrapper}>
                                    <View style={{paddingRight: 24}}>
                                        <Image
                                            {...addTestID('contribute-img')}
                                            resizeMode={'contain'}
                                            style={{height: 64, width: 64}}
                                            source={require('../../assets/images/PlanSundayCheckIn.png')}/>
                                    </View>
                                    <View>
                                        <Text style={styles.mainHeading}>Plan</Text>
                                        <Text style={styles.subHeading}>Set your intentions for the week ahead.</Text>
                                        {
                                            this.props.revamp.revampSundayCheckIn?.plan?.status === "COMPLETED"
                                                ?
                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                    <Icon name='check-circle' size={20}
                                                          color={Colors.colors.successIcon}/>
                                                    <Text style={styles.buttonTextSuccess}>Check-in completed</Text>
                                                </View>
                                                :
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        this.navigateToPlanCheckInScreen(plan)
                                                    }}
                                                    style={styles.checkInButton}>
                                                    <Text style={styles.buttonText}>Do a check-in</Text>
                                                    <AntDesign name='arrowright' size={20} color="#005EBE"/>
                                                </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </ScrollView>
                {
                    (
                        this.props.revamp.revampSundayCheckIn?.progress?.status === "COMPLETED"
                        && this.props.revamp.revampSundayCheckIn?.mindAndBody?.status === "COMPLETED"
                        && this.props.revamp.revampSundayCheckIn?.plan?.status === "COMPLETED"
                    )
                    && (
                        <View style={{paddingHorizontal: 24, paddingBottom: 34}}>
                            <PrimaryButton
                                onPress={() => {
                                    this.saveRewards();
                                }}
                                text="Finish check-in"
                            />
                        </View>
                    )}

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    chatHeader: {
        paddingTop: 15,
        paddingLeft: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    homeMainBg: {
        minHeight: 306
    },
    homeTopTextWrap: {
        alignItems: "center"
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.whiteColor,
        marginBottom: 8,
        marginTop: 24
    },
    subTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.whiteColor,
        marginTop: 16,
    },
    homeSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        lineHeight: 27.2,
        letterSpacing: 0.75,
        color: Colors.colors.whiteColor,
        textDecorationLine: 'underline',
        textAlign: "center",
        opacity: 0.8,
        paddingHorizontal: 24,
        marginBottom: 40
    },
    contentWrapper: {
        ...CommonStyles.styles.shadowBox,
        // borderTopRightRadius: 24,
        // borderTopLeftRadius: 24,
        width: "100%",
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    sectionWrapper: {
        flexDirection: 'row',
        marginBottom: 40,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    },
    subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
        marginBottom: 8,
        width: '95%'
    },
    checkInButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: '#005EBE',
        paddingRight: 8
    },
    buttonTextSuccess: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.successText,
        paddingRight: 8,
        paddingLeft: 8
    },
});
const progressQuestion = {
    "id": "623b699c42eba40001a3b825",
    "contentfulEntryId": "LETCFZeevHT84kgIHvXM6",
    "name": "Progress",
    "type": "REVAMP_TYPE",
    "parent": "623b699b42eba40001a3b80e",
    "children": [
        {
            "id": "61e57f1d42eba400012a6bba",
            "name": "How would you rate your progress towards your reward?",
            "revampMetaData": {
                "description": {
                    "subtitle": "This is your personal opinion, so there are no wrong answers.",
                    "type": "ONE_LINER",
                    "values": []
                },
                "inputType": "RATING_SCALE",
                "renderType": "SCREEN",
                "displayType": "RATING_SCALE",
                "mappedValue": "",
                "minSelection": 0,
                "maxSelection": 100,
                "valuesGroups": [
                    {
                        "name": "",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "No Progress",
                        "highLabel": "Reward Achieved",
                        "values": []
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "ENABLED_FLOATING"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "",
                "profileElement": {
                    "id": "62336ab942eba4000133b104",
                    "key": "ReVAMP Reward Progress Score",
                    "type": "RATING_SCALE",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
            }
        },
        {
            "id": "61e57f1d42eba400012a6bbb",
            "name": "How can we help you achieve your reward?",
            "revampMetaData": {
                "description": {
                    "subtitle": "We’ve recruited a non-judgmental team of experts that can help you out.",
                    "type": "NUMERIC_LIST",
                    "values": []
                },
                "inputType": "MULTI_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 0,
                "maxSelection": 0,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Talk to a coach",
                                "subText": "Once you finish this exercise, we’ll connect you with a coach who will help you to achieve this reward.",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "Talk to a therapist",
                                "subText": "Once you finish this exercise, we’ll connect you with a therapist who will help you to achieve this reward.",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "Talk to a clinician",
                                "subText": "Once you finish this exercise, we’ll connect you with a clinician who will help you to achieve this reward.",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "Talk to a Matchmaker",
                                "subText": "Once you finish this exercise, we’ll connect you with a clinician who will help you to achieve this reward.",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "Join a support Group",
                                "subText": "Once you finish this exercise, we’ll connect you with a support Group who will help you to achieve this reward.",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "Continue building a plan on my own",
                                "subText": "Thank you for letting us know we will help you achieve this reward",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": "",
                                "onlyThis": true
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "HIDDEN_FLOATING"
                    }
                ],
                "popups": [],
                "responseBased": true,
                "backgroundImage": "",
                "profileElement": {
                    "id": "62336ab942eba4000133b104",
                    "key": "ReVAMP Reward Help",
                    "type": "USER_DEFINED_VALUES",
                    "values": [
                        'Talk to a coach',
                        'Talk to a therapist',
                        'Talk to a clinician',
                        'Talk to a Matchmaker',
                        'Join a support Group',
                        'Continue building a plan on my own',
                    ],
                    "method": "Most Recent Response"
                },
            }
        }
    ]
}
const mindAndBodyQuestions = {
    "name": "Mind & Body",
    "children": [
        {
            "id": "623b699c42eba40001a3b826",
            "name": "In the last week, have you slept well most nights?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody1.png",
                "profileElement": {
                    "id": "62336ab942eba4000133b102",
                    "key": "ReVAMP Slept well",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b827",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody1.1.png",
                            "profileElement": {
                                "id": "62336ab942eba4000133b103",
                                "key": "ReVAMP Slept well negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b828",
            "name": "In the last week, have you felt like you were concentrating well most days?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 1,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody2.png",
                "profileElement": {
                    "id": "62336ab942eba4000133b104",
                    "key": "ReVAMP Concentrating well",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b829",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody2.1.png",
                            "profileElement": {
                                "id": "62336ab942eba4000133b105",
                                "key": "ReVAMP Concentrating well negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b82a",
            "name": "In the last week, have you been eating well and felt good about your appetite most of the time?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody3.png",
                "profileElement": {
                    "id": "62336ab942eba4000133b106",
                    "key": "ReVAMP Eating well",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b82b",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody3.1.png",
                            "profileElement": {
                                "id": "62336ab942eba4000133b107",
                                "key": "ReVAMP Eating well negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b82c",
            "name": "In the last week, have you felt accomplished and worthy most of the time?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody4.png",
                "profileElement": {
                    "id": "62336ab942eba4000133b108",
                    "key": "ReVAMP Felt Accomplished or worthy",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b82d",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody4.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b109",
                                "key": "ReVAMP Felt accomplished or worthy negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b82e",
            "name": "In the last week, have you felt energized most of the time?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody5.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b10a",
                    "key": "ReVAMP Felt energized",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b82f",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody5.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b10b",
                                "key": "ReVAMP Felt energized negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b830",
            "name": "In the last week, have you felt relaxed or at peace more than not?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody6.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b10c",
                    "key": "ReVAMP Felt relaxed or at peace",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b831",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody6.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b10d",
                                "key": "ReVAMP Felt relaxed or at peace negative effect on life ",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b832",
            "name": "In the last week, have you felt mostly in control of your worries and concerns?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody7.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b10e",
                    "key": "ReVAMP In control of worries ",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b833",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody7.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b10f",
                                "key": "ReVAMP In control of worries negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b834",
            "name": "In the last week, have you felt interest or pleasure in doing things you typically enjoy?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody8.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b110",
                    "key": "ReVAMP Interest or pleasure in doing things",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b835",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody8.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b111",
                                "key": "ReVAMP Interest or pleasure in doing things negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b836",
            "name": "In the last week, have you felt hopeful and generally pretty good?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody9.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b112",
                    "key": "ReVAMP Hopeful and generally good",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b837",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody9.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b113",
                                "key": "ReVAMP Hopeful and generally good negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        },
        {
            "id": "623b699c42eba40001a3b838",
            "name": "In the last week, have you felt physically comfortable and healthy?",
            "revampMetaData": {
                "description": {
                    "subtitle": "",
                    "type": "ONE_LINER",
                    "values": []
                },
                "majorQuestion": true,
                "inputType": "SINGLE_SELECT",
                "renderType": "SCREEN",
                "displayType": "BUTTON_LIST",
                "mappedValue": "",
                "minSelection": 1,
                "maxSelection": 2,
                "valuesGroups": [
                    {
                        "name": "NO_GROUP",
                        "icon": "",
                        "colorCode": "",
                        "lowLabel": "",
                        "highLabel": "",
                        "values": [
                            {
                                "name": "Yes",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            },
                            {
                                "name": "No",
                                "subText": "",
                                "colorCode": "",
                                "exampleText": "",
                                "placeholder": "",
                                "icon": ""
                            }
                        ]
                    }
                ],
                "actionButtons": [
                    {
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "DISABLED_END"
                    }
                ],
                "popups": [],
                "responseBased": false,
                "backgroundImage": "revamp/mindandbody10.png",
                "profileElement": {
                    "id": "62336aba42eba4000133b114",
                    "key": "ReVAMP Physically uncomfortable or ill",
                    "type": "YES_NO",
                    "values": [
                        "Yes",
                        "No"
                    ],
                    "method": "All Responses with Date/Time stamps"
                },
                "children": [
                    {
                        "id": "623b699c42eba40001a3b839",
                        "name": "Has this negatively affected your life?",
                        "revampMetaData": {
                            "description": {
                                "subtitle": "",
                                "type": "ONE_LINER",
                                "values": []
                            },
                            "inputType": "SINGLE_SELECT",
                            "renderType": "DIALOG",
                            "displayType": "TILED_BUTTON_LIST",
                            "mappedValue": "No",
                            "minSelection": 1,
                            "maxSelection": 1,
                            "valuesGroups": [
                                {
                                    "name": "NO_GROUP",
                                    "icon": "",
                                    "colorCode": "",
                                    "lowLabel": "",
                                    "highLabel": "",
                                    "values": [
                                        {
                                            "name": "Yes",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        },
                                        {
                                            "name": "No",
                                            "subText": "",
                                            "colorCode": "",
                                            "exampleText": "",
                                            "placeholder": "",
                                            "icon": ""
                                        }
                                    ]
                                }
                            ],
                            "actionButtons": [
                                {
                                    "name": "Continue",
                                    "action": "NEXT",
                                    "primary": true,
                                    "primarySelectedText": "",
                                    "position": "DISABLED_BELOW"
                                }
                            ],
                            "popups": [],
                            "responseBased": false,
                            "backgroundImage": "mindandbody10.1.png",
                            "profileElement": {
                                "id": "62336aba42eba4000133b115",
                                "key": "ReVAMP Physically uncomfortable or ill negative effect on life",
                                "type": "YES_NO",
                                "values": [
                                    "Yes",
                                    "No"
                                ],
                                "method": "All Responses with Date/Time stamps"
                            }
                        }
                    }
                ]
            }
        }
    ]
}
const plan = {
    "name": "Plan",
}
export default connectRevamp()(SundayCheckInHomeScreen);
