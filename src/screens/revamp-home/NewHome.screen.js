import React, {Component} from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";
import {Container, Content, Text, View} from "native-base";
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    CONNECTION_TYPES,
    ContentfulClient,
    PrimaryButton,
    SecondaryButton,
    TextStyles
} from "ch-mobile-shared";
import {connectConnections} from "../../redux";
import GenericListItem from "../../components/revamp-home/GenericListItem";
import GenericViewAllCard from "../../components/revamp-home/GenericViewAllCard";
import LinearGradient from "react-native-linear-gradient";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import AntIcon from "react-native-vector-icons/AntDesign";
import {AirbnbRating} from "react-native-elements";
import {getAvatar} from "ch-mobile-shared/src/utilities";
import {Screens} from "../../constants/Screens";
import ProfileService from "../../services/Profile.service";
import AppointmentService from "../../services/Appointment.service";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import ScheduleService from "../../services/ScheduleService";
import Loader from "../../components/Loader";
import FeatherIcon from "react-native-vector-icons/Feather";
import {PlanItemModal} from "../../components/revamp-home/PlanItemModal";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import BranchOverlay from "../../components/BranchOverlay";
import ConversationService from "../../services/Conversation.service";

const windowWidth = Dimensions.get('window').width;

class NewHomeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.totalCount = 0;
        this.fetchCount = 0;
        this.state = {
            isLoading: true,
            servicesCount: 0,
            providersCount: 0,
            message: "",
            supportEmail: "",
            providers: [],
            services: [],
            chatBots: [],
            groups: [],
            articles: [],
            openModal: false
        };
    }

     componentDidMount(): void {
         this.props.fetchRevampSundayCheckin();
        if (!this.props?.connections?.isLoading && !this.props?.appointments?.isLoading) {
            this.getAllRequiredData();
            this.reference = this.props.navigation.addListener(
              "willFocus",
              payload => {
                  this.getAllRequiredData();
              },
            );
        }

    }

    componentWillUnmount = () => {
        if (this.reference) {
            this.reference.remove();
        }
    };


    /**
     * @function getAllRequiredData
     * @description This method is used to get All required Data for screen
     */
    getAllRequiredData = async () => {
        await this.getAllProviders();
        await this.getServices();
        await this.getChatBot();
        await this.getArticles();
        await this.getAllGroup();
        await this.getCategoryItems();
    }

    /**
     * @function getCompletedPlanItemsCount
     * @description This method is used to get Completed plan items count
     */
    getCompletedPlanItemsCount = () => {
        let completed = 0;
        let revampContextDetails = this.props.revamp.revampContext;
        revampContextDetails && revampContextDetails?.plan?.planItemsContexts.map(context => {
            if (context.status === 'COMPLETED') {
                completed = completed + 1;
            }
        })
        return {
            total: revampContextDetails?.plan?.planItemsContexts?.length,
            completed
        }
    }

    renderPlanItemProgress = ()=>{
        const progress = this.getCompletedPlanItemsCount();
        if(progress?.total) {
            return (

                <TouchableOpacity
                    onPress={() => {
                        this.navigateToSeeAllPriorities(true)
                    }}
                    style={{ marginLeft: 16 }}>
                    <LinearGradient
                        start={{x: 0, y: 0.75}}
                        end={{x: 1, y: 0.25}}
                        colors={["#0F8D83", "#136A8A"]}
                        style={styles.homeMainBannerCard}>
                        <View style={styles.roundWrapper}>
                            <AnimatedCircularProgress
                                size={80}
                                width={8}
                                fill={progress?.completed / progress?.total * 100}
                                rotation={0}
                                lineCap={'round'}
                                tintColor="white"
                                backgroundColor="rgba(234, 241, 245, 0.2)"
                            />
                            <Text style={styles.centerText}>{progress.completed + "/" + progress.total}</Text>
                        </View>
                        <Text numberOfLines={1} style={styles.shortText}>your plan</Text>
                        <Text numberOfLines={2} style={styles.mainTitleText}>
                            Your curated plan to reach your reward
                        </Text>
                        <SecondaryButton
                            textColor={Colors.colors.whiteColor}
                            text="See full plan"
                            size={12}
                            bgColor={Colors.colors.white04}
                            borderColor={"transparent"}
                            onPress={() => {
                                this.navigateToSeeAllPriorities(true)
                            }}
                        />
                    </LinearGradient>
                </TouchableOpacity>
            )
        }
    }

    getProgress= () =>{
        const revampSundayCheckInsList = this.props.revamp.revampSundayCheckInsList;
        let progress = 0;
        if (revampSundayCheckInsList?.length > 0){
            if (revampSundayCheckInsList[0].progress?.rewardProgress >= 1) {
                 progress = revampSundayCheckInsList[0].progress?.rewardProgress;
            } else {
                if (revampSundayCheckInsList.some(checkIn => checkIn.progress?.rewardProgress >= 1)){
                    progress = revampSundayCheckInsList.find(checkIn => checkIn.progress?.rewardProgress >=1).progress?.rewardProgress
                }
            }
        }
        return progress;
    }

    /**
     * @function renderTopBanners
     * @description This method is used to render top banners in the screen
     */
    renderTopBanners = () => {
        let completedCount = 0;
        let completedCountText = 0;
        if (this.props.revamp.revampSundayCheckIn){
            if (this.props.revamp.revampSundayCheckIn?.progress?.status === "COMPLETED"){
                completedCount+=33;
                completedCountText+=1;
            }
            if (this.props.revamp.revampSundayCheckIn?.mindAndBody?.status === "COMPLETED"){
                completedCount+=33;
                completedCountText+=1;
            }
            if (this.props.revamp.revampSundayCheckIn?.plan?.status === "COMPLETED"){
                completedCount+=1;
                completedCountText+=1;
            }
        }
            return (
                <View style={styles.homeMainBanner}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        style={{ alignSelf: 'center'}}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                            {completedCountText < 3 && this.props.revamp?.revampSundayCheckIn?.sundayCheckInStatus !== 'COMPLETED' &&
                            (<TouchableOpacity
                                    onPress={() => {
                                        this.createSundayCheckIn()
                                    }}
                                >
                                    <LinearGradient
                                        start={{ x: 0, y: 0.75 }}
                                        end={{ x: 1, y: 0.25 }}
                                        colors={["#516395", "#614385"]}
                                        style={styles.homeMainBannerCard}>
                                        <View style={styles.roundWrapper}>
                                            <AnimatedCircularProgress
                                                size={80}
                                                width={8}
                                                fill={completedCount}
                                                rotation={0}
                                                lineCap={'round'}
                                                tintColor="white"
                                                onAnimationComplete={() =>{
                                                    // console.log("onAnimationComplete")
                                                }}
                                                backgroundColor="rgba(234, 241, 245, 0.2)"
                                            />
                                            <Text style={styles.centerText}>{completedCountText}/3</Text>
                                        </View>
                                        <Text numberOfLines={1} style={styles.shortText}>Sunday check-in</Text>
                                        <Text numberOfLines={2} style={styles.mainTitleText}>
                                            Track progress, earn rewards
                                        </Text>
                                        <SecondaryButton
                                            onPress={()=> this.createSundayCheckIn()}
                                            textColor={Colors.colors.whiteColor}
                                            text="Check-in now"
                                            size={12}
                                            bgColor={Colors.colors.white04}
                                            borderColor={"transparent"}
                                        />
                                    </LinearGradient>
                                </TouchableOpacity>
                            )
                            }
                            <TouchableOpacity
                                onPress={() => {
                                    this.navigateToRevampProgressReport()
                                }}
                            >
                                <LinearGradient
                                    start={{x: 0, y: 0.75}}
                                    end={{x: 1, y: 0.25}}
                                    colors={["#0374DD", "#DD0374"]}
                                    style={{...styles.homeMainBannerCard, marginRight: 0}}>
                                    <View style={styles.roundWrapper}>
                                        <AnimatedCircularProgress
                                            size={80}
                                            width={8}
                                            fill={this.getProgress()}
                                            rotation={0}
                                            lineCap={'round'}
                                            tintColor="white"
                                            backgroundColor="rgba(234, 241, 245, 0.2)"
                                        />
                                        <Text style={styles.centerText}>{this.getProgress()}%</Text>
                                    </View>
                                    <Text numberOfLines={1} style={styles.shortText}>your Current reward</Text>
                                    <Text numberOfLines={2} style={styles.mainTitleText}>
                                        {this.props.revamp.revampContext?.reward?.name}
                                    </Text>
                                    <SecondaryButton
                                        onPress={() => {
                                            this.navigateToRevampProgressReport()
                                        }}
                                        textColor={Colors.colors.whiteColor}
                                        text="See Progress"
                                        size={12}
                                        bgColor={Colors.colors.white04}
                                        borderColor={"transparent"}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>
                            {this.renderPlanItemProgress()}
                    </ScrollView>
                </View>
            )
    }

    /**
     * @function getItemColorByStatus
     * @description This method is used to get item color by status
     */
    getItemColorByStatus = (revampContext) => {
        switch (revampContext.status) {
            case 'IN_PROGRESS':
                return Colors.colors.mainBlue;
            case 'SCHEDULED':
                return Colors.colors.warningIcon;
            case 'NOT_STARTED':
                return Colors.colors.highContrast;
            case 'COMPLETED':
                return Colors.colors.successIcon;
            default :
                return Colors.colors.highContrast

        }
    }

    /**
     * @function renderCard
     * @description This method is used to render Your Priority card
     */
    renderCard = (revampContext) => {
        return (
            <GenericListItem
                iconType={"FeatherIcon"}
                iconName={"more-horizontal"}
                headingText={revampContext.status}
                headingSubText={revampContext.planItem?.planToken ? '+' + revampContext.planItem?.planToken + (revampContext.planItem?.planToken > 1 ? ' Tokens' : ' Token') : null}
                mainText={revampContext?.planItem?.name}
                itemColor={this.getItemColorByStatus(revampContext)}
                shapeColor={this.getItemColorByStatus(revampContext)}
                performAction={() => {
                    this.openModal(revampContext)
                }}
                navigateToScreen={() => {
                    this.setState({selectedPlanItem: revampContext}, () => {
                        this.getRespectiveScreen(revampContext?.planItem?.type)?.method();
                    })
                }}
            />
        );
    };

    /**
     * @function renderYourPriorities
     * @description This method is used to render Your Priorities list
     */
    renderYourPriorities = () => {
        let revampContextDetails = this.props.revamp.revampContext;
        revampContextDetails = revampContextDetails?.plan?.planItemsContexts.filter(context => context.priority === true).slice(0, 3);
        return (
            <View style={styles.planContent}>
                {revampContextDetails && revampContextDetails.map(context => {
                    return this.renderCard(context)
                })}
            </View>
        )
    }

    /**
     * @function hasPriorityItems
     * @description This method is used to get Boolean value for Priority items
     */
    hasPriorityItems = () => {
        const revampContextDetails = this.props.revamp.revampContext;
        if (revampContextDetails) {
            return revampContextDetails?.plan?.planItemsContexts?.filter(context => context.priority === true)?.length > 0;
        }
        return false;
    }

    /**
     * @function renderPrioritiesSection
     * @description This method is used to render Priorities section
     */
    renderPrioritiesSection = () => {
        const revampContextDetails = this.props.revamp.revampContext;
        if (revampContextDetails?.plan?.planItemsContexts.length > 0) {
            return (
                <View style={{...styles.headingSectionMain, marginTop: 40, marginBottom: 30}}>
                    {this.renderSeeAllSection("YOUR_PRIORITIES")}
                    {this.hasPriorityItems() ?
                        <View style={styles.contentList}>
                            {this.renderYourPriorities()}
                        </View>
                        :
                        this.renderEmptyPriorities()
                    }
                </View>
            )
        }
    }

    /**
     * @function openModal
     * @description This method is used to open modal
     */
    openModal = (selectedPlanItem) => {
        this.setState({selectedPlanItem: selectedPlanItem, openModal: true})
    }

    /**
     * @function closeModal
     * @description This method is used to close modal
     */
    closeModal = () => {
        this.setState({selectedPlanItem: null, openModal: false})
    }

    /**
     * @function removePlanItem
     * @description This method is used to remove plan item
     */
    removePlanItem = () => {
        let {selectedPlanItem} = this.state;
        let revampContextDetails = this.props.revamp.revampContext;
        revampContextDetails?.plan?.planItemsContexts.splice(selectedPlanItem.index, 1);
        this.setState({revampContextDetails}, () => {
            this.props.updateRevampContext(revampContextDetails);
        })
    }

    /**
     * @function addOrRemoveFromPriorities
     * @description This method is update priority status of plan item
     */
    addOrRemoveFromPriorities = () => {
        let {selectedPlanItem} = this.state;
        let revampContextDetails = this.props.revamp.revampContext;
        revampContextDetails?.plan?.planItemsContexts.map((planItemContext) => {
            if (planItemContext?.planItem?.id === selectedPlanItem?.planItem?.id) {
                planItemContext.priority = !planItemContext.priority;
            }
        });
        this.props.updateRevampContext(revampContextDetails);
    }

    /**
     * @function getConnectionDetail
     * @description This method is used to get Connection Detail
     */
    getConnectionDetail = (connectionId) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0] ? connection[0] : null;
    };

    /**
     * @function getProviderInfo
     * @description This method is used to get provider Profile.
     */
    getProviderInfo = async (userId) => {
        const provider = await ProfileService.getProviderProfile(userId);
        if (provider.errors) {
            console.warn(provider.errors[0].endUserMessage);
        } else {
            return provider;
        }
    };

    /**
     * @function navigatesToServicesScreen
     * @description This method is used to navigate to services screen
     */
    navigatesToServicesScreen = () => {
        const {selectedPlanItem} = this.state;
        if (selectedPlanItem?.planItem?.referenceId) {
            const {services} = this.state;
            const connection = services.find(service => service.id === selectedPlanItem?.planItem.referenceId);
            if (connection) {
                this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN, {
                    selectedItem: {
                        service: connection, providers: connection.providers.filter(Boolean), isProviderFlow: false
                    }
                });
            } else {
                this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
                    isProviderFlow: false
                });
            }
        } else {
            this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
                isProviderFlow: false
            });
        }
    }

    /**
     * @function navigatesToProvidersScreen
     * @description This method is used to navigate to providers screen
     */
    navigatesToProvidersScreen = async () => {
        const {selectedPlanItem} = this.state;
        if (selectedPlanItem.planItem?.type === 'PROVIDER_TYPE') {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                isProviderFlow: false,
                selectedFilter: selectedPlanItem?.planItem.referenceId,
            });
        } else {
            if (selectedPlanItem?.planItem?.referenceId) {
                const connection = await this.getProviderInfo(selectedPlanItem?.planItem.referenceId);
                if (connection) {
                    this.viewProviderProfile(connection)
                } else {
                    this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                        isProviderFlow: true
                    });
                }
            } else {
                this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                    isProviderFlow: true
                });
            }
        }
    }

    /**
     * @function navigatesToGroupsScreen
     * @description This method is used to navigate to group screen
     */
    navigatesToGroupsScreen = async () => {
        const {selectedPlanItem} = this.state;
        if (selectedPlanItem?.planItem?.referenceId) {
            let connection = this.getConnectionDetail(selectedPlanItem?.planItem?.referenceId);
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                name: connection?.name,
                profilePicture: connection?.profilePicture,
                channelUrl: selectedPlanItem?.planItem?.referenceId
            });
        } else {
            this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN);
        }
    }

    /**
     * @function navigatesToTopicsScreen
     * @description This method is used to navigate to topic screen
     */
    navigatesToTopicsScreen = async (referenceId) => {
        if(referenceId){
            let query = {
                'content_type': 'topics',
                'sys.id': referenceId
            };

            const response = await ContentfulClient.getEntries(query);

            const item = response.items?.[0].fields

            const category = this.state.categoryItems.filter(cat => cat.categoryTopics.find(top => top.sys.id === referenceId))

            this.props.navigation.navigate(Screens.TOPIC_CONTENT_LIST_SCREEN, {
                topicName: item.name,
                topicDescription: item.description,
                topicImage: item.coverImage,
                topicIcon: item.icon,
                educationOrder:item.educationOrder,
                category: category?.[0],
                topicSlug: item.slug,
                getMetaForSingleArticle: this.getMetaForSingleArticle
            });
        }else{
            this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN);
        }
    }
    getMetaForSingleArticle = (entryId)=>{
        const articles = [];
        this.state.categoryItems.forEach(category=>{
            const {categorySlug, categoryName} = category;
            category.categoryTopics.forEach(topic=>{
                if(topic.fields && topic.fields.educationOrder) {
                    const {slug: topicSlug, name} = topic.fields;
                    topic.fields.educationOrder.forEach(article=>{
                        if(article.fields) {
                            articles.push({
                                entryId: article.sys.id, topic: {topicSlug, name}, category: {categorySlug, categoryName}
                            })
                        }
                    })
                }
            })
        });
        return articles.find(article=>article.entryId===entryId);
    }

    /**
     * @function navigateToArticleScreen
     * @description This method is used to navigate to article screen
     */
    navigateToArticleScreen = () => {
        const {selectedPlanItem} = this.state;
        if (selectedPlanItem?.planItem?.referenceId) {
            this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
                contentSlug: selectedPlanItem?.planItem.referenceId, category: '', topic: ''
            });
        } else {
            this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN);
        }
    };

    /**
     * @function navigateToCHatBots
     * @description This method is used to navigate to select chatBots.
     */
    navigateToChatBotsScreen = () => {
        const {selectedPlanItem} = this.state;
        if (selectedPlanItem?.planItem?.referenceId) {
            const connection = this.props.connections.chatbotList.find(chatbot => chatbot.id === selectedPlanItem?.planItem.referenceId);
            if (connection) {
                this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {contact: connection});
            } else {
                this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
            }
        } else {
            this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
        }
    };


    /**
     * @function getRespectiveScreen
     * @description This method is used to get Respective screen
     */
    getRespectiveScreen = (type) => {
        const {selectedPlanItem} = this.state;
        const hasReference = selectedPlanItem?.planItem?.referenceId
        switch (type) {
            case 'SERVICE':
                return {
                    title: `Service ${hasReference ? '' : 's'}`,
                    method: () => this.navigatesToServicesScreen()
                };
            case 'PROVIDER':
                return {
                    title: `Provider ${hasReference ? '' : 's'}`,
                    method: () => this.navigatesToProvidersScreen()
                };
            case 'GROUP':
                return {
                    title: `Group${hasReference ? '' : 's'}`,
                    method: () => this.navigatesToGroupsScreen()
                };
            case 'TOPIC':
                return {
                    title: `Topic${hasReference ? '' : 's'}`,
                    method: () => this.navigatesToTopicsScreen(hasReference)
                };
            case 'EDUCATION':
                return {
                    title: `Education Content${hasReference ? '' : 's'}`,
                    method: () => this.navigateToArticleScreen()
                };
            case 'ACTIVITY':
                return {
                    title: `${hasReference ? 'Activity' : 'Activities'}`,
                    method: () => this.navigateToActivities()
                };
            case 'CONVERSATION':
                return {
                    title: `Conversation${hasReference ? '' : 's'}`,
                    method: () => this.navigateToChatBotsScreen()
                };
            case 'PROVIDER_TYPE':
                return {
                    title: `Provider${hasReference ? '' : 's'}`,
                    method: () => this.navigatesToProvidersScreen()
                };
            default :
                return null

        }

    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
        const {selectedPlanItem, openModal} = this.state;
        const screenDetails = this.getRespectiveScreen(selectedPlanItem?.planItem?.type)
        return (
            <PlanItemModal
                openModal={openModal}
                selectedPlanItem={selectedPlanItem}
                screenDetails={screenDetails}
                removePlanItem={this.removePlanItem}
                addOrRemoveFromPriorities={this.addOrRemoveFromPriorities}
                closeModal={this.closeModal}
                activeSegmentId={'priority'}
            />
        )
    }

    /**
     * @function getProviders
     * @description This method is used to get providers.
     */
    getAllProviders = async () => {
       this.setState({isLoading: true});
        try {
            let response = this.props?.connections?.eligibleProviders;
            if (response?.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                let activeConnections = this.props.connections.activeConnections;
                const connectedProviderIds = activeConnections.filter(activeConnection => activeConnection.type === CONNECTION_TYPES.PRACTITIONER
                    || activeConnection.type === CONNECTION_TYPES.MATCH_MAKER
                ).map(connection => connection.connectionId);
                let connectedProviders = response?.filter(provider => {
                    const active = connectedProviderIds.find(userId => userId === provider.userId);
                    return !!active;
                });
                let currentAppointment = this.props.appointments.currentAppointments
                connectedProviders = connectedProviders.map(provider => {
                    let providerAppointment = currentAppointment.find(currentAppointment => currentAppointment.participantId === provider.userId)
                    providerAppointment = !!providerAppointment;
                    return {
                        userId: provider.userId,
                        name: provider.name,
                        providerAppointment: providerAppointment,
                        designation: provider.designation,
                        combinedRating: provider.combinedRating,
                        profilePicture: provider.profilePicture,
                    }
                })
                this.setState({providers: connectedProviders, isLoading: false})
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }

    }

    /**
     * @function getServices
     * @description This method is used to get services.
     */
    getServices = async () => {
        this.setState({isLoading: true});
        try {
            const response = this.props?.appointments?.allServices;
            if (response?.errors) {
                AlertUtil.showErrorMessage(response?.errors?.[0]?.endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({services: response, isLoading: false});
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    };

    /**
     * @function getChatBotList
     * @description This method is used to get chat bot list.
     */
    getChatBot = () => {
        this.setState({isLoading: true});
        let chatBotList = this.props?.connections?.chatbotList;
        let activeChatBotConnections = this.props.connections.activeConnections.filter(activeConnection => activeConnection.type === CONNECTION_TYPES.CHAT_BOT);
        activeChatBotConnections = activeChatBotConnections.map(activeChatBotConnections => {
            const records = chatBotList.find(chatBot => chatBot.organizationId === activeChatBotConnections.connectionId);
            return {
                ...activeChatBotConnections,
                assigned: records?.assigned,
                organizationId: records?.organizationId,
                avatar: records?.avatar
            }
        });
        this.setState({chatBots: activeChatBotConnections.filter(Boolean), isLoading: false});
    };

    /**
     * @function getAllGroup
     * @description This method is used to get All Group.
     */
    getAllGroup = async () => {
        this.setState({isLoading: true});
        try {
            let response = this.props?.connections?.allGroups;
            if (response?.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({groups: response,isLoading:false})
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    }

    /**
     * @function getArticles
     * @description This method is used to get articles content.
     */
    getArticles = async () => {
        this.setState({isLoading: true});
        let assignedItems = this.props.educational?.assignedContent?.assignedContent || [];
        assignedItems = assignedItems.map((assignedItem) => {
            return {
                slug: assignedItem.contentSlug
            }
        })
        let favouriteItems = this.props.profile?.bookmarked;
        const contents = [...new Set([...favouriteItems, ...assignedItems])]

        this.setState({contents})
        try {
            let contentList = await Promise.all(contents.map(async (content) => {
                let params = {
                    'content_type': 'educationalContent',
                    'sys.id': content.slug,
                };
                const entries = await ContentfulClient.getEntries(params);
                if (entries && entries.total > 0) {
                    const entry = entries.items[0];
                    return {
                        title: entry.fields?.title,
                        description: entry.fields?.description,
                        entryId: entry.sys?.id,
                        contentDuration: entry.fields?.contentLengthduration,
                        contentAudio: entry.fields?.contentAudio
                            ? entry.fields.contentAudio.fields.file.url
                            : '',
                        titleImage: entry?.fields.titleImage?.fields?.file?.url,
                        bookmarked: true,
                        markedAsCompleted: false,
                        fields: entry.fields,
                        sys: {
                            id: entry.sys.id
                        }
                    }
                }
            }));
            contentList = contentList.filter(content => content != null);
            this.setState({
                articles: contentList,
                isLoading: false
            });
        } catch (error) {
            AlertUtil.showErrorMessage('Unable to get data from contentful');
            this.setState({isLoading: false});
        }
    }

    convertToCategory = async (entries) => {
        const categoryItems = entries.items.map(entry => {
            return {
                categoryName: entry.fields.name,
                categoryImage: entry.fields.displayImage ? entry.fields.displayImage.fields.file.url : "",
                categoryTopics: entry.fields.topics,
                categorySlug: entry.fields.slug,
            };
        });
        await this.calculateMeta(categoryItems);
        if (this.state.categoryItems === null || this.state.categoryItems === undefined) {
            this.setState({ categoryItems });
        } else {
            const tempItem = this.state.categoryItems.concat(categoryItems)
            this.setState({ categoryItems:tempItem });
        }
        this.setState({ isLoading: false });
    };


    getCategoryItems = async () => {
        let finalQuery = {
            content_type: "category",
            skip: 0,
            include: 2,
            limit: 10,
        };
        let entries = await ContentfulClient.getEntries(finalQuery);
        if (entries) {
            await this.convertToCategory(entries);
            this.totalCount = entries?.total;
            this.fetchCount = this.fetchCount + entries?.items?.length;
            while (this.fetchCount <= this.totalCount) {
                finalQuery.skip = finalQuery.limit;
                finalQuery.limit = finalQuery.limit + 10;
                entries = await ContentfulClient.getEntries(finalQuery);
                if (entries) {
                    await this.convertToCategory(entries);
                    this.totalCount = entries?.total;
                    this.fetchCount = this.fetchCount + entries?.items?.length;
                }
            }
        }
    }

    calculateMeta = (categoryItems)=>{

        return new Promise((resolve, reject)=>{
            try {
                const {assignedItems} = this.state;
                if(assignedItems && assignedItems.assignedContent && assignedItems.assignedContent.length>0) {
                    const articles = [];
                    categoryItems.forEach(category=>{
                        const {categorySlug} = category;
                        category.categoryTopics.forEach(topic=>{
                            if(topic.fields && topic.fields.educationOrder) {
                                const {slug: topicSlug} = topic.fields;
                                topic.fields.educationOrder.forEach(article=>{
                                    if(article.fields) {
                                        articles.push({
                                            entryId: article.sys.id, topicSlug, categorySlug
                                        })
                                    }

                                })
                            }

                        })
                    });
                    assignedItems.assignedContent = assignedItems.assignedContent.map(content=>{
                        const sluggedArticle = articles.find(article=>article.entryId===content.contentSlug);
                        return {
                            ...content,
                            ...sluggedArticle
                        }
                    });
                    this.setState({
                        assignedItems
                    });
                }
                resolve();
            } catch (e) {
                reject(e.message);
            }

        });
    };


    /**
     * @function navigateToActivities
     * @description This method is used to navigate to Activities screen.
     */
    navigateToActivities = () => {
        this.props.navigation.navigate(Screens.REVAMP_ALL_ACTIVITIES_SCREEN);
    };

    /**
     * @function navigateToProviders
     * @description This method is used to navigate to select provider screen.
     */
    navigateToProviders = () => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
            isProviderFlow: true,
            isPatientProhibitive:this.props.profile.patient.isPatientProhibitive
        });
    };

    /**
     * @function navigateToServices
     * @description This method is used to navigate to select service by type screen.
     */
    navigateToServices = () => {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
            isProviderFlow: false,
            isPatientProhibitive:this.props.profile.patient.isPatientProhibitive
        })
    };

    /**
     * @function navigateToCHatBots
     * @description This method is used to navigate to select chatBots.
     */
    navigateToChatBots = () => {
        this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
    };

    /**
     * @function navigateToGroups
     * @description This method is used to navigate to group screen.
     */
    navigateToGroups = () => {
        this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN, {
            allGroupsDetails: this.state.groups
        });
    };

    /**
     * @function navigateToArticle
     * @description This method is used to navigate to article screen
     */
    navigateToArticle = () => {
        this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN);
    };

    /**
     * @function viewActivities
     * @description This method is used to view activity
     */
    viewActivities = (selectedActivity) => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_CHECK_IN_ACTIVITY, {
            ...navigation.state.params,
            selectedActivity,
            updateCurrentIndex: ()=>{},
            removeActivityFromAnswers: ()=>{},
            refScreen: 'UserActivities'
        })
    }

    /**
     * @function viewProviderProfile
     * @description This method is used to view provider profile
     */
    viewProviderProfile = selectedProvider => {
        const provider = {
            ...selectedProvider,
            userId: selectedProvider.userId,
            name: selectedProvider.name,
            avatar: selectedProvider.profilePicture,
            type: CONNECTION_TYPES.PRACTITIONER,
            profilePicture: selectedProvider.profilePicture,
            colorCode: !selectedProvider.profilePicture ? selectedProvider.colorCode : null,
        };
        const isPatientProhibitive=this.props.profile.patient.isPatientProhibitive
        const payload = {
            provider: provider, patient: this.props.auth.meta, isPatientProhibitive:isPatientProhibitive
        }
        if (selectedProvider.matchmaker) {
            this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, payload);
        } else {
            this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, payload);
        }
    };


    navigateToProhibitiveScreen = ()=>{
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }
    /**
     * @function viewService
     * @description This method is used to view service
     */
    viewService = (item) => {
        const selectedItem = {
            service: item,
            providers: item.providers.filter(Boolean),
            isSelected: true
        }
        if(this.props.profile.patient.isPatientProhibitive){
            this.navigateToProhibitiveScreen()
        }
        else {
            this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN, {
                ...this.props.navigation.state.params,
                selectedItem,
            });
        }
    }

    /**
     * @function viewChatBot
     * @description This method is used to view chatbot
     */
    viewChatBot = async (item) => {
        this.props.navigation.navigate(Screens.CHAT_INSTANCE, {contact: item});
    }

    /**
     * @function viewGroup
     * @description This method is used to view groups
     */
    viewGroup = (selectedGroup) => {
        if (selectedGroup?.joinedGroup) {
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                    connection: {
                        ...selectedGroup,
                        type: CONNECTION_TYPES.CHAT_GROUP,
                        channelUrl: selectedGroup.channelUrl,
                        connectionId: selectedGroup.channelUrl
                    }
                }
            );
        } else {
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                channelUrl: selectedGroup.channelUrl
            });
        }
    }

    /**
     * @function viewArticles
     * @description This method is used to view articles
     */
    viewArticles = (item, contentSlug) => {
        const {contents} = this.state
        const article = contents.find(article => article.contentSlug === contentSlug || article.slug === contentSlug);
        this.category = {
            categorySlug: article.categorySlug,
        };
        this.topic = {
            topicSlug: article.topicSlug,
        }

        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            educationOrder: contents,
            fromRecommendedContent: '',
            fromFavouriteContent: item.bookmarked,
            category: this.category,
            topic: this.topic,
        });
    }

    /**
     * @function renderActivities
     * @description This method is used to render activities
     */
    renderActivities = () => {
        const activities = this.props?.revamp?.revampContext?.activities;
        return (
            <View style={{...styles.headingSectionMain, marginTop: 30,}}>
                {this.renderSeeAllSection("ACTIVITIES")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            activities?.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewActivities(item.activity.name)
                                    }}>

                                        <View style={[styles.activitiesWrapper, styles.cardStyle]}>

                                            {item.schedule
                                                && <Image style={styles.checkIcon}
                                                          source={require("../../assets/images/calenderCheck.png")}
                                                />
                                            }
                                            {item?.activity?.icon ?
                                                <Image
                                                    style={styles.activitiesImage}
                                                    resizeMode="cover"
                                                    source={{uri: S3_BUCKET_LINK + item?.activity?.icon}}
                                                />
                                                :
                                                <Image
                                                    style={styles.cardImg}
                                                    resizeMode="contain"
                                                    source={require("../../assets/images/question-mark.jpeg")}
                                                />
                                            }
                                            <Text numberOfLines={1}
                                                  style={styles.cardHeading}>{item.activity?.name}</Text>
                                            <Text numberOfLines={1}
                                                  style={styles.cardSubHeading}>
                                                {
                                                    item.checkIns
                                                    && item.checkIns.length > 0
                                                        ? item.checkIns.length + ' check-in'
                                                        : 'No check-ins yet'
                                                }</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                        <TouchableOpacity style={[styles.activitiesWrapper, styles.cardStyle]} onPress={this.navigateToActivities}>
                            <GenericViewAllCard
                                allText={'activities'}
                                onPress={this.navigateToActivities}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        )
    }

    /**
     * @function renderProviders
     * @description This method is used to render providers.
     */
    renderProviders = () => {
        const {providers} = this.state;
        return (
            <View style={styles.headingSectionMain}>
                {this.renderSeeAllSection("PROVIDERS")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            providers.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewProviderProfile(item)
                                    }}>
                                        <View style={[styles.providersWrapper, styles.cardStyle]}>
                                            {item.providerAppointment === true && (
                                                <Image
                                                    style={styles.checkIcon}
                                                    source={require("../../assets/images/calenderCheck.png")}
                                                />
                                            )}
                                            <Image
                                                style={styles.providerImage}
                                                resizeMode="cover"
                                                source={{uri: getAvatar(item)}}
                                            />
                                            <Text numberOfLines={1}
                                                  style={styles.cardHeading}>{item.name}</Text>
                                            <Text numberOfLines={1}
                                                  style={styles.cardSubHeading}>{item.designation}</Text>
                                            <View style={styles.ratingWrapper}>
                                                <AirbnbRating
                                                    type="star"
                                                    isDisabled={true}
                                                    showRating={false}
                                                    ratingCount={5}
                                                    imageSize={18}
                                                    size={18}
                                                    selectedColor={Colors.colors.secondaryText}
                                                    defaultRating={item.combinedRating}
                                                    startingValue={
                                                        item.combinedRating
                                                            ? item.combinedRating
                                                            : '0'
                                                    }
                                                    tintColor={"#fff"}
                                                    // onFinishRating={this.ratingCompleted}
                                                />
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                );
                            })
                        }
                        <TouchableOpacity style={[styles.providersWrapper, styles.cardStyle]} onPress={this.navigateToProviders}>
                            <GenericViewAllCard
                                allText={'providers'}
                                onPress={this.navigateToProviders}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

            </View>
        )
    }

    /**
     * @function renderServices
     * @description This method is used to render services
     */
    renderServices = () => {
        const {services} = this.state;
        return (
            <View style={styles.headingSectionMain}>
                {this.renderSeeAllSection("SERVICES")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            services.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewService(item)
                                    }}>
                                        <View style={[styles.servicesWrapper, styles.cardStyle]}>

                                            <View style={styles.servicesHeaderWrapper}>
                                                <View>
                                                    <Text numberOfLines={1}
                                                          style={styles.cardHeading}>{item.name}</Text>
                                                    <View style={styles.servicesHeaderSessionTimeAndCost}>
                                                        <Text
                                                            style={styles.topText}>{item.duration + " minute session "}</Text>
                                                        <Text
                                                            style={styles.topText}>{" $" + item.cost + " paid usually"}</Text>
                                                    </View>

                                                </View>
                                                {/*<Image
                                                                style={styles.checkIcon}
                                                                source={require("../../assets/images/calenderCheck.png")}
                                                            />*/}
                                            </View>
                                            <View style={styles.servicesHeaderWrapper}>
                                                <View style={styles.peopleList}>
                                                    {
                                                        item?.providers?.filter(Boolean).slice(0, 4).map((provider) => {
                                                            return (
                                                                <Image
                                                                    style={styles.singleImg}
                                                                    resizeMode={"cover"}
                                                                    source={{uri: getAvatar(provider)}}
                                                                    //source={require('../../assets/images/p3.png')}
                                                                    alt="Image"
                                                                />
                                                            )
                                                        })
                                                    }
                                                </View>
                                                <Text
                                                    style={styles.providerNumber}>{item.providers.length > 4 ? `+ ${item.providers.length - 4}` : item.providers.length} Providers</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                );
                            })
                        }
                        <TouchableOpacity style={[styles.servicesWrapper, styles.cardStyle]} onPress={this.navigateToServices}>
                            <GenericViewAllCard
                                allText={'services'}
                                onPress={this.navigateToServices}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        )
    }

    /**
     * @function renderChatBots
     * @description This method is used to render chatbots.
     */
    renderChatBots = () => {
        const {chatBots} = this.state;
        return (
            <View style={styles.headingSectionMain}>
                {this.renderSeeAllSection("CHATBOTS")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            chatBots.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewChatBot(item)
                                    }}>
                                        <View style={[styles.chatbotWrapper, styles.cardStyle]}>
                                            {item?.avatar ?
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={{uri: S3_BUCKET_LINK + item.avatar}}
                                                />
                                                :
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={require('../../assets/images/chatbot-dummy.png')}
                                                />
                                            }
                                            <View style={{backgroundColor: Colors.colors.mediumContrastBG}}>
                                                <ProgressBarAnimated
                                                    style={{width: '100%'}}
                                                    borderWidth={0}
                                                    width={windowWidth - 136}
                                                    value={item?.progress?.percentage || 0}
                                                    height={10}
                                                    backgroundColor={Colors.colors.mainPink}
                                                    backgroundColorOnComplete={Colors.colors.successIcon}
                                                    borderRadius={0}
                                                />
                                            </View>
                                            <View style={styles.afterFullWrap}>
                                                <Text numberOfLines={1} style={styles.fullHeading}>{item?.name}</Text>
                                                <Text numberOfLines={1}
                                                      style={styles.fullSubHeading}>{item?.description}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                );
                            })
                        }
                        <TouchableOpacity style={[styles.chatbotWrapper, styles.cardStyle]} onPress={this.navigateToChatBots}>
                            <GenericViewAllCard
                                allText={'chatbots'}
                                onPress={this.navigateToChatBots}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        )
    }

    /**
     * @function renderArticles
     * @description This method is used to render articles
     */
    renderArticles = () => {
        const {articles} = this.state;
        return (
            <View style={styles.headingSectionMain}>
                {this.renderSeeAllSection("ARTICLES")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            articles.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewArticles(item, item.entryId)
                                    }}>
                                        <View style={[styles.chatbotWrapper, styles.cardStyle]}>
                                            {item.titleImage ?
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={{uri: "https:" + item.titleImage}}
                                                />
                                                :
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={require('../../assets/images/article-dummy.png')}
                                                />
                                            }
                                            <View style={styles.afterFullWrap}>
                                                <Text numberOfLines={1}
                                                      style={styles.fullHeading}>{item.title}</Text>
                                                <Text
                                                    style={styles.fullSubHeading}>{item.contentDuration ? item.contentDuration + " read time" : ""}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                );
                            })
                        }
                        <TouchableOpacity style={[styles.chatbotWrapper, styles.cardStyle]} onPress={this.navigateToArticle}>
                            <GenericViewAllCard
                                allText={'articles'}
                                onPress={this.navigateToArticle}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        )
    }

    /**
     * @function renderGroups
     * @description This method is used to render groups
     */
    renderGroups = () => {
        const {groups} = this.state;
        return (
            <View style={styles.headingSectionMain}>
                {this.renderSeeAllSection("GROUPS")}
                <View style={styles.wrapperMain}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.homeMainBannerCardList}
                        horizontal
                        ref={ref => {
                            this.scrollView = ref;
                        }}>
                        {
                            groups && groups.map((item) => {
                                return (
                                    <TouchableOpacity onPress={() => {
                                        this.viewGroup(item)
                                    }}>
                                        <View style={[styles.chatbotWrapper, styles.cardStyle]}>
                                            {item?.groupImage ?
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={{uri: S3_BUCKET_LINK + item.groupImage}}
                                                />
                                                :
                                                <Image
                                                    style={styles.fullImage}
                                                    resizeMode="cover"
                                                    source={require('../../assets/images/default-group.png')}
                                                />
                                            }
                                            <View style={styles.afterFullWrap}>
                                                <Text numberOfLines={1} style={styles.fullHeading}>{item.name}</Text>
                                                <Text
                                                    style={styles.fullSubHeading}>{item.isGroupAnonymous === true ? "Anonymous" : "Public"}</Text>
                                                {item.joinedGroup && (
                                                    <Image
                                                        style={styles.checkIcon}
                                                        source={require("../../assets/images/vector.png")}
                                                    />
                                                )}

                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                        <TouchableOpacity style={[styles.chatbotWrapper, styles.cardStyle]} onPress={this.navigateToGroups}>
                            <GenericViewAllCard
                                allText={'groups'}
                                onPress={this.navigateToGroups}
                            />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        )
    }

    /**
     * @function renderTotalTokensSection
     * @description This method is used to render total token section
     */
    renderTotalTokensSection = () => {
        const totalTokens = this.props.revamp.revampContext?.tokens;
        if (totalTokens >= 5) {
            return (
                <TouchableOpacity style={styles.tokenOuter}
                                  onPress={()=>{
                                      this.props.navigation.replace(Screens.REVAMP_TOKEN_SPINNER_SCREEN);}}>
                    <View style={styles.tokenWrapper}>
                        <View style={styles.tokenImgWrapper}>
                            <Image
                                style={styles.tokenImg}
                                resizeMode="contain"
                                source={require("../../assets/images/tokens.png")}
                            />
                            <Text style={styles.tokenNumber}>5</Text>
                        </View>
                        <Text style={styles.tokenText}>
                            You have
                            <Text style={{color: Colors.colors.successText}}> {totalTokens >= 0 ? totalTokens : 0} token{totalTokens >1 && 's'}</Text> available! You can
                            spin the prize wheel.
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    /**
     * @function navigateToSeeAllPriorities
     * @description This method is used to navigate to see All priorities
     */
    navigateToSeeAllPriorities = (seeFullPlan) => {
        const {services} = this.state;
        let revampContextDetails = this.props.revamp.revampContext;
        this.props.navigation.navigate(Screens.PLAN_HOME_DETAILS_SCREEN, {
            revampContextDetails,
            services,
            seeFullPlan
        });
    }

    navigateToRevampProgressReport = () => {
        if (this.props.revamp.revampSundayCheckInsList
            && this.props.revamp.revampSundayCheckInsList.length >  0) {
            this.props.navigation.navigate(Screens.REVAMP_PROGRESS_REPORT_SCREEN)
        } else{
            AlertUtil.showErrorMessage('No sunday check-in yet');
        }
    }

    createSundayCheckIn = async () => {
        if (this.props.revamp.revampSundayCheckIn) {
            this.navigateToSundayCheckIn();
        } else {
            this.setState({isLoading: true})
            let revampSundayCheckInCreated = await ConversationService.createSundayCheckIn();
            if (revampSundayCheckInCreated.errors){
                this.setState({isLoading: false})
                AlertUtil.showErrorMessage(revampSundayCheckInCreated.errors[0].endUserMessage);
            } else {
                this.setState({isLoading: false}, ()=>{
                    this.props.fetchRevampSundayCheckin();
                    this.navigateToSundayCheckIn();})

            }
        }
    };


    navigateToSundayCheckIn = () => {
        this.props.navigation.navigate(Screens.SUNDAY_CHECK_IN_HOME_SCREEN)
    }

    /**
     * @function navigateToAddToPriorityScreen
     * @description This method is used to navigate to add priorities screen
     */
    navigateToAddToPriorityScreen = () => {
        let revampContextDetails = this.props.revamp.revampContext;
        revampContextDetails.plan.planItemsContexts = revampContextDetails?.plan?.planItemsContexts.filter(planItem => planItem.priority === false);
        this.props.navigation.navigate(Screens.ADD_YOUR_PRIORITIES_SCREEN, {
            revampContextDetails: revampContextDetails
        });
    }

    /**
     * @function renderEmptyPriorities
     * @description This method is used to render empty section for Priorities
     */
    renderEmptyPriorities = () => {
        return (
            <View style={styles.emptyWrap}>
                <Text style={styles.emptyHeading}>Add to your priorities</Text>
                <Text style={styles.emptyDes}>You don’t have any priority items selected. Most Confidant
                    guests find it helpful to focus on a few items at a time. These are highlighted as
                    priorities. </Text>
                <View style={styles.emptyBtn}>
                    <PrimaryButton
                        type={'AntDesign'}
                        color={Colors.colors.white}
                        iconName={'plus'}
                        text={'Add to your priorities'}
                        onPress={() => {
                            this.navigateToAddToPriorityScreen()
                        }}
                    />
                </View>
            </View>
        )
    }

    /**
     * @function getSeeAllDetails
     * @description This method is used to get See All details
     */
    getSeeAllDetails = (type) => {
        switch (type) {
            case 'YOUR_PRIORITIES' :
                return {title: 'Your priorities', method: () => this.navigateToSeeAllPriorities(false)}
            case 'ACTIVITIES' :
                return {title: 'Activities', method: () => this.navigateToActivities()}
            case 'PROVIDERS' :
                return {title: 'Providers', method: () => this.navigateToProviders()}
            case 'SERVICES' :
                return {title: 'Services', method: () => this.navigateToServices()}
            case 'CHATBOTS' :
                return {title: 'Chatbots', method: () => this.navigateToChatBots()}
            case 'ARTICLES' :
                return {title: 'Articles', method: () => this.navigateToArticle()}
            case 'GROUPS' :
                return {title: 'Groups', method: () => this.navigateToGroups()}
            default :
                return null
        }

    }

    /**
     * @function renderSeeAllSection
     * @description This method is used to render see All section
     */
    renderSeeAllSection = (type) => {
        const seeAllDetails = this.getSeeAllDetails(type);
        return (
            <View style={styles.headingSectionMainHeading}>
                <Text style={styles.headingSectionText}>{seeAllDetails.title}</Text>
                <TouchableWithoutFeedback onPress={seeAllDetails.method}>
                    <View style={styles.headingSectionSeeAll}>
                        <Text style={styles.headingSectionSeeAllText}>See all</Text>
                        <AntIcon style={styles.headingSectionSeeAllIcon} name="arrowright" size={20}
                                 color={Colors.colors.primaryIcon}/>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if (this.state.isLoading || this.props.connections.isLoading || this.props.appointments.isLoading) {
            return <Loader/>
        }
        const {branchOverlyModel, branchCloseOverlay, branchOverlyTitle, branchOverlySubTitle, branchOverlyDescription,
            branchOverlyImage, handleOnContinueButton, branchLink} = this.props;
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                {branchOverlyModel &&
                    <BranchOverlay
                        modalVisible={branchOverlyModel}
                        branchLink={branchLink}
                        branchOverlyTitle={branchOverlyTitle}
                        branchOverlySubTitle={branchOverlySubTitle}
                        branchOverlyDescription={branchOverlyDescription}
                        branchOverlyImage={branchOverlyImage}
                        branchCloseOverlay={branchCloseOverlay}
                        handleOnContinueButton={handleOnContinueButton}
                    />
                }
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.homeTopTextWrap}>
                        <View style={styles.smileWrap}>
                            <Text
                                {...addTestID("request-service")}
                                style={[styles.mainTitle, {textAlign: "center"}]}>
                                Hi {this.props?.auth?.meta?.nickname}!
                            </Text>
                            <Text style={styles.homeSubTitle}>
                                Another day, another step closer to your reward!
                            </Text>
                        </View>
                        {this.renderTopBanners()}
                        {this.renderTotalTokensSection()}
                        {this.renderPrioritiesSection()}
                        {this.renderActivities()}
                        {this.renderProviders()}
                        {this.renderServices()}
                        {this.renderChatBots()}
                        {this.renderGroups()}
                        {this.renderArticles()}
                    </View>
                </Content>
                {this.state.openModal && this.renderPageMainModal()}
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    peopleRow: {},
    providerNumber: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.secondaryIcon,
        alignSelf: "center",
        paddingTop: 18

    },
    servicesHeaderWrapper: {
        justifyContent: 'space-between',
        flexDirection: "row",
    },
    servicesHeaderSessionTimeAndCost: {
        justifyContent: 'space-between',
        flexDirection: "row",
    },
    peopleList: {
        paddingTop: 16,
        paddingLeft: 16,
        flexDirection: "row",
        // alignItems: "center",
        // justifyContent: "center",
        paddingBottom: 0,
    },
    singlePerson: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#fff",
        marginLeft: -15,
    },
    singleImg: {
        width: 52,
        height: 52,
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 80,
        marginLeft: -15,
    },
    ratingWrapper: {
        paddingTop: 10,
    },
    providerImage: {
        height: 64,
        width: 64,
        borderRadius: 32,
        overflow: 'hidden',
    },
    activitiesImage: {
        height: 64,
        width: 64,
        overflow: 'hidden',
    },
    cardImg: {
        marginBottom: 16,
        height: 46,
    },
    wrapperMain: {
        width: "100%",
        // marginBottom: 16
    },
    cardSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast,
    },
    cardStyle: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
    },
    cardHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    activitiesWrapper: {
        paddingVertical: 32,
        paddingHorizontal: 16,
        height: 155,
        width: 155,
        alignItems: "center",
        marginRight: 8,
        position: 'relative'
    },
    providersWrapper: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        height: 194,
        width: 155,
        alignItems: "center",
        justifyContent: 'center',
        marginRight: 8,
        position: 'relative',
    },
    checkIcon: {
        position: 'absolute',
        right: 8,
        top: 8,
        width: 24,
        height: 24
    },
    servicesWrapper: {
        paddingVertical: 24,
        paddingHorizontal: 24,
        height: 163,
        width: 318,
        marginRight: 8,
        position: 'relative',
        justifyContent: 'center'
    },
    chatbotWrapper: {
        height: 197,
        width: 241,
        marginRight: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        position: 'relative'
    },
    fullImage: {
        height: 120,
        width: '100%',
    },
    afterFullWrap: {
        paddingVertical: 20,
        paddingHorizontal: 16
    },
    fullHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    fullSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    headingSectionMain: {
        marginBottom: 40,
        width: "100%",
    },
    contentList: {
        // marginBottom: 40,
        paddingHorizontal: 24,
    },
    emptyWrap: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24
    },
    emptyHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    emptyDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 24
    },
    emptyBtn: {},
    headingSectionSeeAllIcon: {
        marginTop: 1
    },
    headingSectionSeeAllText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryIcon,
        paddingRight: 8
    },
    headingSectionText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
    },
    headingSectionSeeAll: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        flexDirection: "row",
        alignItems: "center"
    },
    headingSectionMainHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        // marginTop : 24,
        paddingHorizontal: 24
    },
    priorityDescription: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,

    },
    topText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.lowContrast
    },
    priorityWrapperMain: {
        width: "100%",
        height: 95,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    priorityShape: {
        width: 4,
        backgroundColor: Colors.colors.primaryIcon,
        height: 40,
        alignSelf: "center",
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
    },
    priorityWrapper: {
        ...CommonStyles.styles.shadowBox,
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "98.5%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    priorityHeadingWrapper: {
        display: "flex",
        flexDirection: "row",
    },
    priorityHeading: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
    },
    tokenImgWrapper: {
        alignItems: "center",
        width: 80,
        height: 80,
        justifyContent: 'center'
    },
    tokenImg: {
        position: 'absolute'
    },
    homeMainBanner: {
        width: "100%",
        // paddingLeft: 24
    },
    roundWrapper: {
        alignItems: "center",
        paddingBottom: 24,
    },
    tokenNumber: {
        alignItems: "center",
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH1
    },
    centerText: {
        position: "absolute",
        alignItems: "center", //Centered vertically
        flex: 1,
        top: 30,
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
    },
    mainTitleText: {
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,
        textAlign: "center",
        paddingBottom: 24,
    },
    homeMainBannerCardList: {
        // paddingBottom: 32,
        paddingHorizontal: 24,
    },
    shortText: {
        color: Colors.colors.whiteColor,
        opacity: 0.6,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextS,
        textTransform: "uppercase",
        alignSelf: "center",
        paddingBottom: 8
    },
    homeMainBannerCard: {
        ...CommonStyles.styles.shadowBox,
        width: 324,
        borderRadius: 12,
        marginRight: 16,
        paddingHorizontal: 32,
        paddingVertical: 40,
        height: 395
    },
    homeTopTextWrap: {
        alignItems: "center",
        paddingVertical: 32
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        marginTop: 32,
    },
    subTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.successText,
        marginTop: 56,
    },
    smileWrap: {
        justifyContent: "center",
        paddingHorizontal: 24
    },
    homeSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        textAlign: "center",
        paddingHorizontal: 50,
        paddingBottom: 40,
    },
    singleCard: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
    },
    tokenOuter: {
        paddingHorizontal: 24
    },
    tokenWrapper: {
        ...CommonStyles.styles.shadowBox,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        borderRadius: 12,
        width: "100%",
        padding: 24,
        marginTop: 40
    },
    tokenText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        paddingLeft: 24,
        flex: 1
    },
    btnOptions: {
        marginBottom: 8,
    },
    modalHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8
    }
});
export default connectConnections()(NewHomeScreen);
