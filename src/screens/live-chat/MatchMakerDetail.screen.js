import React, {Component} from 'react';
import {Image, ImageBackground, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Body, Button, Container, Header, Left, Right, Title, Content} from "native-base";
import LinearGradient from 'react-native-linear-gradient';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntIcons from 'react-native-vector-icons/AntDesign';
import GradientButton from '../../components/GradientButton';
import {Screens} from '../../constants/Screens';
import {
    CONFIDANT_HELP_EMAIL,
    CONFIDANT_CALL_NUMBER,
    CONFIDANT_TEXT_NUMBER,
    EMERGENCY_CALL_NUMBER,
    DEFAULT_IMAGE,
    S3_BUCKET_LINK, SEGMENT_EVENT
} from '../../constants/CommonConstants';
import {addTestID, AlertUtil, isIphoneX, PrimaryButton, SecondaryButton, TransactionSingleActionItem,
    VideoPlayer, getHeaderHeight, CommonStyles, Colors} from 'ch-mobile-shared';
import AlfieLoader from '../../components/Loader';
import ImageSlider from 'react-native-image-slider';
import {connectConnections} from "../../redux";
import Overlay from 'react-native-modal-overlay';
import Modal from 'react-native-modalbox';
import ProfileService from "../../services/Profile.service";
import DeepLinksService from "../../services/DeepLinksService";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class MatchMakerDetailScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const provider = navigation.getParam('provider', null);
        const patient = navigation.getParam('patient', null);
        this.referrer = navigation.getParam('referrer', null);
        this.isPatientProhibitive = navigation.getParam('isPatientProhibitive', false);
        this.mediaPlayers = [];
        this.componentReference = null;
        this.state = {
            isLoading: true,
            providerInfo: provider,
            patientInfo: patient,
            providerDetails: null,
            modalVisible: false,
            confirmModal: false,
            index: 0,
            itemSelected: null,
        };
    }

    pauseAllMedia = () => {
        this.mediaPlayers.forEach(player => {
            setTimeout(() => {
                if (player) {
                    player.pause();
                }
            }, 0)
        });
    };

    componentDidMount = async () => {
        await this.getProviderInfo();
        await this.getProviderProfileDetails();
    };

    /**
     * @function getProviderInfo
     * @description This method is used to get provider Profile.
     */
    getProviderInfo = async () => {
        this.setState({isLoading: true});
        const provider = await ProfileService.getProviderProfile(this.state.providerInfo.userId);
        if (provider.errors) {
            console.warn(provider.errors[0].endUserMessage);
            AlertUtil.showErrorMessage('Selected Matchmaker is not available');
            this.props.navigation.goBack();
        } else {
            this.setState({
                provider: provider,
                isLoading: false,
            });
        }
    };

    /**
     * @function getProviderProfileDetails
     * @description This method is used to get provider details.
     */
    getProviderProfileDetails = async () => {
        try {
            this.setState({isLoading: true});
            const providerPublicDetails = this.state.provider.providerProfile;
            if(providerPublicDetails){
                const providerDetails = {
                    backStory: providerPublicDetails && providerPublicDetails.backstory ? providerPublicDetails.backstory.trim() : null,
                    training: providerPublicDetails && providerPublicDetails.training ? providerPublicDetails.training.trim() : null,
                    philosophy: providerPublicDetails && providerPublicDetails.philosophy ? providerPublicDetails.philosophy.trim() : null,
                    providerImages: providerPublicDetails && providerPublicDetails.providerImages ? providerPublicDetails.providerImages : null,
                }
                this.setState({
                    providerDetails: providerDetails,
                    itemSelected: providerPublicDetails && providerPublicDetails.providerImages && providerPublicDetails.providerImages.length>0  ? providerPublicDetails.providerImages[0] : S3_BUCKET_LINK + DEFAULT_IMAGE,
                    isLoading: false,
                });
            }else{
                this.setState({
                    itemSelected: null,
                    isLoading: false,
                });
            }
        }catch (e) {
            AlertUtil.showErrorMessage(e);
        }
    }

    handleModal = () => {
        this.setState({modalVisible: false});
    };

    /**
     * @function goBack
     * @description This method is used to navigate back from the screen.
     */
    goBack = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function newConnectionSegmentEvent
     * @description This method is used to capture segment event for new connection.
     */
    newConnectionSegmentEvent = async ()=>{
        let {providerInfo} = this.state;
        const segmentPayload = {
            userId: this.props?.auth?.meta?.userId,
            providerId: providerInfo?.userId,
            connectedAt: moment.utc(Date.now()).format(),
            providerName: providerInfo?.name,
            providerRole: providerInfo?.designation
        };
        await Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);
    }

    /**
     * @function makeConnection
     * @description This method is used to make connection between matchmaker.
     */
    makeConnection = async () => {
        let {providerInfo, patientInfo} = this.state;
        this.props.connect({
            userId: providerInfo.userId,
            onSuccess: async () => {
                const allowProviderAccess = {
                    providerId: providerInfo.userId,
                    allowed: true
                };
                this.props.updateProviderAccess(allowProviderAccess);
                await this.newConnectionSegmentEvent();
                this.props.navigation.navigate(providerInfo.type === "PRACTITIONER" ? Screens.PROVIDER_DETAIL_SCREEN : Screens.MATCH_MAKER_DETAIL_SCREEN, {
                    provider: providerInfo,
                    patient: patientInfo,
                    referrer: Screens.PROVIDER_ACCESS_SCREEN,
                    providerChatOpen: false
                });
            },
            onFailure: () => {
                AlertUtil.showErrorMessage('Unable to connect at the moment. Please try again later');
            }
        });
    }

    connectWithProvider = () => {
        this.makeConnection();
    };

    checkVideoPlayer = () => {
        if (this.componentReference && this.componentReference.player) {
            this.componentReference.player.props.onEnd();
        }
    }

    recommendProviderProfile = async channel => {
        const {providerInfo} = this.state;
        let providerId = providerInfo.userId;
        await DeepLinksService.recommendProviderProfileLink(
            channel,
            providerId
        );
    };


    startConversation = () => {
        this.checkVideoPlayer();
        const filteredConnection = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.state.providerInfo.userId);
        if (filteredConnection.length > 0) {
            const connection = filteredConnection[0];
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                referrer: Screens.PROVIDER_DETAIL_SCREEN,
                provider: this.state.providerInfo,
                patient: this.state.patientInfo,
                connection,
            });
        }
    };

    /**
     * @function disconnectProvider
     * @description This method is used to disconnect with provider.
     */
    disconnectProvider = async () => {
        const {providerInfo} = this.state;
        this.onClose();
        this.props.disconnect({
            userId: providerInfo.userId,
        });
    };

    onClose = () => {
        this.setState({modalVisible: false});
    };

    showConfirm = () => {
        this.setState({
            confirmModal: true,
        });
    };

    closeConfirm = () => {
        this.setState({
            confirmModal: false,
        });
    };

    navigateToAccessSelection = () => {
        const {providerInfo,patientInfo} = this.state;
        this.checkVideoPlayer();
        this.props.navigation.navigate(Screens.PROVIDER_ACCESS_SCREEN, {
            patientInfo,
            providerInfo
        });
    };

    helpDrawerClose = () => {
        this.refs?.modalContact.close();
    };

    setSelectedIndex = (index, item) => {
        this.setState({index: index, itemSelected: item})
    };


    /**
     * @function getFeedbackSummary
     * @description This method is used to get feedback summary of provider.
     */
    getFeedbackSummary = async () => {
        const {providerInfo} = this.state;
        const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(providerInfo.userId);
        if (feedbackSummaryDetails.errors) {
            return null;
        } else {
            return feedbackSummaryDetails;
        }
    };


    /**
     * @function requestAppointment
     * @description This method is used to get selected provider info & moved to the service screen.
     */
    requestAppointment = async () => {
        if(this.isPatientProhibitive)
        {
            this.navigateToProhibitiveScreen()
        }else
        {
            this.checkVideoPlayer();
            this.onClose();
            const {providerInfo,provider} = this.state;
            const selectedProvider = {
                name: providerInfo.name,
                userId: providerInfo.userId,
                profilePicture: providerInfo.profilePicture,
                designation : provider?.designation,
                fixedProvider: true,
                referrerScreen: Screens.MATCH_MAKER_DETAIL_SCREEN,
                speciality: provider.speciality.join(','),
                totalReviews: 0,
                combinedRating: 0,
            }
            const feedbackSummary = await this.getFeedbackSummary();
            if(feedbackSummary) {
                selectedProvider.totalReviews= feedbackSummary.totalReviews;
                selectedProvider.combinedRating= feedbackSummary.combinedRating;
            }
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                selectedProvider
            });
        }
    };
    navigateToProhibitiveScreen = ()=>{
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }

    render = () => {
        StatusBar.setBarStyle('dark-content', true);

        const {providerInfo} = this.state;
        const isConnected = this.props.connections.activeConnections.filter((connection) => {
            return connection.connectionId === providerInfo.userId;
        }).length > 0;

        const isRequested = this.props.connections.requestedConnections.filter((connection) => {
            return connection.connectionId === providerInfo.userId;
        }).length > 0;

        const providerAccess = this.props.profile.providerAccess && this.props.profile.providerAccess.allowedProviders.includes(providerInfo.userId);

        if (this.state.isLoading || this.props.connections.isLoading) {
            return (
                <AlfieLoader/>);
        }

        return (
            <Container>
                <Header noShadow transparent style={styles.matchMakerHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            {...addTestID('Go-Back')}
                            style={{width: 30, marginLeft: 12}} onPress={this.goBack} transparent>
                            <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                        </Button>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title style={styles.headerText}>Matchmaker</Title>
                    </Body>
                    <Right>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 0}}
                                onPress={() => {
                                    this.setState({modalVisible: true});
                                }}
                        >
                            {/*<Image source={require('../../assets/images/Question.png')}/>*/}
                            <AntIcons name="questioncircle" size={24} color={Colors.colors.mainBlue}/>
                        </Button>
                    </Right>
                </Header>


                <ScrollView showsVerticalScrollIndicator={false}
                            ref={scrollView => (this.scrollView = scrollView)}
                >
                    <View style={styles.matchHeadingView}>
                        <Text style={styles.matchHeading}>You’ve been matched with</Text>
                        <Text style={styles.matchMakerName}>{providerInfo.name}</Text>
                    </View>


                    <View style={styles.stickyPlayer}>
                        {
                            this.state.itemSelected && (
                                this.state.itemSelected.includes('mp4') ?
                                    <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}}
                                                    colors={['rgba(37,52,92,0.5)', 'rgba(37,52,92,0.5)', 'rgba(37,52,92,0.5)']}
                                                    style={styles.playerBG}>

                                        <VideoPlayer
                                            {...addTestID('Video-Player')}
                                            ref={(ref) => {
                                                this.componentReference = ref;
                                            }}
                                            thumbnail={{uri: this.state.providerInfo.avatar ? this.state.providerInfo.avatar.includes(S3_BUCKET_LINK) ? this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                            endThumbnail={{uri: this.state.providerInfo.avatar ? this.state.providerInfo.avatar.includes(S3_BUCKET_LINK) ? this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                            endWithThumbnail
                                            //video={{uri: 'http:' + this.state.itemSelected.fields.file.url}} //static audio link
                                            video={{uri: this.state.itemSelected}} //static audio link
                                            disableControlsAutoHide
                                            onPlayPress={this.pauseAllMedia}
                                            onStart={this.pauseAllMedia}
                                            pauseOnPress
                                            disableFullscreen={true}
                                            resizeMode='cover'
                                            style={styles.skPlayer}
                                            customStyles={gradientPlayer}
                                            playArrowSize={28}
                                        />
                                    </LinearGradient>:
                                    <Image source={{uri: this.state.itemSelected}} style={styles.playerBG}/>

                            )
                        }
                    </View>

                    {this.state.providerDetails && this.state.providerDetails.providerImages && (

                        <ImageSlider
                            style={styles.imageSlider}
                            //loopBothSides
                            //autoPlayWithInterval={3000}
                            images={this.state.providerDetails.providerImages}
                            customSlide={({index, item, style, width}) => {
                                return (
                                    //item.fields && (
                                    item && (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                this.setSelectedIndex(index, item)
                                            }}>
                                            <View>
                                                {
                                                    item.includes('mp4') ?
                                                        <View>
                                                            <ImageBackground
                                                                source={{uri: this.state.providerInfo.avatar ? this.state.providerInfo.avatar.includes(S3_BUCKET_LINK) ? this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + this.state.providerInfo.avatar.replace('_thumbnail', '') : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                                                style={this.state.index === index ? [styles.sliderImages, {
                                                                    borderWidth: 4,
                                                                    borderColor: '#3FB2FE'
                                                                }] : styles.sliderImages}
                                                                //resizeMode="contain"

                                                            >
                                                                <View style={styles.playButton}>
                                                                    <AwesomeIcon name="play" size={10} color="#fff"/>
                                                                </View>
                                                            </ImageBackground>
                                                        </View>
                                                        :
                                                        //<Image source={{uri: 'http:' + item.fields.file.url}}
                                                        <Image source={{uri: item}}
                                                               style={this.state.index === index ? [styles.sliderImages, {
                                                                   borderWidth: 4,
                                                                   borderColor: '#3FB2FE'
                                                               }] : styles.sliderImages}
                                                        />
                                                }

                                            </View>
                                        </TouchableOpacity>
                                    )
                                )
                            }}
                            customButtons={(position, move) => (
                                <View>
                                    <Text>{''}</Text>
                                </View>
                            )}
                        />

                    )}


                    {/*{isConnected ?*/}
                    {/*    <View style={styles.providerContent}>*/}
                    {/*        <View style={styles.borderItem}>*/}
                    {/*            <Button*/}
                    {/*                {...addTestID('Navigatr-To-Access-Selection')}*/}
                    {/*                transparent style={{height: 'auto'}}*/}
                    {/*                onPress={() => {*/}
                    {/*                    this.navigateToAccessSelection();*/}
                    {/*                }}>*/}

                    {/*                <View style={styles.radioText}>*/}
                    {/*                    <Text style={styles.blackText}>*/}
                    {/*                        {providerAccess ? 'Full Access' : 'No Access'}</Text>*/}
                    {/*                    <Text style={styles.smallText}>*/}
                    {/*                        {providerAccess ? 'Matchmaker can see all your information to help you to reach your personal goals.' : 'Your Matchmaker will only have access to your general information.'}</Text>*/}
                    {/*                </View>*/}
                    {/*                <AwesomeIcon name="angle-right" size={35} color="#4FACFE"/>*/}
                    {/*            </Button>*/}
                    {/*        </View>*/}
                    {/*    </View>*/}
                    {/*    : null*/}
                    {/*}*/}

                    <View style={styles.matchMakerDetail}>
                        {this.state.providerDetails && this.state.providerDetails.backStory && (
                            <View>
                                <Text style={styles.headText}>BACKSTORY</Text>
                                <Text style={styles.parahText}>{this.state.providerDetails.backStory}</Text>
                            </View>
                        )}

                        {this.state.providerDetails && this.state.providerDetails.training && (
                            <View>
                                <Text style={styles.headText}>TRAINING</Text>
                                <Text style={styles.parahText}>{this.state.providerDetails.training}</Text>
                            </View>
                        )}

                        {this.state.providerDetails && this.state.providerDetails.training && (
                            <View>
                                <Text style={styles.headText}>PHILOSOPHY</Text>
                                <Text style={styles.parahText}>{this.state.providerDetails.philosophy}</Text>
                            </View>
                        )}
                    </View>

                    {
                        isConnected ?
                            <View style={styles.connectivityBtns}>
                                <View style={styles.singleBtn}>
                                    <PrimaryButton
                                        onPress={this.requestAppointment}
                                        text={'Request Appointment'}
                                    />
                                </View>
                                <SecondaryButton
                                    onPress={() => {
                                        this.recommendProviderProfile('facebook');
                                    }}
                                    text={'Recommend matchmaker'}
                                />
                                <View style={styles.singleBtn}>
                                    <SecondaryButton
                                        onPress={this.showConfirm}
                                        text={'Disconnect'}
                                        bgColor={Colors.colors.errorBG}
                                        textColor={Colors.colors.errorText}
                                        borderColor={Colors.colors.errorText}
                                    />
                                </View>

                                {/*<LinearGradient*/}
                                {/*    start={{x: 0, y: 1}}*/}
                                {/*    end={{x: 1, y: 0}}*/}
                                {/*    colors={['#4FACFE', '#34b6fe', '#00C8FE']}*/}
                                {/*    style={styles.gButton}*/}
                                {/*>*/}
                                {/*    <Button*/}
                                {/*        {...addTestID('Request-Appointment')}*/}
                                {/*        transparent*/}
                                {/*        style={styles.fabBtn}*/}
                                {/*        onPress={this.requestAppointment}*/}
                                {/*    >*/}
                                {/*        <Text style={styles.fabBtnText}>Request Appointment</Text>*/}
                                {/*    </Button>*/}

                                {/*</LinearGradient>*/}

                                {/*<Button*/}
                                {/*    {...addTestID('Scroll-to-Top')}*/}
                                {/*    style={{...styles.outlineBtn, borderColor: '#3fb2fe'}}*/}
                                {/*    onPress={() => {*/}
                                {/*        this.recommendProviderProfile('facebook');*/}
                                {/*    }}>*/}
                                {/*    <Text style={{...styles.outlineText, color: '#3fb2fe'}}>*/}
                                {/*        Recommend matchmaker*/}
                                {/*    </Text>*/}
                                {/*</Button>*/}



                                {/*<Button*/}
                                {/*    {...addTestID('Disconnect')}*/}
                                {/*    style={styles.outlineBtn}*/}
                                {/*    onPress={this.showConfirm}*/}
                                {/*>*/}
                                {/*    <Text style={styles.outlineText}>Disconnect</Text>*/}
                                {/*</Button>*/}



                            </View> : null
                    }

                    <View style={styles.proInfoFooter}>
                        <PrimaryButton
                            testId="requested"
                            style={styles.infoBtn}
                            disabled={isRequested}
                            onPress={() => {
                                if (isConnected) {
                                    this.startConversation();
                                } else if (!isRequested) {
                                    this.connectWithProvider();
                                }
                            }}
                            text={isConnected ? 'GO TO CHAT' : isRequested ? 'CONNECTION REQUESTED' : 'CONNECT WITH MATCHMAKER'}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                this.refs?.modalContact?.open()
                            }}
                        >
                            <Text style={styles.footerText}>Contact Confidant with Questions</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>


                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.helpDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '45%',
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalContact"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.contactHeader}>Contact Confidant</Text>

                            <View style={{ marginBottom: 8 }}>
                                <TransactionSingleActionItem
                                    title={'Email Confidant'}
                                    iconBackground={Colors.colors.primaryColorBG}
                                    onPress={() => {
                                        this.checkVideoPlayer();
                                        Linking.openURL('mailto:' + CONFIDANT_HELP_EMAIL + '')
                                    }}
                                    renderIcon={(size, color) =>
                                        <AntIcons size={22} color={Colors.colors.mainBlue} name="mail"/>
                                    }
                                />
                            </View>

                            <View style={{ marginBottom: 8 }}>
                                <TransactionSingleActionItem
                                    title={'Call Confidant'}
                                    iconBackground={Colors.colors.secondaryColorBG}
                                    onPress={() => {
                                        this.checkVideoPlayer();
                                        Linking.openURL('tel:' + CONFIDANT_CALL_NUMBER + '')
                                    }}
                                    renderIcon={(size, color) =>
                                        <AntIcons size={22} color={Colors.colors.secondaryIcon} name="phone"/>
                                    }
                                />
                            </View>

                            <View style={{ marginBottom: 8 }}>
                                <TransactionSingleActionItem
                                    title={'Text Confidant'}
                                    iconBackground={Colors.colors.successBG}
                                    onPress={() => {
                                        this.checkVideoPlayer();
                                        Linking.openURL('sms:' + CONFIDANT_TEXT_NUMBER + '')
                                    }}
                                    renderIcon={(size, color) =>
                                        <AntIcons size={22} color={Colors.colors.successIcon} name="message1"/>
                                    }
                                />
                            </View>


                            {/*<LinearGradient*/}
                            {/*    start={{x: 0, y: 1}}*/}
                            {/*    end={{x: 1, y: 0}}*/}
                            {/*    colors={['#4FACFE', '#34b6fe', '#00C8FE']}*/}
                            {/*    style={styles.gButton}*/}
                            {/*>*/}
                            {/*    <Button*/}
                            {/*        {...addTestID('Email-Confidant')}*/}
                            {/*        transparent*/}
                            {/*        style={styles.fabBtn}*/}
                            {/*        onPress={() => {*/}
                            {/*            this.checkVideoPlayer();*/}
                            {/*            Linking.openURL('mailto:' + CONFIDANT_HELP_EMAIL + '')*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <Text style={styles.fabBtnText}>Email Confidant</Text>*/}
                            {/*    </Button>*/}
                            {/*</LinearGradient>*/}
                            {/*<LinearGradient*/}
                            {/*    start={{x: 0, y: 1}}*/}
                            {/*    end={{x: 1, y: 0}}*/}
                            {/*    colors={['#4FACFE', '#34b6fe', '#00C8FE']}*/}
                            {/*    style={styles.gButton}*/}
                            {/*>*/}
                            {/*    <Button*/}
                            {/*        {...addTestID('Call-Confidant')}*/}
                            {/*        transparent*/}
                            {/*        style={styles.fabBtn}*/}
                            {/*        onPress={() => {*/}
                            {/*            this.checkVideoPlayer();*/}
                            {/*            Linking.openURL('tel:' + CONFIDANT_CALL_NUMBER + '')*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <Text style={styles.fabBtnText}>Call Confidant</Text>*/}
                            {/*    </Button>*/}
                            {/*</LinearGradient>*/}
                            {/*<LinearGradient*/}
                            {/*    start={{x: 0, y: 1}}*/}
                            {/*    end={{x: 1, y: 0}}*/}
                            {/*    colors={['#4FACFE', '#34b6fe', '#00C8FE']}*/}
                            {/*    style={styles.gButton}*/}
                            {/*>*/}
                            {/*    <Button*/}
                            {/*        {...addTestID('Text-Confidant')}*/}
                            {/*        transparent*/}
                            {/*        style={styles.fabBtn}*/}
                            {/*        onPress={() => {*/}
                            {/*            this.checkVideoPlayer();*/}
                            {/*            Linking.openURL('sms:' + CONFIDANT_TEXT_NUMBER + '')*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <Text style={styles.fabBtnText}>Text Confidant</Text>*/}
                            {/*    </Button>*/}
                            {/*</LinearGradient>*/}
                        </View>
                    </Content>
                </Modal>


                <Overlay
                    containerStyle={styles.confirmOverlay}
                    childrenWrapperStyle={styles.confirmWrapper}
                    animationOutType={'slide'}
                    visible={this.state.confirmModal}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.confirmHeader}>
                            Are you sure you want to disconnect? This will also cancel all your appointments with
                            {' ' + this.state.providerInfo.name}.
                        </Text>
                        <View style={styles.confirmBtns}>
                            <Button
                                {...addTestID('Disconnect-Provider')}
                                style={{...styles.outlineBtn, flex: 1, marginBottom: 0, marginTop: 10}}
                                onPress={() => {
                                    this.disconnectProvider();
                                    this.setState({
                                        confirmModal: false,
                                    });
                                }}
                            >
                                <Text style={styles.outlineText}>Yes, Disconnect</Text>
                            </Button>
                            <View style={styles.noBtn}>
                                <GradientButton
                                    testId="no"
                                    onPress={this.closeConfirm}
                                    text="No"
                                />
                            </View>
                        </View>
                    </View>

                </Overlay>

                <Overlay
                    containerStyle={styles.confirmOverlay}
                    childrenWrapperStyle={styles.confirmWrapper}
                    closeOnTouchOutside={true}
                    animationOutType={'slide'}
                    onClose={this.handleModal}
                    visible={this.state.modalVisible}>
                    <View>
                        <Text style={styles.popupTitle}>About Your Matchmaker</Text>
                        <Text style={styles.popupDesc}>Matchmakers are here to support you in navigating your personal
                            journey through Confidant. They can answer questions, introduce you to medical providers,
                            help you set appointments, and be a friendly personal to talk to.</Text>
                        <Text style={styles.popupDesc}>They have been trained by the Confidant medical team, but they do
                            not provide any clinical services or medical advice. They are not your doctor or
                            psychologist or therapist. As a reminder, Confidant is not an emergency service and if you
                            need immediate assistance please call <Text style={styles.linkText}
                                                                        onPress={() => Linking.openURL(`tel:${EMERGENCY_CALL_NUMBER}`)}>911</Text>.</Text>

                        <PrimaryButton
                            testId="okay"
                            style={styles.infoBtn} onPress={this.handleModal}
                            text="Okay"
                        />
                    </View>
                </Overlay>

            </Container>
        );
    };
}

const commonText = {
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
};
const styles = StyleSheet.create({
    contactHeader: {
        color: Colors.colors.primaryText,
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 16,
        paddingLeft: 18,
        paddingRight: 18,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingLeft: 24,
        paddingRight: 24,
        height: 300
    },
    providerContent: {
        marginTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        backgroundColor: '#ffffff',
    },
    borderItem: {
        borderColor: '#f5f5f5',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 16,
        paddingBottom: 16,
        shadowColor: '#f5f5f5',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
    },
    radioText: {
        paddingRight: 20,
    },
    blackText: {
        fontSize: 14,
        fontFamily: 'Roboto-Bold',
        textAlign: 'left',
        letterSpacing: 0.47,
        color: '#515d7d',
        marginBottom: 5,
    },
    smallText: {
        fontFamily: 'Roboto-Regular',
        lineHeight: 19,
        fontSize: 13,
        color: '#515d7d',
        textAlign: 'left',
    },
    matchMakerHeader: {
        height: HEADER_SIZE,
        elevation: 0,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
    },
    sliderImages: {
        height: 64,
        width: 88,
        marginRight: 16,
    },

    backButton: {
        marginLeft: 15,
    },
    headerText: {
        color: "#25345c",
        fontFamily: "Roboto-Regular",
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        alignSelf: 'center'
    },
    matchHeadingView: {
        paddingTop: 40,
        paddingBottom: 40,
    },
    matchHeading: {
        ...commonText,
        color: '#25345c',
        textAlign: 'center',
        fontSize: 20,
        lineHeight: 20,
        letterSpacing: 0.833333,
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },

    confirmHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center'
    },
    confirmWrapper: {
        height: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 40 : 25,
        paddingTop: 36,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 3,
        shadowOffset: {width: 0, height: 10},
        shadowColor: '#f5f5f5',
        shadowOpacity: 0.5
    },
    matchMakerName: {
        ...commonText,
        color: '#EC0D4E',
        textAlign: 'center',
        fontSize: 20,
        lineHeight: 20,
        letterSpacing: 0.833333,
        marginTop: 16,
        paddingHorizontal: 24
    },
    proInfoFooter: {
        backgroundColor: '#fff',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 15,
        paddingBottom: isIphoneX() ? 40 : 20,
        borderColor: 'rgba(0,0,0, 0.05)',
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.05)'
    },
    infoBtn: {
        alignSelf: 'center',
    },
    matchMakerDetail: {
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
    },
    headText: {
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'bold',
        color: '#515D7D',
        fontSize: 12,
        marginBottom: 16,
        lineHeight: 14,
        letterSpacing: 0.75,
        marginTop: 40,
        textTransform: 'uppercase',
    },
    parahText: {
        ...commonText,
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'left',
        color: '#646C73',
    },

    footerText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 20,
        alignSelf: 'center',
        color: '#3FB2FE',
        letterSpacing: 0,
        paddingTop: 20,
        textAlign: 'center'
    },
    stickyPlayer: {
        height: 240
    },
    playerBG: {
        flex: 1
    },
    skPlayer: {
        height: 240,
        backgroundColor: 'transparent',
    },

    imageSkPlayer: {
        backgroundColor: 'transparent',
        height: 64,
        width: 88,
        marginRight: 16,
    },
    popupTitle: {
        ...commonText,
        fontSize: 17,
        color: '#25345C',
        marginTop: 16,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 18,
        letterSpacing: 0.8,
    },
    popupDesc: {
        ...commonText,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left',
        color: '#646C73',
        marginBottom: 24,
        letterSpacing: 0.34285,
    },
    imageSlider: {
        paddingTop: 16,
        paddingLeft: 12,
        backgroundColor: '#fff',
    },
    playButton: {
        backgroundColor: '#3FB2FE',
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignSelf: 'center',
        top: '30%',

    },
    connectivityBtns: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 20,
    },
    singleBtn: {
        marginBottom: 16
    },
    gButton: {
        width: '100%',
        borderRadius: 4,
        height: 48,
        marginBottom: 24,
    },
    fabBtn: {
        justifyContent: 'center',
    },
    fabBtnText: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 19.5,
        textAlign: 'center',
        letterSpacing: 0.7,
        fontFamily: 'Roboto-Bold',
        textTransform: 'uppercase'
    },
    outlineBtn: {
        borderColor: '#d0021b',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        marginBottom : 20,
        elevation: 0,
    },
    outlineText: {
        color: '#d0021b',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    linkText: {
        color: '#00C8FE',
        fontFamily: "Roboto-Regular",
        fontWeight: "300",
        fontSize: 14,
        textAlign: 'justify',
        marginBottom: 5,
        lineHeight: 20,
    },
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
        alignItems: 'center'
    },
    playButton: {
        backgroundColor: '#3FB2FE',
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    playArrow: {
        color: 'white',
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
    }
};


export default connectConnections()(MatchMakerDetailScreen);
