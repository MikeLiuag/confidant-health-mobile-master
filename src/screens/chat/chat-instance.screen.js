import React, {Component} from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {Avatar, GiftedChat} from 'react-native-gifted-chat';
import {connectChat} from "../../redux";
import {ConnectionStatus} from 'botframework-directlinejs';
import uuid from 'uuid';
import CustomMessage from '../../components/chat/CustomMessage';
import {Body, Button, Container, Content, Header, Left, Right, Title} from 'native-base';
import {
    CHATBOT_DEFAULT_AVATAR,
    S3_BUCKET_LINK,
    SEGMENT_EVENT,
    START_NEW_CHATBOT
} from '../../constants/CommonConstants';
import {
    addTestID,
    BackButton,
    Colors,
    CommonStyles,
    getAvatar,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
    TransactionSingleActionItem
} from 'ch-mobile-shared';
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/alfie-face-new';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Modal from "react-native-modalbox";
import {Screens} from '../../constants/Screens';
import Analytics from "@segment/analytics-react-native";
import moment from "moment";
import FeatherIcons from "react-native-vector-icons/Feather";
import LineIcons from "react-native-vector-icons/SimpleLineIcons";
import { ContentLoader } from '../../components/content-loader/ContentLoader';

const HEADER_SIZE = getHeaderHeight();

class ChatInstance extends Component<Props> {
    connectionStatus = {
        '0': 'Uninitialized',
        '1': 'Connecting...',
        '2': 'Connected',
        '3': 'Token expired',
        '4': 'Failed to connect',
        '5': 'Closed',
    };

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            answerOverlayVisible: true,

        };
        /*
        this.hideOverlaySub = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.props.chatPaused();
            },
        );
        */
       this.props.chatResumed();
    }


    componentWillMount = async () => {
        const {chat} = this.props;
        this.contact = this.props.navigation.getParam('contact', null);
        if (chat && this.contact) {
            this.props.chatRequestInitialize({
                payload: {
                    contact: this.contact,
                    isConnectedBefore: chat.isConnectedBefore,
                    watermark: 0,
                    conversationContext: chat.conversationContext,
                    pendingAutoReply: chat.pendingAutoReply,
                },
                meta: {
                    contact: this.contact,
                },
            });

            if (this.contact.type === 'CHAT_BOT') {
                Analytics.track(SEGMENT_EVENT.CHATBOT_OPENED, {
                    userId: this.props.auth.meta.userId,
                    chatbotName: this.contact.name,
                    openedAt: moment.utc(Date.now()).format(),
                });
            }


        }
    };

    componentDidMount(): void {
        this.showOverlaySub = this.props.navigation.addListener(
            'willFocus',
            payload => {
                // this.shouldResume = true;
                // this.props.chatResumed();
            },
        );


    }

    /**
     * Closing open subscriptions
     * Clear/Reset Redux state
     */
    componentWillUnmount = () => {
        if (this.showOverlaySub) {
            this.showOverlaySub.remove();
        }
        if (this.hideOverlaySub) {
            this.hideOverlaySub.remove();
        }
        const contact = this.props.navigation.getParam('contact', null);
        if (contact) {
            this.props.chatExit({
                meta: {
                    contact,
                },
            });

            if (contact.type === 'CHAT_BOT') {
                Analytics.track(SEGMENT_EVENT.CHATBOT_CLOSED, {
                    userId: this.props.auth.meta.userId,
                    chatbotName: contact.name,
                    closedAt: moment.utc(Date.now()).format(),
                });
            }
        }
    };
    onSend = messages => {
        Keyboard.dismiss();
        const {chat} = this.props;
        const contact = this.props.navigation.getParam('contact', null);
        messages.forEach(message => {
            if (message.text.trim() === '') {
                return;
            }
            message.type = 'message';
            message.from = {
                id:
                    chat.conversationContext.patientId +
                    ',' +
                    chat.conversationContext.contactId,
                name: 'User', //TODO change this to current user name
            };
            message.user = {
                _id:
                    chat.conversationContext.patientId +
                    ',' +
                    chat.conversationContext.contactId,
                name: 'User', //TODO change this to current user name
            };
            message._id = uuid.v4();
            message.createdAt = new Date();
            this.props.chatSendMessage({
                payload: message,
                meta: {contact},
            });
        });

    };
    renderFooter = props => {
        const {chat} = this.props;
        if (chat.typingText) {
            const avatarProps = {
                position: 'left',
                imageStyle: {
                    left: {
                        marginLeft: 8,
                    },
                },
                currentMessage: {
                    user: {
                        avatar: this.contact.profilePicture,
                    },
                },
            };
            return (
                <View style={{flexDirection: 'row'}}>
                    {/*<View style={{flexDirection: 'row',*/}
                    {/*    marginBottom: 20}}>*/}
                    {/*    <Avatar {...avatarProps} />*/}
                    {/*</View>*/}
                    {/*<View style={styles.typing}>*/}
                    {/*    <Image*/}
                    {/*        style={{width: 48, height: 18}}*/}
                    {/*        source={require('./../../assets/images/typing.gif')}*/}
                    {/*    />*/}
                    {/*</View>*/}
                </View>


            );
        } else {
            return null;
        }
    };

    renderInitTyping = props => {
        const {chat} = this.props;
        if (chat.initTyping) {
            const avatarProps = {
                position: 'left',
                imageStyle: {
                    left: {
                        marginLeft: 8,
                    },
                },
                currentMessage: {
                    user: {
                        avatar: this.contact.profilePicture,
                    },
                },
            };
            return (
                <View style={{flexDirection: 'row'}}>
                    <View style={{
                        flexDirection: 'row',
                        marginBottom: 20
                    }}>
                        <Avatar {...avatarProps} />
                    </View>
                    <View style={styles.typing}>
                        <Image
                            style={{width: 48, height: 18}}
                            source={require('./../../assets/images/typing.gif')}
                        />
                    </View>
                </View>
            );
        } else {
            return null;
        }
    };


    findConnectionAvatar = (connectionId) => {
        let avatar = this._findAvatar(connectionId, this.props.connections.activeConnections);
        if (!avatar) {
            avatar = this._findAvatar(connectionId, this.props.connections.pastConnections);
        }
        return avatar ? getAvatar({profilePicture: avatar}) : CHATBOT_DEFAULT_AVATAR;
    };

    _findAvatar(connectionId, connections) {
        const filtered = connections.filter(conn => conn.connectionId === connectionId);
        if (filtered.length > 0) {
            return filtered[0].profilePicture;
        }
    };

    renderMessage = (props) => {
        props.parentComponentId = this.props.componentId;
        props.navigation = this.props.navigation;
        props.onSend = this.onSend;
        props.organizationId = this.contact.connectionId;
        props.organizationName = this.contact.name;
        props.navigateToNextScreen = this.navigateToNextScreen;
        props.navigateToServices = this.navigateToServices;
        props.currentMessage.user.avatar = this.findConnectionAvatar(this.contact.connectionId);
        props.chatResumed = this.props.chatResumed;
        return <CustomMessage {...props} />;
    };


    navigateToNextScreen = (type, additionalPayload) => {
        if (type === 'PAYMENT') {
            this.props.navigation.navigate(Screens.MY_WALLET_SCREEN);
        } else if (type === 'PROVIDERS_LIST') {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN);

        } else if (type === 'SERVICES_LIST') {
            this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN);
        } else if (type === 'FILTERED_PROVIDER_LIST') {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                selectedFilter: additionalPayload,
            });
        } else if (type === 'BACK') {
            this.props.navigation.goBack();
        }
    };

    renderComposer = props => {
        //CH-6463: Removed Type Something to Get Started
        return null;
    };

    navigateBack() {
        this.props.navigation.goBack();
    }

    renderSend = props => {
        //CH-6463: Removed Type Something to Get Started
        return null;
    };

    onClose() {
        this.setState({
            modalVisible: false,
        });
        this.refs.modalOption.close();
    }

    showModal() {
        this.refs.modalOption.open();
        this.setState({
            modalVisible: true,
        });
        this.props.chatPaused();
    }

    showProviderSearch = () => {
        this.shouldResume = false;
        this.onClose();
        this.props.navigation.navigate(Screens.PROVIDER_LIST_SCREEN, {
            userId: this.props.auth.meta.userId,
            nickName: this.props.auth.meta.nickname,
            organizationId: this.contact.connectionId,
            organizationName: this.contact.name,
        });
    };

    showAssessment = () => {
        this.shouldResume = false;
        this.onClose();
        this.props.navigation.navigate(Screens.TAKE_ASSESSMENT_SCREEN, {
            contact: this.props.navigation.getParam('contact', null),
        });
    };

    loadEarlier = () => {
        const {chat} = this.props;
        this.props.chatLoadEarlier({
            payload: {
                watermark: chat.watermark,
            },
            meta: {
                contact: this.contact,
            },
        });
    };

    showAlfieProfile = () => {
        const contact = this.props.navigation.getParam('contact', null);
        this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {
            contact,
            refScreen: Screens.CHAT_INSTANCE.toString()
        });
    };

    getContentType = (message) => {
        return (message &&
            message.attachments &&
            message.attachments.length &&
            message.attachments[0].contentType) || message.type;
    };

    renderAdditionalActions = () => {
        let action = null;
        if (this.props.chat.chatPaused) {
            action = (<View style={styles.resumeContainer}>
                <PrimaryButton
                    testId="resume-chat"
                    text="Resume Chat"
                    onPress={() => {
                        this.props.chatResumed();
                    }}
                />
            </View>);
        }
        return action;
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        let connectionStatus = 0;
        const {chat} = this.props;
        const contact = this.props.navigation.getParam('contact', null);
        connectionStatus = chat.connectionStatus;
        if (connectionStatus === ConnectionStatus.Online) {
            return (

                <Container style={styles.mainBG}>
                    {
                        !this.props.chat.chatPaused &&
                        <View style={styles.innerContainer}>
                            <ContentLoader type="chat-bot-loader" numItems="1"/>
                        </View>
                    }
                    <Header noShadow={false} transparent style={styles.chatHeader}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left style={{flex: 0, width: 54}}>
                            <BackButton
                                {...addTestID('back')}
                                onPress={() => this.navigateBack()}
                            />
                        </Left>
                        <Body style={styles.headerRow}>
                            <TouchableOpacity
                                {...addTestID('Show-Alfie-Profile')}
                                onPress={this.showAlfieProfile}
                                style={styles.avatarContainer}>

                                <Image
                                    {...addTestID('Profile-Picture')}
                                    style={styles.avatar}
                                    resizeMode={'cover'}
                                    source={{uri: contact.profilePicture ? S3_BUCKET_LINK + contact.profilePicture : CHATBOT_DEFAULT_AVATAR}}
                                />

                                {/*{contact.profilePicture ?*/}
                                {/*    <Image*/}
                                {/*        {...addTestID('Profile-Picture')}*/}
                                {/*        style={styles.avatar}*/}
                                {/*        resizeMode={'cover'}*/}
                                {/*        source={{ uri: S3_BUCKET_LINK + contact.profilePicture }}*/}
                                {/*    />*/}
                                {/*    :*/}
                                {/*    <View style={{*/}
                                {/*        ...styles.proBg,*/}
                                {/*        backgroundColor: contact.colorCode ? contact.colorCode : DEFAULT_AVATAR_COLOR,*/}
                                {/*    }}><Text*/}
                                {/*        style={styles.proLetter}>{contact.name.charAt(0).toUpperCase()}</Text></View>*/}
                                {/*}*/}
                                {/*<View style={styles.state} />*/}
                                <Title style={styles.headerText}>{contact.name}</Title>
                            </TouchableOpacity>
                        </Body>
                        <Right>
                            <Button
                                {...addTestID('Show-Model')}
                                transparent
                                style={{zIndex: 10, marginRight: 10}}
                                onPress={() => {
                                    this.showModal();
                                }}
                            >
                                <Ionicon name='ios-more' size={30}
                                         color={Colors.colors.primaryIcon}/>
                            </Button>
                        </Right>
                    </Header>


                    <Modal
                        backdropPressToClose={true}
                        backdropColor={Colors.colors.overlayBg}
                        backdropOpacity={1}
                        onClosed={() => {
                            this.onClose();
                        }}
                        style={{
                            ...CommonStyles.styles.commonModalWrapper,
                            maxHeight: '30%'
                        }}
                        entry={"bottom"}
                        position={"bottom"} ref={"modalOption"} swipeArea={100}>
                        <View style={{...CommonStyles.styles.commonSwipeBar}}
                              {...addTestID('swipeBar')}
                        />
                        <Content showsVerticalScrollIndicator={false}>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={'Find Matchmakers'}
                                    iconBackground={Colors.colors.errorBG}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.errorIcon}
                                                      name="search"/>
                                    }
                                    onPress={this.showProviderSearch}
                                />
                            </View>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={START_NEW_CHATBOT}
                                    iconBackground={Colors.colors.primaryColorBG}
                                    renderIcon={(size, color) =>
                                        <LineIcons
                                            name='control-start'
                                            size={22}
                                            color={Colors.colors.primaryIcon}
                                        />
                                    }
                                    onPress={this.showAssessment}
                                />
                            </View>
                        </Content>
                    </Modal>


                    {!this.props.auth.networkConnected && (
                        <View style={{height: 40, width: '100%', backgroundColor: '#EEE', flexDirection: 'row'}}>
                            <Text style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                width: '100%',
                            }}>Reconnecting...</Text>
                        </View>
                    )}

                    <KeyboardAvoidingView
                        style={Platform.OS === 'ios' ? styles.shadowWrap : {
                            flex: 1,
                            backgroundColor: Colors.colors.screenBG
                        }}>
                        {Platform.OS === 'ios' && <View style={styles.shadowInner}></View>}
                        <GiftedChat
                            user={{
                                _id:
                                    chat.conversationContext.patientId +
                                    ',' +
                                    chat.conversationContext.contactId,
                                name: 'User',
                            }}
                            messages={chat.chatMessages}
                            onSend={this.onSend}
                            alwaysShowSend={true}
                            loadEarlier={chat.loadEarlier}
                            onLoadEarlier={this.loadEarlier}
                            isLoadingEarlier={chat.isLoadingEarlier === true}
                            isAnimated={true}
                            // bottomOffset={30}
                            renderMessage={this.renderMessage}
                            renderChatFooter={this.renderInitTyping}
                            renderFooter={this.renderFooter}
                            renderUsernameOnMessage={true}
                            showAvatarForEveryMessage={true}
                            keyboardShouldPersistTaps='handled'
                            renderAvatarOnTop={true}
                            minInputToolbarHeight={
                                this.props.chat.chatPaused ? 55 : 10}
                            renderComposer={this.renderComposer}
                            renderSend={this.renderSend}
                            extraData={chat}
                        />
                    </KeyboardAvoidingView>
                    {isIphoneX() &&
                        <View style={{height: 36, backgroundColor: Colors.colors.screenBG, marginTop: -2}}/>}
                    {/*Resume Chat Button*/}
                    {this.renderAdditionalActions()}
                </Container>
            );
        } else {
            if (connectionStatus === ConnectionStatus.ExpiredToken) {

            }
            return (
                <View style={styles.container}>
                    <View style={styles.loaderstyle}>
                        <Text style={{alignSelf: 'center'}}>
                            {this.connectionStatus[connectionStatus]}
                        </Text>
                        <LottieView
                            style={styles.alfie}
                            resizeMode="cover"
                            source={alfie}
                            autoPlay={true}
                            loop/>
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    innerContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        zIndex: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    resumeContainer: {
        ...CommonStyles.styles.stickyShadow,
        padding: 24,
        // paddingTop: 14,
        paddingBottom: isIphoneX() ? 34 : 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: -105
    },
    mainBG: {
        backgroundColor: Colors.colors.screenBG
    },
    chatHeader: {
        height: HEADER_SIZE,
        paddingLeft: 18,
        paddingRight: 0
    },
    shadowWrap: {
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        backgroundColor: Colors.colors.screenBG
    },
    shadowInner: {
        height: 10,
        top: -10,
        position: 'absolute',
        width: '100%',
        ...CommonStyles.styles.headerShadow,
        shadowColor: Colors.colors.shadowColor2,
        shadowOpacity: 1.0,
        borderBottomWidth: 1
    },
    headerBG: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 5,
        // marginTop: isIphoneX() ? MARGIN_X : MARGIN_NORMAL,
    },
    headerContent: {
        flexDirection: 'row',
    },
    backButton: {
        marginLeft: 15,
        width: 30
    },
    headerRow: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    headerText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        paddingLeft: 0
    },
    avatarContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.colors.primaryColorBG,
        backgroundColor: Colors.colors.primaryColorBG
    },
    state: {
        backgroundColor: '#4CD964',
        width: 14,
        height: 14,
        borderRadius: 10,
        position: 'absolute',
        left: 25,
        top: 0,
        borderColor: '#fff',
        borderWidth: 1
    },
    stateGrey: {
        backgroundColor: '#EAEDF3',
        width: 14,
        height: 14,
        borderRadius: 10,
        position: 'absolute',
        left: 25,
        top: 0,
        borderColor: '#fff',
        borderWidth: 1
    },
    sendBtn: {
        marginLeft: 0,
        marginBottom: 15,
        marginRight: 15,
        //alignSelf: "center",
    },
    sendIcon: {
        width: 30,
        height: 30,
        // marginRight: 20
    },
    typing: {

        marginBottom: 20,
        borderRadius: 30,
        width: 70,
        overflow: 'hidden',
        backgroundColor: '#fff',
        padding: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderstyle: {
        alignSelf: 'center',
        opacity: 0.9,
        height: 130,
    },
    alfie: {
        width: 150,
        height: 150,
    },
    proBg: {
        borderRadius: Platform.OS === 'ios' ? 18 : 100,
        overflow: 'hidden',
        width: 35,
        height: 35,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    singleOption: {
        marginBottom: 16
    }
});
export default connectChat()(ChatInstance);
