import React, {PureComponent} from 'react';
import {
    Image,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    GET_SUPPORT_EMAIL,
    GET_SUPPORT_HELP_LINE,
    hasNotificationPermissions,
    PrimaryButton,
    requestNotificationPermissions,
    SecondaryButton,
    TextStyles,
    VideoPlayer
} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import {Screens} from '../../constants/Screens';
import AppointmentService from "../../services/Appointment.service";
import Loader from "../../components/Loader";
import {
    CONTENT_TYPE,
    EXPIRE_TOKEN,
    REVAMP_ON_BOARDING_CONTEXT_STATUS,
    SEGMENT_EVENT
} from '../../constants/CommonConstants';
import AuthService from "../../services/Auth.service";
import PushNotificationListeners from "../../components/PushNotificationListeners";
import AuthStore from "../../utilities/AuthStore";
import ProfileService from "../../services/Profile.service";
import {ContentfulClient} from "ch-mobile-shared/src/lib/contentful/contentful";
import FeatherIcons from "react-native-vector-icons/Feather";
import BranchOverlay from '../../components/BranchOverlay';
import moment from 'moment';
import Analytics from '@segment/analytics-react-native';
import ConversationService from "../../services/Conversation.service";
import Modal from "react-native-modalbox";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import NewHomeScreen from "../revamp-home/NewHome.screen";

class SelfScheduleStartScreen extends PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.componentReference = null;
        this.player = null;
        this.state = {
            isLoading: false,
            servicesCount: 0,
            providersCount: 0,
            message: '',
            supportEmail: '',
            chatbotList: [],
            showOtherOptionsModal: false,
            revampOnBoardingContext: this.props.revamp.revampOnBoardingContext,
            revampContext: this.props.revamp.revampContext,
            playVideo: false,
            data: null
        }
    }

    componentDidMount = async () => {
        //Only for local debugging to expire token if session is not expiring
        if (EXPIRE_TOKEN) {
            await AuthService.logout();
            this.props.navigation.navigate(Screens.MAGIC_LINK_SCREEN);
        }

        PushNotificationListeners.subscribeToOneSignal();
        this.props.fetchAppointments();
        if (this.props.connections.connectionsFetchedFor !== this.props.auth.meta.userId) {
            this.props.fetchConnections();
        } else {
            this.props.refreshConnections();
        }

        this.props.fetchRevampContext();
        this.props.fetchRevampOnBoardingContext();
        this.props.fetchRevampSundayCheckin();
        this.props.fetchRevampSundayCheckinsList();
        this.props.fetchEligibleProviders();
        this.props.fetchAllServices();
        this.props.fetchProfile();
        this.props.fetchWallet();
        this.props.fetchContentAssignedToMe();
        this.props.fetchEducationMarkers();
        this.props.registerTokenRefreshTask();
        this.props.fetchChatbots();
        this.props.fetchAllGroups();
        const activeSession = await AuthStore.hasActiveTelesession();
        if (activeSession) {
            this.props.navigation.navigate(
                Screens.TELEHEALTH_WELCOME,
                JSON.parse(activeSession),
            );
        }

        const branchParams = await AuthStore.getBranchParams();
        if (branchParams) {
            if (branchParams.navigateTo) {
                this.props.navigation.navigate(
                    branchParams.navigateTo,
                    branchParams,
                );
            }
            if (branchParams.recommendProvider != null && branchParams.recommendProvider.contentType === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE) {
                const providerInfo = await ProfileService.getProviderProfile(branchParams.recommendProvider.providerId);
                if (!providerInfo.error) {
                    this.setState({
                        branchOverlyModel: true,
                        branchOverlySubTitle: providerInfo.fullName,
                        branchOverlyDescription: providerInfo.bio,
                        branchOverlyImage: providerInfo.profileImage,
                        providerId: providerInfo.providerId,
                        branchLink: branchParams.recommendProvider.contentType,
                    });
                }
            }
            if (branchParams.contentfulData != null && branchParams.contentfulData.contentType === CONTENT_TYPE.EDUCATION_CONTENT) {
                let query = {
                    "content_type": "educationalContent",
                    "sys.id": branchParams.contentfulData.contentId,
                };
                const res = await ContentfulClient.getEntries(query);
                let eduContent;
                if (res.items.length > 0) {
                    eduContent = res.items[0];
                    if (eduContent && eduContent.fields) {
                        this.setState({
                            branchOverlyModel: true,
                            branchOverlySubTitle: eduContent.fields.title,
                            branchOverlyDescription: eduContent.fields.description,
                            branchOverlyImage: eduContent.fields.titleImage ? eduContent.fields.titleImage.fields.file.url : null,
                            contentSlugs: {
                                contentId: branchParams.contentfulData.contentId,
                                categorySlug: branchParams.contentfulData.categorySlug,
                                topicSlug: branchParams.contentfulData.topicSlug,
                            },
                            branchLink: branchParams.contentfulData.contentType,
                        });
                    }
                }
            }
            if (branchParams.groupChannelInfo != null && branchParams.groupChannelInfo.contentType === CONTENT_TYPE.GROUP_RECOMMENDATION) {
                const groupInfo = await ProfileService.getGroupDetails(branchParams.groupChannelInfo.groupChannelUrl);

                if (groupInfo?.errors) {
                    AlertUtil.showErrorMessage("This group is not public");
                } else {
                    this.setState({
                        branchOverlyModel: true,
                        branchOverlySubTitle: groupInfo.name,
                        branchOverlyImage: groupInfo.profilePicture,
                        branchOverlyDescription: "",
                        groupChannelUrl: branchParams.groupChannelInfo.groupChannelUrl,
                        branchLink: branchParams.groupChannelInfo.contentType,
                    });
                }

            }
            if (branchParams.profileElementData != null && branchParams.profileElementData.contentType === CONTENT_TYPE.PROFILE_ELEMENT) {
                const profileElementRequest = {
                    profileElementKey: branchParams.profileElementData.profileElementKey,
                    profileElementValue: branchParams.profileElementData.profileElementValue,
                };
                const response = await ProfileService.addProfileElement(profileElementRequest);
                if (response.message != null) {
                    this.setState({
                        branchOverlyModel: true,
                        branchOverlyTitle: branchParams.profileElementData.profileElementTitle,
                        branchOverlySubTitle: branchParams.profileElementData.profileElementSubTitle,
                        branchOverlyDescription: branchParams.profileElementData.profileElementDescription,
                        branchLink: "profile-element",
                    });
                }
            }
            if (branchParams.chatbot != null && branchParams.chatbot.contentType === CONTENT_TYPE.SHARE_CHATBOT) {
                const chatbotProfile = this.props.connections.chatbotList.find(chatbot => chatbot.id === branchParams.chatbot.id);
                if (chatbotProfile != null) {
                    this.setState({
                        branchOverlyModel: true,
                        branchOverlySubTitle: "HERE's YOUR INFORMATION:",
                        branchOverlyDescription: chatbotProfile.name,
                        branchLink: branchParams.chatbot.contentType,
                        chatbotProfile: chatbotProfile
                    });
                }
            }
            AuthStore.removeBranchParams().then(() => {
                console.log("Branch Params removed");
            });
        }
        const notificationStatus = await hasNotificationPermissions();
        if (notificationStatus.status === 'denied') {
            await requestNotificationPermissions();
        }

        this.props.fetchChatbots();
        this.getProvidersCount();
        this.getServicesCount();
        this.getRevampHome();

        if (this.props.revamp.revampOnBoardingContext && this.props.revamp.revampOnBoardingContext.onBoardingStatus === REVAMP_ON_BOARDING_CONTEXT_STATUS.IN_PROGRESS.key) {
            Analytics.screen(
                'ReVAMP Home - In Progress'
            );
        } else if (this.props.revamp.revampOnBoardingContext === null || this.props.revamp.revampOnBoardingContext === undefined) {
            Analytics.screen(
                'ReVAMP Home - Not Started'
            );
        }
    }

    getRevampHome = async () => {
        try {
            this.setState({isLoading: true})
            let query = {
                'content_type': 'revampTypes'
            };
            const response = await ContentfulClient.getEntries(query);
            if (response?.errors) {
                console.log(response?.errors?.[0].endUserMessage);
                //AlertUtil.showErrorMessage('Type not available.');
                this.setState({data: null, isLoading: false});
            } else {
                let revampHome;
                if (response.items?.length > 0) {
                    let data = response.items.find(item=>{
                        return item.fields.isRevampHome
                    })
                    revampHome = {
                        name: data.fields.name
                            && data.fields.name,
                        description: data.fields.description
                            && data.fields.description.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                        poster: data.fields.poster.fields.file.url
                            && data.fields.poster.fields.file.url,
                        video: data.fields.video.fields.file.url
                            && data.fields.video.fields.file.url,
                        quote: data.fields.quote
                            && data.fields.quote.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                        quoteAuthor: data.fields.quoteAuthor
                            && data.fields.quoteAuthor,
                        detailDescription: data.fields.detailDescription
                            && data.fields.detailDescription.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                    };
                    this.setState({data: revampHome, isLoading: false});
                } else {
                    this.setState({data: null, isLoading: false});
                }
            }
        } catch (e) {
            console.log(e);
            this.setState({data: null, isLoading: false});
        }
    };

    dialNumber = () => {
        let phoneNumber = '';
        if (Platform.OS === 'android') {
            phoneNumber = `tel:${GET_SUPPORT_HELP_LINE}`;
        } else {
            phoneNumber = `tel://${GET_SUPPORT_HELP_LINE}`;
        }
        this.setState({message: "", supportEmail: ""})
        Linking.openURL(phoneNumber);
    };

    onChangeMessage = (message) => {
        this.setState({message});
    }

    sendMessage = () => {
        Linking.openURL(`mailto:${GET_SUPPORT_EMAIL}?subject=Need help`)
    }

    navigateToProhibitiveScreen = ()=>{
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }

    /**
     * @function navigateToProviders
     * @description This method is used to navigate to select provider screen.
     */
    navigateToProviders = () => {
        this.setState({ showOtherOptionsModal: false })
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
            isProviderFlow: true,
            isPatientProhibitive:this.props.profile.patient.isPatientProhibitive
        });
    };


    /**
     * @function navigateToServices
     * @description This method is used to navigate to select service by type screen .
     */
    navigateToServices = () => {
        this.setState({ showOtherOptionsModal: false })
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
            isProviderFlow: false,
            isPatientProhibitive:this.props.profile.patient.isPatientProhibitive
        });
    };

    /**
     * @function navigateToGroups
     * @description This method is used to navigate to groups screen.
     */
    navigateToGroups = () => {
        this.setState({showOtherOptionsModal: false})
        this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN, {
            allGroupsDetails: this.props?.connections?.allGroups
        });
    };

    navigateToChatBots = () => {
        this.setState({showOtherOptionsModal: false})
        this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
    };

    navigateToInviteOthers = () => {

    };

    /**
     * @function getProvidersCount
     * @description This method is used to get providers count .
     */

    getProvidersCount = async () => {
        const response = await AppointmentService.listProviders();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({providersCount: response?.length})
        }
    }

    /**
     * @function getServicesCount
     * @description This method is used to get services count.
     */

    getServicesCount = async () => {
        let response = await AppointmentService.getAllServiceTypes();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({servicesCount: response?.serviceTypes?.length});
        }
    };

    createRevampOnBoardingContext = async () => {
        let revampOnBoardingContextCreated = await ConversationService.createRevampOnBoardingContext();
        if (revampOnBoardingContextCreated.errors) {
            AlertUtil.showErrorMessage(revampOnBoardingContextCreated.errors[0].endUserMessage);
        } else {
            await this.props.fetchRevampContext();
            await this.props.fetchRevampOnBoardingContext();
            this.navigateToRevampOnBoardingProgressScreen()
            // this.setState({isLoading: false}, () => this.navigateToRevampOnBoardingProgressScreen());
        }
    };

    branchCloseOverlay = () => {
        this.setState({branchOverlyModel: false});
    };

    groupRecommendation = async () => {
        this.setState({branchOverlyModel: false});
        const response = await ProfileService.joinPublicGroup(this.state.groupChannelUrl);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            AlertUtil.showSuccessMessage("Group Joined Successfully");
            this.props.fetchConnections();
            this.props.fetchAppointments();

            const groupInfo = await ProfileService.getGroupDetails(this.state.groupChannelUrl);
            if (groupInfo.errors) {
                AlertUtil.showErrorMessage("This group is not public");
            } else {
                const segmentGroupJoinedPayload = {
                    userId: this.props.auth.meta?.userId,
                    groupId: this.state.groupChannelUrl,
                    groupName: groupInfo?.name,
                    joinedAt: moment.utc(Date.now()).format(),
                    joinMethod: "Branch Link - group-recommendation",
                    groupAnonymousStatus: groupInfo?.groupAnonymous,
                    groupPrivacyStatus: groupInfo?.groupTypePublic,
                    groupTotalMembers: groupInfo?.members?.length,
                    category: 'Goal Completion',
                    label: 'Group Joined'
                };
                await Analytics.track(SEGMENT_EVENT.GROUP_JOINED, segmentGroupJoinedPayload);
            }
            this.props.refreshConnections();
        }


    };

    providerConnection = async () => {

        this.props.connect({
            userId: this.state.providerId,
            onSuccess: () => {
                const allowProviderAccess = {
                    providerId: this.state.providerId,
                    allowed: true,
                };
                this.props.updateProviderAccess(allowProviderAccess);
                this.setState({branchOverlyModel: false});
                this.props.fetchConnections();
                this.props.fetchAppointments();

            },
            onFailure: (connectResponse) => {
                AlertUtil.showErrorMessage(connectResponse.errors[0].endUserMessage);
                this.setState({branchOverlyModel: false});
            },
        });

    };

    educationalContentPiecesScreen = () => {
        this.setState({branchOverlyModel: false, showOtherOptionsModal: false});
        let contentSlugs = this.state.contentSlugs;
        let contentTitle = this.state.branchOverlySubTitle;

        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug: contentSlugs.contentId,
            category: {categorySlug: contentSlugs.categorySlug},
            topic: {topicSlug: contentSlugs.topicSlug},
        });
    };

    assignConversation = async () => {
        const {chatbotProfile} = this.state;
        this.setState({branchOverlyModel: false});
        let response = await ConversationService.selfAssignConversation(chatbotProfile.id, chatbotProfile.organizationId)
        try {
            if (response?.errors) {
                AlertUtil.showErrorMessage(response?.errors?.[0]?.endUserMessage);
                this.setState({branchOverlyModel: false});
            } else {
                AlertUtil.showSuccessMessage('Assessment has been added to your conversation Queue');
                this.setState({branchOverlyModel: false});
            }
        } catch (error) {
            AlertUtil.showErrorMessage(this.ERROR_SERVICES_UNREACHABLE);
            this.setState({branchOverlyModel: false});
        }
    };

    handleOnContinueButton = (branchLink) => {
        if (branchLink === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE) {
            this.providerConnection();
        } else if (branchLink === CONTENT_TYPE.EDUCATION_CONTENT) {
            this.educationalContentPiecesScreen();
        } else if (branchLink === CONTENT_TYPE.GROUP_RECOMMENDATION) {
            this.groupRecommendation();
        } else if (branchLink === CONTENT_TYPE.PROFILE_ELEMENT) {
            this.branchCloseOverlay();
        } else if (branchLink === CONTENT_TYPE.SHARE_CHATBOT) {
            this.assignConversation();
        }
    };

    navigateToRevampOnBoardingProgressScreen = () => {
        this.setState({showOtherOptionsModal: false, playVideo: false})
        this.player.pause();
        this.props.navigation.navigate(Screens.REVAMP_ON_BOARDING_PROGRESS_SCREEN)
    };

    pauseMedia = (player) => {
        this.setState({playVideo: !this.state.playVideo})
        setTimeout(() => {
            if (player) {
                player.pause();
            }
        }, 0);
    };


    renderRevampHome = () => {
        const {data, showOtherOptionsModal, playVideo} = this.state;
        const revampOnBoardingContext = this.props.revamp.revampOnBoardingContext;
        return (<Content showsVerticalScrollIndicator={false}>
                {data &&
                    <View style={styles.mainContentWrapper}>
                        <View style={{marginBottom: 24}}>
                            <Text style={{...styles.mainHeading, marginTop: 48}}>
                                Complete ReVAMP to get a personalized plan based on your values and goals.
                                {/*{data.name}*/}
                            </Text>
                            <Text style={styles.subHeading}>
                                Informed by science. Powered by you.
                                {/*{data.description}*/}
                            </Text>
                        </View>
                        {revampOnBoardingContext && revampOnBoardingContext.onBoardingStatus === REVAMP_ON_BOARDING_CONTEXT_STATUS.IN_PROGRESS.key
                            ?
                            <View style={!playVideo && styles.roundVideoBtnWrapper}>
                                {!playVideo && <AnimatedCircularProgress
                                    size={160}
                                    width={8}
                                    fill={
                                        revampOnBoardingContext
                                        && revampOnBoardingContext.revampTypesContexts
                                        && revampOnBoardingContext.revampTypesContexts.length > 0
                                            ? revampOnBoardingContext.revampTypesContexts
                                            .filter(type=>type.typeStatus === REVAMP_ON_BOARDING_CONTEXT_STATUS.COMPLETED.key).length * 20
                                            : 0
                                    }
                                    lineCap={'round'}
                                    rotation={0}
                                    tintColor="#DD0374"
                                    backgroundColor="#EAF1F5"/>}
                                <View style={playVideo ? styles.videoPlayerWrapper : styles.videoThumb}>
                                    <VideoPlayer
                                        {...addTestID('Video-Player')}
                                        ref={(ref) => {
                                            this.player = ref;
                                        }}
                                        thumbnail={{uri: 'https:' + data.poster}}
                                        endThumbnail={{uri: 'https:' + data.poster}}
                                        endWithThumbnail
                                        video={{uri: 'https:' + data.video}}
                                        disableControlsAutoHide
                                        onPlayPress={this.pauseMedia}
                                        onStart={this.pauseMedia}
                                        onEnd={this.pauseMedia}
                                        pauseOnPress
                                        disableFullscreen={true}
                                        resizeMode='cover'
                                        style={playVideo && revampOnBoardingContext.onBoardingStatus === REVAMP_ON_BOARDING_CONTEXT_STATUS.IN_PROGRESS.key ? styles.mainVideoImage : {
                                            width: '100%',
                                            height: '100%'
                                        }}
                                        customStyles={gradientPlayer}
                                        playArrowSize={32}
                                        isGradientP={false}
                                        refScreen={"revamp"}

                                    />
                                </View>
                            </View>
                            :
                            <View style={styles.videoPlayerWrapper}>
                                <VideoPlayer
                                    {...addTestID('Video-Player')}
                                    ref={(ref) => {
                                        this.player = ref;
                                    }}
                                    thumbnail={{uri: 'https:' + data.poster}}
                                    endThumbnail={{uri: 'https:' + data.poster}}
                                    endWithThumbnail
                                    video={{uri: 'https:' + data.video}}
                                    disableControlsAutoHide
                                    onPlayPress={this.pauseMedia}
                                    onStart={this.pauseMedia}
                                    pauseOnPress
                                    disableFullscreen={true}
                                    resizeMode='cover'
                                    style={styles.mainVideoImage}
                                    customStyles={gradientPlayer}
                                    playArrowSize={41}
                                    isGradientP={false}
                                    refScreen={"revamp"}

                                />
                            </View>
                        }

                        {
                            data.quote
                            && data.quoteAuthor
                            && <View style={{marginBottom: 24}}>
                                <Text style={styles.authorQuote}>{data.quote}</Text>
                                <Text style={styles.authorName}>{data.quoteAuthor}</Text>
                            </View>
                        }

                        <View style={{marginTop: 32}}>
                            <PrimaryButton
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    if (revampOnBoardingContext) {
                                        this.navigateToRevampOnBoardingProgressScreen();
                                    } else {
                                        this.createRevampOnBoardingContext();
                                    }
                                }}
                                text = {'Get Your Plan'}
                                size={24}
                            />
                        </View>
                        <View style={{}}>
                            <Text style={{...styles.mainHeading, ...TextStyles.mediaTexts.TextH4 ,marginTop: 40, marginBottom: 38}}>
                                Not ready for a personalized approach?
                            </Text>
                            {this.renderOldHome()}
                        </View>

                    </View>}

            </Content>
        )
    }

    renderOldHome = () => {
        const {providersCount, servicesCount} = this.state;
        return (
            <View>
                <TouchableWithoutFeedback onPress={this.navigateToProviders}>
                    <View style={styles.singleCard}>
                        <View style={styles.cardImgWrapper}>
                            <Image
                                style={styles.homeImg}
                                resizeMode={'contain'}
                                source={require('../../assets/images/home-Providers.png')}/>
                        </View>
                        <View style={styles.cardContentWrapper}>
                            <Text style={styles.contentMainText}>Meet our providers</Text>
                            <Text style={styles.contentSubText}>Connect with therapists, prescribers,
                                and coaches.</Text>
                            <Text style={styles.contentCountText}>{providersCount} providers</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.navigateToServices}>
                    <View style={styles.singleCard}>
                        <View
                            style={[styles.cardImgWrapper, {backgroundColor: Colors.colors.homeServiceImageBG}]}>
                            <Image
                                style={styles.homeImg}
                                resizeMode={'contain'}
                                source={require('../../assets/images/home-services.png')}/>
                        </View>
                        <View style={styles.cardContentWrapper}>
                            <Text style={styles.contentMainText}>Book an appointment</Text>
                            <Text style={styles.contentSubText}>Browse services and schedule an appointment.</Text>
                            <Text style={styles.contentCountText}>{servicesCount} service types</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.navigateToGroups}>
                    <View style={styles.singleCard}>
                        <View
                            style={[styles.cardImgWrapper, {backgroundColor: Colors.colors.homeServiceImageBG}]}>
                            <Image
                                style={styles.homeImg}
                                resizeMode={'contain'}
                                source={require('../../assets/images/home-groups.png')}/>
                        </View>
                        <View style={styles.cardContentWrapper}>
                            <Text style={styles.contentMainText}>Explore groups</Text>
                            <Text style={styles.contentSubText}>Connect with people just like you who get it.</Text>
                            <Text style={styles.contentCountText}>{this.props?.connections?.allGroups?.length} Groups</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.navigateToChatBots}>
                    <View style={styles.singleCard}>
                        <View
                            style={[styles.cardImgWrapper, {backgroundColor: Colors.colors.homeServiceImageBG}]}>
                            <Image
                                style={styles.homeImg}
                                resizeMode={'contain'}
                                source={require('../../assets/images/home-chatbots.png')}/>
                        </View>
                        <View style={styles.cardContentWrapper}>
                            <Text style={styles.contentMainText}>Start with a healthbot</Text>
                            <Text style={styles.contentSubText}>Learn or track progress with our
                                ChatBots.</Text>
                            {!this.props.connections.chatbotsLoading
                                && <Text
                                    style={styles.contentCountText}>{this.props.connections.chatbotList.length} chatbots</Text>}

                        </View>
                    </View>
                </TouchableWithoutFeedback>
              {/*  <TouchableWithoutFeedback onPress={this.navigateToInviteOthers}>
                            <View style={styles.singleCard}>
                                <View
                                    style={[styles.cardImgWrapper, {backgroundColor: Colors.colors.homeServiceImageBG}]}>
                                    <Image
                                        style={styles.homeImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/home-invite.png')}/>
                                </View>
                                <View style={styles.cardContentWrapper}>
                                    <Text style={styles.contentMainText}>Invite others</Text>
                                    <Text style={styles.contentSubText}>Know someone we could help? Invite them to
                                        Confidant now!</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>*/}

                <View>
                    <View>
                        <Text {...addTestID('notifications')}
                              style={styles.mainTitle}>Need some help?</Text>
                    </View>

                    <View style={styles.mainIconsWrapper}>
                        <TouchableOpacity onPress={() => this.dialNumber()} style={{...styles.helpBoxes, paddingRight: 8}}>
                            <View style={styles.iconViewStyle}>
                                <View style={styles.iconInnnerViewStyle}>
                                    <FeatherIcons style={styles.editIcon}
                                                  color={Colors.colors.primaryIcon}
                                                  size={28}
                                                  name='phone-call'
                                    />
                                    <Text style={styles.iconText}>Call us</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.sendMessage} style={{...styles.helpBoxes, paddingLeft: 8}}>
                            <View style={styles.iconViewStyle}>
                                <View style={styles.iconInnnerViewStyle}>
                                    <FeatherIcons style={styles.editIcon}
                                                  color={Colors.colors.primaryIcon}
                                                  size={28}
                                                  name='mail'
                                    />
                                    <Text style={styles.iconText}>Write email</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>);
    }


    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading || this.props.connections.isLoading || this.props.appointments.isLoading) {
            return <Loader/>
        }
        const {data, showOtherOptionsModal, branchOverlyModel, branchLink, branchOverlyTitle, branchOverlySubTitle,
            branchOverlyDescription, branchOverlyImage} = this.state;

        const revampOnBoardingContext = this.props.revamp.revampOnBoardingContext

        if (revampOnBoardingContext && revampOnBoardingContext.onBoardingStatus === REVAMP_ON_BOARDING_CONTEXT_STATUS.COMPLETED.key) {
            return (<NewHomeScreen
                {...this.props}
                branchOverlyModel={branchOverlyModel}
                branchCloseOverlay={this.branchCloseOverlay}
                branchLink={branchLink}
                branchOverlyTitle={branchOverlyTitle}
                branchOverlySubTitle={branchOverlySubTitle}
                branchOverlyDescription={branchOverlyDescription}
                branchOverlyImage={branchOverlyImage}
                handleOnContinueButton={this.handleOnContinueButton}
            />)
        }
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
                        branchCloseOverlay={this.branchCloseOverlay}
                        handleOnContinueButton={this.handleOnContinueButton}
                    />
                }
                {data && this.renderRevampHome()}
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    homeTopTextWrap: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24
    },
    mainTitleTop: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        textAlign: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        // justifyContent: 'center',
        marginTop: 32
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        // marginBottom: 8,
        marginTop: 16,
        textAlign: 'center'
    },
    subTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginTop: 16
    },
    smileWrap: {
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        // flexWrap: 'wrap'
    },
    smileIcon: {
        width: 32,
        height: 32,
        marginTop: 25,
        marginLeft: 5
    },
    homeSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        textAlign: 'center',
        paddingHorizontal: 32
    },
    serviceList: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    singleCard: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        overflow: 'hidden'
    },
    cardImgWrapper: {
        backgroundColor: Colors.colors.homeProviderImageBG,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 177
    },
    homeImg: {
        width: 120,
        alignSelf: 'center'
    },
    cardContentWrapper: {
        paddingTop: 24
    },
    contentMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    contentSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 8
    },
    contentCountText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast
    },
    gradientWrapper: {
        marginTop: 24
    },
    mainIconsWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 40,
    },
    helpBoxes:{
        display: 'flex',
        justifyContent: 'space-between',
        flexBasis: '50%',
    },
    iconViewStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'center',
        paddingTop: 38,
        paddingBottom: 38,
        width: '100%',
        height: 156,
        backgroundColor: Colors.colors.primaryColorBG,
        borderRadius: 12
    },
    iconInnnerViewStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.primaryText
    },
    editIcon: {
        bottom: 20
    },
    mainContentWrapper: {
        padding: 24
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginTop: 100,
        textAlign: 'center'
    }, subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginTop: 8,

    },
    mainVideoImage: {
        width: "100%",
        alignSelf: 'center',
    },
    buttonControls: {
        width: 295,
        marginTop: 40,
        alignSelf: 'center'
    },
    otherOption: {
        alignSelf: 'center',
        paddingTop: 20,
        color: Colors.colors.primaryTextDM,
    },
    roundVideoBtnWrapper: {
        position: "relative",
        alignSelf: 'center',
        marginTop: 20,
    },
    roundVideoBg: {
        position: "absolute",
        top: 20,
        left: 20
    },
    videoThumb: {
        position: "absolute",
        top: 15,
        left: 15,
        width: 130,
        height: 130,
        borderRadius: 135,
        overflow: "hidden",

    },
    videoPlayerWrapper: {
        // marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden'
    }
});

const gradientPlayer = {
    preloadingPlaceholder: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    thumbnail: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',

    },
    playArrow: {
        color: 'white',
        marginLeft: 5
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: 'transparent'
    },
    controls: {
        backgroundColor: 'transparent',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center'
    },
    playControl: {
        color: 'white',
        padding: 8
    },
    extraControl: {
        color: 'white',
        padding: 8
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 8
    },
    seekBarProgress: {
        height: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        opacity: 0.5
    },
    seekBarKnob: {
        backgroundColor: '#FFF'
    },
    seekBarBackground: {
        backgroundColor: '#FFF',
        height: 3,
        borderRadius: 3,
        opacity: 0.25,
        marginRight: 10
    },
    overlayButton: {
        flex: 1
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
};
export default connectConnections()(SelfScheduleStartScreen);
