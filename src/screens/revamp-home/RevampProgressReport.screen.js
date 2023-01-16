import React, {Component} from "react";
import {
    AppState,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {Button, Container, Content, Header, Left, Right, Text} from "native-base";
import {
    addTestID,
    AlertUtil, APPOINTMENT_STATUS,
    Colors,
    CommonStyles,
    CONNECTION_TYPES, getHeaderHeight,
    getTimeByDSTOffset,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from "ch-mobile-shared";
import Icon from "react-native-vector-icons/FontAwesome";
import Loader from "../../components/Loader";
import LinearGradient from "react-native-linear-gradient";
import Modal from "react-native-modalbox";
import AntIcon from "react-native-vector-icons/AntDesign";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import {AnimatedCircularProgress} from "react-native-circular-progress";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import SingleChatbotItem from "../../components/revamp-home/SingleChatbotItem";
import SingleGroupItem from "../../components/revamp-home/SingleGroupItem";
import CompletedGroupItem from "../../components/revamp-home/CompletedGroupItem";
import SingleActivityItem from "../../components/revamp-home/SingleActivityItem";
import IdeaItem from "../../components/revamp-home/IdeaItem";
import SingleMindBodyItem from "../../components/revamp-home/SingleMindBodyItem";
import BMSingleDot from "../../components/revamp-home/BMSingleDot";
import {appointments, connectConnections} from "../../redux";
import moment from "moment";
import {Screens} from "../../constants/Screens";
import {PLAN_ITEMS_TYPES, PLAN_STATUS, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import AppointmentService from "../../services/Appointment.service";
import {BookAppointmentModal} from "../../components/appointment/BookAppointmentModal";
import ConversationService from "../../services/Conversation.service";

const HEADER_SIZE = getHeaderHeight();
const windowWidth = Dimensions.get("window").width;

const MIND_AND_BODY_STATUS = {
    BETTER: {key: 'Better than previous week', value: require("../../assets/images/BM-up.png")},
    WORSE: {key: 'Worse than previous week', value: require("../../assets/images/BM-down.png")},
    POSITIVE: {key: 'Positive this week', value:  require("../../assets/images/BM-okay.png")},
    NEGATIVE: {key: 'Negative this week', value: null},
    NONE: {key: 'Check-in is not completed', value: require("../../assets/images/BM-question.png")}
}

const MIND_AND_BODY_WEEKLY_STATUS = {
    POSITIVE: {key: 'POSITIVE', value: Colors.colors.successIcon},
    NEGATIVE: {key: 'NEGATIVE', value: Colors.colors.secondaryIcon},
    NONE: {key: 'NONE', value: Colors.colors.warningIcon}
}

class RevampProgressReportScreen extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            currentIndex: 0,
            chatBots: [],
            appointments: [],
            bookModalVisible: false
        };
    }

    componentDidMount = async () => {
        this.getProgressReportAppointments();
        this.getChatBot();
        this.getAllGroup();
    };

    getProgressReportAppointments = async () => {
        try {
            const {currentIndex} = this.state;
            const queryParams = {
                startDate: this.props.revamp.revampSundayCheckInsList[currentIndex].startDateTime,
                endDate: this.props.revamp.revampSundayCheckInsList[currentIndex].endDateTime,
                patientId: this.props.revamp.revampSundayCheckInsList[currentIndex].userAccountId
            }
            let appointments = await AppointmentService.getProgressReportAppointments(queryParams);
            this.setState({appointments})
            if (appointments?.errors) {
                AlertUtil.showErrorMessage(appointments.errors[0].endUserMessage);
            } else {
                this.setState({
                    appointments
                });
            }
        } catch (e) {
            console.log(e);
        }

    };

    /**
     * @function getChatBotList
     * @description This method is used to get chat bot list.
     */
    getChatBot = () => {
        try {
            let chatBotList = this.props?.connections?.chatbotList;
            const conversationPlanItems = this.props.revamp.revampContext.plan.planItemsContexts.filter(planItem=> planItem.planItem.type === PLAN_ITEMS_TYPES.CONVERSATION).flatMap(item=>item.planItem.referenceId)
            let activeChatBotConnections = this.props.connections.activeConnections.filter(activeConnection => activeConnection.type === CONNECTION_TYPES.CHAT_BOT);
            activeChatBotConnections = activeChatBotConnections.map(activeChatBotConnections => {
                const records = chatBotList.find(chatBot => chatBot.organizationId === activeChatBotConnections.connectionId);
                return {
                    ...activeChatBotConnections,
                    assigned: records?.assigned,
                    organizationId: records?.organizationId,
                    avatar: records?.avatar,
                };
            }).filter(chatBot=>conversationPlanItems.includes(chatBot.connectionId));
            this.setState({chatBots: activeChatBotConnections.filter(Boolean)});
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * @function getAllGroup
     * @description This method is used to get All Group.
     */
    getAllGroup = async () => {
        try {
            const groupPlanItems = this.props.revamp.revampContext.plan.planItemsContexts.filter(planItem=> planItem.planItem.type === PLAN_ITEMS_TYPES.GROUP).flatMap(item=>item.planItem.referenceId)
            let response = this.props?.connections?.allGroups.map(group=> {
                if ( group.channelUrl) {
                    return group
                }
            }).filter(group=>groupPlanItems.includes(group.channelUrl));
            this.setState({groups: response, isLoading: false});

        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    };

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function renderHeader
     * @description This method is used to render Header items
     */
    renderHeader = () => {
        return (
            <Header
                {...addTestID("Header")}
                noShadow transparent style={styles.progressHeader}>
                <StatusBar
                    backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                    translucent
                    barStyle={"dark-content"}
                />
                <Left>
                    <Button
                        {...addTestID("Back")}
                        onPress={() => this.navigateBack()}
                        transparent
                        style={styles.backButton}>
                        <EntypoIcons size={30} color={Colors.colors.whiteColor} name="chevron-thin-left"/>
                    </Button>
                </Left>
                <Right/>
                {/*<Right>*/}
                {/*    <Button*/}
                {/*        onPress={()=>{*/}
                {/*            this.openModal("infoDrawer","infoDrawer")*/}
                {/*        }}*/}
                {/*        transparent>*/}
                {/*        <AntIcons size={22} color={Colors.colors.whiteColor} name="info"/>*/}
                {/*    </Button>*/}
                {/*</Right>*/}
            </Header>
        );
    };

    /**
     * @function renderWeekSliderSection
     * @description This method is used to render week slider section.
     */
    renderWeekSliderSection = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];

        return (
            <View style={styles.weeklySliderWrapper}>
                <TouchableOpacity style={styles.sliderLeftWrapper}
                                  onPress={() => {
                                      if (currentIndex < revampSundayCheckInsList?.length - 1) {
                                          this.setState({
                                              currentIndex: currentIndex + 1,
                                              revampSundayCheckIn: revampSundayCheckInsList[currentIndex + 1],
                                          }, () => this.getProgressReportAppointments());
                                      }
                                  }}
                >
                    <AntIcon name="arrowleft" size={24}
                             color={currentIndex + 1 <= revampSundayCheckInsList?.length - 1 ? Colors.colors.highContrast : Colors.colors.neutral50Icon}/>
                </TouchableOpacity>
                <View style={styles.sliderCenterWrapper}>
                    <Text
                        style={styles.sliderCenterText}>{moment(revampSundayCheckIn?.startDateTime).utc().local().format("MMMM DD")} - {moment(revampSundayCheckIn?.endDateTime).utc().local().format("MMMM DD")}</Text>
                </View>
                <TouchableOpacity style={styles.sliderRightWrapper}
                                  onPress={() => {
                                      if (currentIndex > 0) {
                                          this.setState({
                                              currentIndex: currentIndex - 1,
                                              revampSundayCheckIn: revampSundayCheckInsList[currentIndex - 1],
                                          }, () => this.getProgressReportAppointments());
                                      }
                                  }}
                >
                    <AntIcon name="arrowright" size={24}
                             color={currentIndex - 1 >= 0 ? Colors.colors.highContrast : Colors.colors.neutral50Icon}/>
                </TouchableOpacity>
            </View>
        );
    };

    navigateToSundayCheckIn = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        let id = revampSundayCheckIn.id
        this.props.fetchRevampSundayCheckin(id)
        this.props.navigation.navigate(Screens.SUNDAY_CHECK_IN_HOME_SCREEN)
    }

    /**
     * @function renderDescriptionSection
     * @description This method is used to render Description section.
     */
    renderDescriptionSection = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        if (moment().startOf("week").isSame(revampSundayCheckIn?.startDateTime, "week")) {
            return (
                <View style={styles.descriptionWrapper}>
                    <Image
                        style={[styles.descriptionIcon]}
                        source={require("../../assets/images/hourglass.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.descriptionText}>Full progress report for this week will be ready on <Text
                        style={styles.pinkText}>{moment(revampSundayCheckIn?.endDateTime).utc().local().format("dddd, MMMM Do")}</Text> after
                        you complete the check-in.</Text>
                </View>
            );
        } else if (revampSundayCheckIn?.sundayCheckInStatus === "COMPLETED") {
            return (
                <View style={styles.revampProgressWrapper}>
                    <View style={styles.revampProgressBarWrapper}>
                        <View style={styles.roundProgressBar}>
                            <AnimatedCircularProgress
                                size={80}
                                width={8}
                                fill={revampSundayCheckIn?.progress?.rewardProgress}
                                rotation={0}
                                lineCap={"round"}
                                tintColor={Colors.colors.mainPink}
                                backgroundColor="#F1F5F8"
                            />
                            <Text
                                style={styles.progressCenterText}>{revampSundayCheckIn?.progress?.rewardProgress}</Text>
                        </View>
                    </View>
                    <View style={styles.revampProgressDescWrapper}>
                        {revampSundayCheckIn?.progress?.rewardProgress >= 30
                            ?
                            <Text style={styles.revampProgressDescText}>Great progress! Keep doing what you are
                                doing.</Text>
                            :
                            <Text style={styles.revampProgressDescText}>There’s room for improvement in reaching your
                                reward.</Text>
                        }
                    </View>
                </View>
            );
        } else if (revampSundayCheckIn?.sundayCheckInStatus === "IN_PROGRESS") {
            return (
                <View>
                    <View style={styles.descriptionWrapper}>
                        <Image
                            style={[styles.descriptionIcon]}
                            source={require("../../assets/images/lock.png")}
                            resizeMode={"contain"}/>
                        <Text style={styles.descriptionText}>Complete a check-in to unlock your full progress report for
                            this week!</Text>
                    </View>
                    <View style={{marginBottom: 40}}>
                        <PrimaryButton
                            text={"Complete check-in"}
                            onPress={() => {
                                this.navigateToSundayCheckIn()
                            }}
                        />
                    </View>
                </View>
            );
        } else if (revampSundayCheckIn?.sundayCheckInStatus === "LOCKED") {
            return (
                <View>
                    <View style={styles.descriptionWrapper}>
                        <Image
                            style={[styles.descriptionIcon]}
                            source={require("../../assets/images/lock.png")}
                            resizeMode={"contain"}/>
                        <Text style={styles.descriptionText}>Full progress report for this week is locked because you
                            didn’t complete the check-in.</Text>
                    </View>
                </View>
            );
        }
    };

    /**
     * @function renderCurrentRewardSection
     * @description This method is used to render Current Reward section.
     */
    renderCurrentRewardSection = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        return (
            <View style={styles.currentRewardWrapper}>
                <View style={{...styles.currentRewardBox, marginRight: 16}}>
                    <Text
                        style={styles.currentRewardTitle}>
                        {
                            revampSundayCheckIn?.tokensEarned
                                ? revampSundayCheckIn?.tokensEarned
                                : 0} token
                        {revampSundayCheckIn?.tokensEarned
                        && revampSundayCheckIn?.tokensEarned > 1
                            ? "s"
                            : ""}</Text>
                    <Text style={styles.currentRewardDesc}>Earned this week</Text>
                </View>
                <View style={styles.currentRewardBox}>
                    <Text
                        style={styles.currentRewardTitle}>$ {revampSundayCheckIn?.dollarsEarned ? revampSundayCheckIn?.dollarsEarned : 0}</Text>
                    <Text style={styles.currentRewardDesc}>Earned this week</Text>
                </View>
            </View>
        );
    };

    /**
     * @function renderRevampListSection
     * @description This method is used to render Revamp List section.
     */
    renderRevampListSection = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        if (revampSundayCheckIn) {
            const {
                planCount,
                mindAndBodyCount,
                activityCount,
                appointmentCount,
                groupSessionCount,
                chatBotCount,
            } = revampSundayCheckIn;
            return (
                <View style={styles.revampItemsWrapper}>
                    <TouchableOpacity
                        onPress={() => {
                            this.openModal("planDrawer", "planDrawer");
                        }}
                        style={styles.revampItemBox}>
                        <View style={styles.revampItemTextWrapper}>
                            <Text style={styles.revampItemTitle}>Plan</Text>
                            <Text
                                style={styles.revampItemDesc}>{`${planCount?.completedCount} of ${planCount?.totalCount} completed`}</Text>
                        </View>
                        <View>
                            <Image
                                style={[styles.RevampItemIcon]}
                                source={require("../../assets/images/revamp_Plan.png")}
                                resizeMode={"contain"}/>
                        </View>
                    </TouchableOpacity>

                    {revampSundayCheckIn.mindAndBody &&
                        <TouchableOpacity
                            onPress={() => {
                                this.openModal("bodyMindDrawer", "bodyMindDrawer");
                            }}
                            style={styles.revampItemBox}>
                            <View style={styles.revampItemTextWrapper}>
                                <Text style={styles.revampItemTitle}>Mind & body</Text>
                                <Text style={styles.revampItemDesc}>{mindAndBodyCount}% positive</Text>
                            </View>
                            <View>
                                <Image
                                    style={[styles.RevampItemIcon]}
                                    source={require("../../assets/images/brain-icon.png")}
                                    resizeMode={"contain"}/>
                            </View>
                        </TouchableOpacity>
                    }

                    {revampSundayCheckIn.activity
                        && <TouchableOpacity
                            onPress={() => {
                                this.openModal("activitiesDrawer", "activitiesDrawer");
                            }}
                            style={styles.revampItemBox}>
                            <View style={styles.revampItemTextWrapper}>
                                <Text style={styles.revampItemTitle}>Activities</Text>
                                <Text style={styles.revampItemDesc}>{activityCount} check-ins</Text>
                            </View>
                            <View>
                                <Image
                                    style={[styles.RevampItemIcon]}
                                    source={require("../../assets/images/revamp_activities.png")}
                                    resizeMode={"contain"}/>
                            </View>
                        </TouchableOpacity>

                    }


                    <TouchableOpacity
                        onPress={() => {
                            this.openModal("appointmentDrawer", "appointmentDrawer");
                        }}
                        style={styles.revampItemBox}>
                        <View style={styles.revampItemTextWrapper}>
                            <Text style={styles.revampItemTitle}>Appointments</Text>
                            <Text
                                style={styles.revampItemDesc}>{` ${appointmentCount?.completedCount} of ${appointmentCount?.totalCount} completed`}</Text>
                        </View>
                        <View>
                            <Image
                                style={[styles.RevampItemIcon]}
                                source={require("../../assets/images/revamp_appointments.png")}
                                resizeMode={"contain"}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.openModal("groupsDrawer", "groupsDrawer");
                        }}
                        style={styles.revampItemBox}>
                        <View style={styles.revampItemTextWrapper}>
                            <Text style={styles.revampItemTitle}>Group sessions</Text>
                            <Text style={styles.revampItemDesc}>{groupSessionCount} attended</Text>
                        </View>
                        <View>
                            <Image
                                style={[styles.RevampItemIcon]}
                                source={require("../../assets/images/revamp_groupSessions.png")}
                                resizeMode={"contain"}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.openModal("chatbotDrawer", "chatbotDrawer");
                        }}
                        style={styles.revampItemBox}>
                        <View style={styles.revampItemTextWrapper}>
                            <Text style={styles.revampItemTitle}>Chatbots</Text>
                            <Text
                                style={styles.revampItemDesc}>{`${chatBotCount?.completedCount} of ${chatBotCount?.totalCount} completed`}</Text>
                        </View>
                        <View>
                            <Image
                                style={[styles.RevampItemIcon]}
                                source={require("../../assets/images/revamp_chatbots.png")}
                                resizeMode={"contain"}/>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    };


    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case "infoDrawer" :
                return {ref: "infoDrawer", maxHeight: "85%", method: () => this.renderDrawerModal()};
            case "planDrawer" :
                return {ref: "planDrawer", maxHeight: "85%", method: () => this.renderPlanModal()};
            case "chatbotDrawer" :
                return {ref: "chatbotDrawer", maxHeight: "85%", method: () => this.renderChatbotModal()};
            case "groupsDrawer" :
                return {ref: "groupsDrawer", maxHeight: "85%", method: () => this.renderGroupModal()};
            case "appointmentDrawer" :
                return {ref: "appointmentDrawer", maxHeight: "85%", method: () => this.renderAppointmentModal()};
            case "activitiesDrawer" :
                return {ref: "activitiesDrawer", maxHeight: "85%", method: () => this.renderActivitiesModal()};
            case "bodyMindDrawer" :
                return {ref: "bodyMindDrawer", maxHeight: "85%", method: () => this.renderMindAndBodyModal()};
            default :
                return null;
        }
    };


    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type, modalType) => {
        this.setState({modalDetails: this.getRenderModalDetails(type), modalType: modalType, openModal: true});
    };

    closeModal = (type, modalType) => {
        this.setState({modalDetails: this.getRenderModalDetails(type), modalType: modalType, openModal: false});
    };

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null, openModal: false, modalType: ""});
    };


    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    renderDrawerModal = () => {
        return (
            <View style={styles.infoDetails}>
                <Text style={styles.planMainText}>info options</Text>
            </View>
        );
    };


    /**
     * @function navigateToSeeAllPriorities
     * @description This method is used to navigate to see All priorities
     */
    navigateToSeeAllPriorities = () => {
        let revampContextDetails = this.props.revamp.revampContext;
        this.props.navigation.navigate(Screens.PLAN_HOME_DETAILS_SCREEN, {
            revampContextDetails,
            seeFullPlan: true,
        });
    };


    /**
     * @function renderPlanModal
     * @description This method is used to render plan Modal details.
     */
    renderPlanModal = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        const {
            planCount,
        } = revampSundayCheckIn;
        const planItems = this.props?.revamp?.revampContext?.plan?.planItemsContexts;
        return (
            <View style={{ flex: 1}}>
                <ScrollView>
                    <View style={styles.sectionWrapper}>
                        <Image
                            style={[styles.sectionIcon]}
                            source={require("../../assets/images/revamp_Plan.png")}
                            resizeMode={"contain"}/>
                        <Text style={styles.sectionMainText}>Plan</Text>
                        <Text style={[styles.sectionSubText, {marginBottom: planCount?.completedCount > 0 ? 0 : 80}]}>
                            {planCount?.completedCount > 0 ?
                                'You have done '+ planCount?.completedCount + ' of ' + planCount?.totalCount + ' items at least once.'
                                + 'Do you want to add any of these to your plan for next week?'
                                :
                                'It looks like you haven’t completed any items from your plan yet this week. ' +
                                'Go to your plan to get started.'}
                        </Text>
                    </View>

                    {planCount?.completedCount > 0 && (
                        <View>
                            <View style={styles.barWrapper}>
                                <View style={{backgroundColor: Colors.colors.mediumContrastBG, borderRadius: 8}}>
                                    <ProgressBarAnimated
                                        style={{width: "100%"}}
                                        borderWidth={0}
                                        width={windowWidth - 80}
                                        value={10}
                                        height={10}
                                        backgroundColor={Colors.colors.mainPink}
                                        backgroundColorOnComplete={Colors.colors.successIcon}
                                        borderRadius={8}
                                    />
                                </View>
                                <View style={styles.barText}>
                                    <Text
                                        style={styles.barProgressText}>{planCount?.completedCount}/{planCount?.totalCount} completed</Text>
                                    <Text
                                        style={styles.barProgressText}>{Math.round(planCount?.completedCount/planCount?.totalCount * 100)}%</Text>
                                </View>
                            </View>

                            {planItems?.length > 0 && (
                                <View style={styles.planListing}>
                                    {planItems?.filter(planItem => planItem.status === "COMPLETED").map(filteredPlanItem => {
                                        return (
                                            <View style={styles.singlePlan}>
                                                <View style={styles.greenBorder}/>
                                                <View style={{flex: 1}}>
                                                    {filteredPlanItem?.planItem?.planToken &&
                                                    <Text style={styles.singleMainText}>
                                                        {filteredPlanItem?.planItem?.planToken} token{filteredPlanItem?.planItem?.planToken > 1
                                                        ? "s"
                                                        : ""} earned
                                                    </Text>
                                                    }
                                                    <Text
                                                        style={styles.singleSubText} numberOfLines = {2}>{filteredPlanItem?.planItem?.name}</Text>
                                                </View>
                                                <View>
                                                    <AntIcon style={styles.tickIcon}
                                                             color={Colors.colors.successIcon}
                                                             size={28}
                                                             name="check"/>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
                <View style={styles.btnWrapper }>
                    <PrimaryButton
                        text={"Go to my plan"}
                        onPress={() => {
                            this.navigateToSeeAllPriorities();
                        }}
                    />
                </View>
            </View>
        );
    };
    navigateToChatBotProfileScreen = (selectedChatbot) => {
        this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {
            contact: selectedChatbot
        });
    }
    /**
     * @function renderChatBotsList
     * @description This method is used to render each chatbot item
     */
    renderChatBotsList = (chatbotList) => {
        if (chatbotList?.length > 0) {
            return (
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalCardList}
                    horizontal
                    ref={ref => {
                        this.scrollView = ref;
                    }}>
                    {chatbotList?.map(chatbot => {
                        return (
                            <TouchableOpacity
                                onPress={()=>{
                                    this.navigateToChatBotProfileScreen(chatbot);
                                }}
                            >
                                <SingleChatbotItem
                                    avatar={chatbot?.avatar}
                                    tokenText={chatbot?.chatbotToken}
                                    mainTitle={chatbot?.name}
                                    statusType={""}
                                    progressValue={chatbot?.progress?.percentage}
                            />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            );
        }
    };


    /**
     * @function renderChatbotModal
     * @description This method is used to render chatbot modal.
     */
    renderChatbotModal = () => {
        const {chatBots} = this.state;

        const completed = chatBots?.filter(chatBot => chatBot.progress?.completed === true).length > 0
            ? chatBots?.filter(chatBot => {
                return chatBot.progress?.completed === true
            })
            : [];

        const inProgress = chatBots?.filter(chatBot => chatBot.progress?.completed === false && chatBot.progress?.percentage > 0).length > 0
            ? chatBots?.filter(chatBot => chatBot.progress?.completed === false && chatBot.progress?.percentage > 0)
            : [];

        const notStarted = chatBots?.filter(chatBot => chatBot.progress?.completed === false && chatBot.progress?.percentage <= 0).length > 0
            ? chatBots?.filter(chatBot => chatBot.progress?.completed === false && chatBot.progress?.percentage <= 0)
            : [];

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionWrapper}>
                    <Image
                        style={[styles.sectionIcon]}
                        source={require("../../assets/images/revamp_chatbots.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.sectionMainText}>Chatbots</Text>
                    <Text style={[styles.sectionSubText, {marginBottom: 40}]}>
                        Check out the status of each of the chatbots that are a part of your plan. </Text>
                </View>
                <View style={styles.botListing}>

                    {completed?.length > 0 ?
                        <View>
                            <View style={styles.headerWrapper}>
                                <Text style={styles.statusHeader}>Completed</Text>
                                <Text style={styles.chatbotCount}>{completed?.length || 0} chatbots</Text>

                            </View>
                            {this.renderChatBotsList(completed)}
                        </View>
                        :
                        <View style={{ paddingHorizontal: 24 }}>
                            <Text style={styles.completeHead}>Completed</Text>
                            <Text style={styles.completeSub}>No chatbots completed this week.</Text>
                        </View>
                    }

                    {inProgress?.length > 0 && (
                        <View>
                            <View style={styles.headerWrapper}>
                                <Text style={styles.statusHeader}>In progress</Text>
                                <Text style={styles.chatbotCount}>{inProgress?.length || 0} chatbots</Text>
                            </View>
                            {this.renderChatBotsList(inProgress)}
                        </View>
                    )}

                    {notStarted?.length > 0 && (
                        <View>
                            <View style={styles.headerWrapper}>
                                <Text style={styles.statusHeader}>Not started</Text>
                                <Text style={styles.chatbotCount}>{notStarted?.length || 0} chatbots</Text>

                            </View>
                            {this.renderChatBotsList(notStarted)}
                        </View>
                    )}
                </View>
            </ScrollView>
        );
    };

    addEventToCalendar = async () => {
        const {appointment} = this.props;
        let startDate , endDate;
        let dstOffsetDetail = this.getDSTOffsetDetails(appointment.startTime, appointment.endTime);
        startDate = dstOffsetDetail?.startDate;
        endDate = dstOffsetDetail?.endDate;
        const eventConfig = {
            title: 'Appointment with ' +
                appointment.participantName,
            startDate:  startDate,
            endDate: endDate,
            appointmentId: appointment.appointmentId,
        };
        if (!this.props.providerApp) {
            const url = await this.props.deepLinkService(eventConfig, appointment);
            console.log("branch link for appointment =", url)
            eventConfig.notes = url;
        }
        this.props.addToCalender(
            eventConfig,
        );
    };

    viewGroup = (selectedGroup) => {
        // if (selectedGroup?.joinedGroup) {
        //     this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
        //             connection: {
        //                 ...selectedGroup,
        //                 type: CONNECTION_TYPES.CHAT_GROUP,
        //                 channelUrl: selectedGroup.channelUrl,
        //                 connectionId: selectedGroup.channelUrl
        //             }
        //         }
        //     );
        // } else {
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                channelUrl: selectedGroup.channelUrl
            });
        // }
    }

    /**
     * @function renderGroupModal
     * @description This method is used to render group modal.
     */
    renderGroupModal = () => {
        const {groups} = this.state;
        const sessionAttended = groups.filter(group => group?.attendanceCount > 0);
        const joinedGroup = groups.filter(group => group?.joinedGroup === true);
        return (
            <ScrollView>
                <View style={styles.sectionWrapper}>
                    <Image
                        style={[styles.sectionIcon]}
                        source={require("../../assets/images/revamp_groupSessions.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.sectionMainText}>Groups</Text>
                    <Text style={[styles.sectionSubText, {marginBottom: 40}]}>Here is a run down of the group
                        sessions that are a part of your plan. </Text>
                </View>

                <View style={styles.botListing}>
                    {sessionAttended?.length < 1 ?
                        <View style={{ paddingLeft: 24 }}>
                            <Text style={styles.completeHead}>Sessions attended</Text>
                            <Text style={styles.emptyTextStyle}>No group sessions completed this week.</Text>
                        </View>
                        :
                        <View>
                            <View style={styles.headerWrapper}>
                                <Text style={styles.statusHeader}>Sessions attended</Text>
                                <Text style={styles.chatbotCount}>{sessionAttended?.length} group</Text>
                            </View>
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalCardList}
                                horizontal
                                ref={ref => {
                                    this.scrollView = ref;
                                }}>
                                {sessionAttended?.map(session => {
                                    return (
                                        <TouchableOpacity
                                            onPress={()=>{
                                                this.viewGroup(session)
                                            }}>
                                            <CompletedGroupItem
                                                // tokenText={`${session?.tokenEarned} tokens earned`}
                                                mainTitle={session?.name}
                                                // sessionTime={"Every Monday  at 7pm"}
                                                // btnText={"Add to calendar"}
                                           />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    }

                    {joinedGroup?.length > 0 && (
                        <View>
                            <View style={styles.headerWrapper}>
                                <Text style={styles.statusHeader}>Groups joined</Text>
                                <Text style={styles.chatbotCount}>{joinedGroup?.length} group</Text>
                            </View>
                            <ScrollView
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalCardList}
                                horizontal
                                ref={ref => {
                                    this.scrollView = ref;
                                }}>
                                {joinedGroup?.map(group => {
                                    return (
                                        <TouchableOpacity
                                            onPress={()=>{
                                                this.viewGroup(group)
                                            }}>
                                            <SingleGroupItem
                                                mainTitle={group?.name}
                                                groupImage={group.groupImage ? group.groupImage : null}
                                                statusType={"Public"}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                </View>
            </ScrollView>
        );
    };

    renderAppointments = (appointments, status) => {
        if (appointments.length > 0) {
            return (
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalCardList}
                    horizontal
                    ref={ref => {
                        this.scrollView = ref;
                    }}>
                    {
                        appointments.map(appointment => {
                            return (
                                <CompletedGroupItem
                                    // tokenText={"3 tokens earned"}
                                    mainTitle={appointment.serviceName}
                                    // btnText={status === 'completed' && "Schedule again"}
                                    appointment={appointment}
                                    scheduleTime={status === 'scheduled' && "Scheduled on June 20, 3pm"}
                                />)
                        })}
                </ScrollView>
            );
        } else {
            return (<Text style={{...styles.completeSub, paddingLeft: 24 }}>No appointments {status.toLowerCase()} this week.</Text>);
        }

    }


    /**
     * @function renderAppointmentModal
     * @description This method is used to render appointment modal.
     */
    renderAppointmentModal = () => {
        const {appointments} = this.state;
        const completedAppointments = appointments.length > 0
            ? appointments.filter(appointment => appointment.status === APPOINTMENT_STATUS.FULFILLED)
            : []
        const scheduledAppointments = appointments.length > 0
            ? appointments.filter(appointment => appointment.status === APPOINTMENT_STATUS.BOOKED)
            : []
        return (
            <ScrollView>
                <View style={styles.sectionWrapper}>
                    <Image
                        style={[styles.sectionIcon]}
                        source={require("../../assets/images/revamp_appointments.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.sectionMainText}>Appointments</Text>
                    <Text style={[styles.sectionSubText, {marginBottom: 40}]}>
                        Here is an overview of your appointment history from the week. </Text>
                </View>
                <View style={styles.botListing}>

                    <View style={styles.headWrapper}>

                        <Text style={styles.completeHead}>Completed</Text>

                        {completedAppointments.length > 0 &&
                            <Text style={styles.countHead}>{ `${completedAppointments.length} appointment${completedAppointments.length>1? 's' : ''} `} </Text>}
                    </View>


                    {this.renderAppointments(completedAppointments, 'completed')}

                    <View style={styles.headWrapper}>
                        <Text style={styles.completeHead}>Scheduled</Text>

                        {scheduledAppointments.length > 0
                            && <Text style={styles.countHead}>{scheduledAppointments.length} appointments</Text>}

                    </View>

                    {this.renderAppointments(completedAppointments, 'scheduled')}
                </View>
                {appointments?.length === 0 &&
                    <View style={styles.btnWrapper}>
                        <PrimaryButton
                            iconName={"calendar"}
                            type={"Feather"}
                            color={Colors.colors.whiteColor}
                            text={"Schedule"}
                            onPress={()=>{
                                this.closeModal("appointmentDrawer", "appointmentDrawer");
                                this.setState({bookModalVisible: true});

                            }}
                        />
                    </View>
                }

            </ScrollView>
        );
    };


    /**
     * @function renderActivitiesModal
     * @description This method is used to render activities modal
     */
    renderActivitiesModal = () => {
        const {currentIndex, bookModalVisible} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        const activities = revampSundayCheckIn.activity

        // let currentWeek = (moment().startOf("week").isSame(revampSundayCheckIn?.startDateTime, "week")
        //     && revampSundayCheckIn?.sundayCheckInStatus === "IN_PROGRESS")

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionWrapper}>
                    <Image
                        style={[styles.sectionIcon]}
                        source={require("../../assets/images/revamp_activities.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.sectionMainText}>Activities</Text>
                    <Text style={[styles.sectionSubText, {marginBottom: 40}]}>Tracking activities can motivate steady
                        progress toward your reward.</Text>
                </View>
                <View style={styles.barWrapper}>
                    <View style={{backgroundColor: Colors.colors.mediumContrastBG, borderRadius: 8}}>
                        <ProgressBarAnimated
                            style={{width: "100%"}}
                            borderWidth={0}
                            width={windowWidth - 80}
                            value={activities?.overallStats?.completedCount * 10}
                            height={10}
                            backgroundColor={Colors.colors.successText}
                            backgroundColorOnComplete={Colors.colors.successIcon}
                            borderRadius={8}
                        />
                    </View>
                    <View style={styles.barText}>
                        <Text style={styles.barProgressText}>{activities?.overallStats?.completedCount} completed
                            of {activities?.overallStats?.totalCount} scheduled</Text>
                        <Text style={styles.barProgressText}>70%</Text>
                    </View>
                </View>
                {/*{!currentWeek && <IdeaItem/>}*/}
                <View style={{...styles.botListing, paddingHorizontal: 24}}>
                    <View style={styles.progressRow}>
                        <View style={styles.activityProgressWrapper}>
                            <View style={styles.activityProgressBarWrapper}>
                                <AnimatedCircularProgress
                                    size={150}
                                    width={8}
                                    fill={activities?.towardsGoal?.completedCount * 10}
                                    lineCap={"round"}
                                    rotation={0}
                                    tintColor={Colors.colors.successText}
                                    backgroundColor={Colors.colors.highContrastBG}/>
                            </View>
                            <View style={styles.activityProgressTextWrap}>
                                <Text style={styles.progressStatusNum}>
                                    {activities?.towardsGoal?.totalCount}/{activities?.towardsGoal?.completedCount}
                                </Text>
                                <Text style={styles.progressStatusText}>Towards goal</Text>
                            </View>
                        </View>
                        <View style={styles.activityProgressWrapper}>
                            <View style={styles.activityProgressBarWrapper}>
                                <AnimatedCircularProgress
                                    size={150}
                                    width={8}
                                    fill={activities?.aligned?.completedCount * 10}
                                    lineCap={"round"}
                                    rotation={0}
                                    tintColor={Colors.colors.secondaryText}
                                    backgroundColor={Colors.colors.highContrastBG}/>
                            </View>
                            <View style={styles.activityProgressTextWrap}>
                                <Text
                                    style={[styles.progressStatusNum, {color: Colors.colors.secondaryText}]}>
                                    {activities?.aligned?.totalCount}/{activities?.aligned?.completedCount}
                                </Text>
                                <Text style={styles.progressStatusText}>Aligned</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        {activities
                            && activities?.activityCheckIns?.length > 0
                            && activities?.activityCheckIns.map(activityCheckIn => {
                                return (
                                    <SingleActivityItem
                                        pleasureColor={activityCheckIn?.pleasure > 5 ? Colors.colors.successIcon : Colors.colors.secondaryText}
                                        pleasureBG={activityCheckIn?.pleasure > 5 ? Colors.colors.successBG : Colors.colors.secondaryColorBG}
                                        activityImg={{uri: activityCheckIn?.activity?.icon && S3_BUCKET_LINK + activityCheckIn?.activity?.icon}}
                                        activityTitle={activityCheckIn?.activity?.name}
                                        activityTime={"Checked in " + moment(activityCheckIn?.checkInDate).format('MMMM d')}
                                        aligned={activityCheckIn?.aligned === 'POSITIVE' ? true : activityCheckIn?.aligned === 'NEGATIVE' ? false : null}
                                        pleasure = {activityCheckIn?.pleasure ? activityCheckIn?.pleasure : null}
                                    />)
                            })}
                    </View>
                </View>
            </ScrollView>
        );
    };

    getAllWeekData = (sundayCheckIn, weeklyOutcomes) => {
        let dots = [];
        weeklyOutcomes = weeklyOutcomes?.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

        for (let index = 0; index < 12; index++) {
            dots.push(<BMSingleDot
                dotColor={weeklyOutcomes[index] && weeklyOutcomes[index]?.weeklyOutcome
                    ? MIND_AND_BODY_WEEKLY_STATUS[weeklyOutcomes[index].weeklyOutcome].value
                    : Colors.colors.neutral50Icon}
                inProgress={weeklyOutcomes[index] && weeklyOutcomes[index]?.endDateTime
                    ? sundayCheckIn.startDateTime === weeklyOutcomes[index]?.startDateTime
                    && sundayCheckIn.endDateTime === weeklyOutcomes[index]?.endDateTime
                    : false}
            />)
        }
        return dots;
    }
    /**
     * @function renderMindAndBodyModal
     * @description This method is used to render mind & body modal
     */
    renderMindAndBodyModal = () => {
        const {currentIndex,} = this.state;
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        const revampSundayCheckIn = revampSundayCheckInsList[currentIndex];
        let currentWeek = (moment().startOf("week").isSame(revampSundayCheckIn?.startDateTime, "week")
            && revampSundayCheckIn?.sundayCheckInStatus === "IN_PROGRESS")
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionWrapper}>
                    <Image
                        style={[styles.sectionIcon]}
                        source={require("../../assets/images/brain-icon.png")}
                        resizeMode={"contain"}/>
                    <Text style={styles.sectionMainText}>Mind & body</Text>
                    <Text style={[styles.sectionSubText, {marginBottom: 40}]}>We are here to help you change
                        {"\n"}your quality of life for the better.</Text>
                </View>
                {!currentWeek && <IdeaItem/>}
                <View style={{...styles.botListing, paddingHorizontal: 24}}>
                    {revampSundayCheckIn.mindAndBody.questionsAnswers.map(question => {
                            return (
                                <View style={styles.singleBMItem}>
                                    <SingleMindBodyItem
                                        itemName={question.keyword}
                                        itemStatus={MIND_AND_BODY_STATUS[question?.currentWeekOutcome].key}
                                        itemImg={MIND_AND_BODY_STATUS[question?.currentWeekOutcome].value}
                                    />
                                    <View style={styles.dotRow}>
                                        {this.getAllWeekData(
                                            revampSundayCheckIn,
                                            question.weeklyOutcomes)}
                                    </View>
                                </View>
                            );
                        }
                    )}
                </View>
            </ScrollView>
        );
    };


    /**
     * @function renderPageMainModal
     * @description This method is used to render page main modal
     */
    renderPageMainModal = () => {
        const {modalDetails} = this.state;
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                style={{
                    ...CommonStyles.styles.commonModalWrapper,
                    height: modalDetails?.maxHeight || "auto",
                    // position: "absolute",
                    overflow: "hidden",
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                }}
                isOpen={this.state.openModal}
                onClosed={() => {
                    this.setState({openModal: false, modalDetails: null, modalType: ""});
                }}

                entry={"bottom"}
                position={"bottom"}
                ref={this.state.modalDetails?.ref}
                swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}/>
                {modalDetails?.method()}
            </Modal>
        );
    };

    navigateToProviders = () => {
        if(this.props.profile.patient.isPatientProhibitive){
            this.navigateToProhibitiveScreen()
        }
        else {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                isProviderFlow: true,
            });
        }
    };

    navigateToServices = () => {
        if(this.props.profile.patient.isPatientProhibitive){
            this.navigateToProhibitiveScreen()
        }else {
            this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
                isProviderFlow: false,
            });
        }
    };

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if (this.state.isLoading) {
            return <Loader/>;
        }
        return (<Container>
            <StatusBar
                backgroundColor="transparent"
                barStyle="dark-content"
                translucent
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient
                    start={{x: 0, y: 0.75}}
                    end={{x: 1, y: 0.25}}
                    colors={["#0374DD", "#DD0374"]}
                    style={styles.homeMainBg}>
                    {this.renderHeader()}
                    <View style={styles.homeTopTextWrap}>
                        <Text uppercase style={[styles.mainTitle, {textAlign: "center"}]}>Current Reward</Text>
                        <Text style={styles.homeSubTitle}> {this.props.revamp.revampContext?.reward?.name}</Text>
                    </View>
                </LinearGradient>
                <View style={{...styles.planContentWrapper, backgroundColor: Colors.colors.screenBG}}>
                    {this.renderWeekSliderSection()}
                    {this.renderDescriptionSection()}
                    {this.renderCurrentRewardSection()}
                    {this.renderRevampListSection()}
                </View>
            </ScrollView>
            {this.renderPageMainModal()}
            <BookAppointmentModal
                visible={this.state.bookModalVisible}
                onClose={()=>{
                    this.setState({bookModalVisible: false});
                }}
                navigateToProviders={this.navigateToProviders}
                navigateToServices={this.navigateToServices}
            />
        </Container>);
    }
}

const styles = StyleSheet.create({
    progressHeader: {
        paddingLeft: 24,
        paddingRight: 18,
        elevation: 0,
        paddingTop: 15,
        height: HEADER_SIZE,
    },
    backButton: {
        width: 40,
    },
    homeMainBg: {
        minHeight: 306
    },
    homeTopTextWrap: {
        alignItems: "center",
    },
    mainTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.whiteColor,
        marginBottom: 8,
        marginTop: 12,
    },
    homeSubTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.whiteColor,
        textAlign: "center",
        paddingHorizontal: 50,
        marginBottom: 65
    },
    planContentWrapper: {
        ...CommonStyles.styles.shadowBox,
        // borderTopRightRadius: 24,
        // borderTopLeftRadius: 24,
        padding: 24,
        marginTop: -25,
    },
    infoMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 24,
    },
    infoSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.highContrast,
    },
    weeklySliderWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    sliderLeftWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    sliderCenterWrapper: {
        // flex:2,
    },
    sliderCenterText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
    },
    sliderRightWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    seeAllBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 28,
        paddingTop: 0,
        paddingBottom: 0,
    },
    descriptionWrapper: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        marginTop: 16,
    },
    descriptionIcon: {
        marginBottom: 16,
        width: 64,
        height: 64,
    },
    descriptionText: {
        paddingHorizontal: 24,
        textAlign: "center",
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
    pinkText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mainPink,
    },
    currentRewardWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexGrow: 1
    },
    currentRewardBox: {
        textAlign: "center",
        flex: 1,
        // width: '45%',
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 32,
        borderRadius: 12,
        ...CommonStyles.styles.shadowBox,
    },
    currentRewardTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.mainPink,
        marginBottom: 8,
    },
    currentRewardDesc: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    revampItemsWrapper: {
        marginBottom: 80,
    },
    revampItemBox: {
        flexDirection: "row",
        textAlign: "center",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
        borderRadius: 12,
        marginBottom: 8,
        ...CommonStyles.styles.shadowBox,
    },
    revampItemTextWrapper: {
        paddingRight: 16,
    },
    revampItemTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.highContrast,
        marginBottom: 4,
    },
    revampItemDesc: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    RevampItemIcon: {
        width: 60,
        height: 60,
    },
    revampProgressWrapper: {
        flexDirection: "row",
        textAlign: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
        borderRadius: 12,
        marginBottom: 17,
        ...CommonStyles.styles.shadowBox,
    },
    revampProgressBarWrapper: {
        paddingRight: 24,
    },
    revampProgressDescWrapper: {
        paddingRight: 16,
        paddingVertical: 24,
        marginBottom: 17,
        flex: 1
    },
    revampProgressDescText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    sectionWrapper: {
        padding: 24,
        paddingTop: 48,
        alignItems: "center",
    },
    sectionIcon: {
        marginTop: 12,
        marginBottom: 32,
    },
    sectionMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    },
    sectionSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 32,
        textAlign: "center",
    },
    barWrapper: {
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    barText: {
        flexDirection: "row",
        paddingTop: 8,
        justifyContent: "space-between",
        width: "100%",
        // paddingHorizontal: 16
    },
    barProgressText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        maxWidth: "80%",
        textAlign: "right",
    },
    planListing: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 80,
        backgroundColor: Colors.colors.screenBG,
    },
    singlePlan: {
        ...CommonStyles.styles.shadowBox,
        backgroundColor: Colors.colors.whiteColor,
        borderRadius: 12,
        padding: 24,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
    },
    greenBorder: {
        position: "absolute",
        backgroundColor: Colors.colors.successText,
        width: 4,
        height: 40,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,
        left: -4,
    },
    singleMainText: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
    },
    singleSubText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
    },
    btnWrapper: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        backgroundColor: Colors.colors.screenBG
    },
    botListing: {
        paddingTop: 40,
        paddingBottom: 80,
        backgroundColor: Colors.colors.screenBG,
    },
    headWrapper: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    completeHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 8,
        textAlign: 'left'
    },
    countHead: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        lineHeight: 19.5,
        ...TextStyles.mediaTexts.manropeMedium,
        marginBottom: 8,
        textAlign: 'right'
    },
    completeSub: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeRegular,
        marginBottom: 32,
    },
    headerWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 24,
        justifyContent: "space-between",
        paddingHorizontal: 24
    },
    statusHeader: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
    },
    chatbotCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    horizontalCardList: {
        paddingLeft: 24,
        paddingRight: 16,
        marginBottom: 24,
    },
    progressRow: {
        marginBottom: 42,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    activityProgressWrapper: {
        width: 150,
        height: 150,
        position: "relative",
    },
    activityProgressBarWrapper: {},
    activityProgressTextWrap: {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 7,
        left: 7,
        width: 136,
        height: 136,
        backgroundColor: Colors.colors.whiteColor,
        borderRadius: 70,
    },
    progressStatusNum: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.subTextL,
        ...TextStyles.mediaTexts.manropeBold,
    },
    progressStatusText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    singleBMItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        justifyContent: "center",
        marginBottom: 16,
    },
    dotRow: {
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    progressCenterText: {
        color: Colors.colors.mainPink,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        position: "absolute",
        alignItems: "center",
        flex: 1,
        top: 25,
    },
    roundProgressBar: {
        alignItems: "center",
        paddingBottom: 24,
    },
    emptyTextStyle: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        // paddingLeft: 24
    }
});
export default connectConnections()(RevampProgressReportScreen);
