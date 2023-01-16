import React, {Component} from "react";
import {Dimensions, FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import {connectConnections} from "../../redux";
import {
    Colors,
    CommonSegmentHeader,
    CommonStyles,
    getHeaderHeight,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
    valueExists,
} from "ch-mobile-shared";
import Loader from "ch-mobile-shared/src/components/Loader";
import {Body, Button, Container, Content, Header, Left, ListItem, Right, Text, Title} from "native-base";
import {addTestID, AlertUtil, isIphoneX} from "ch-mobile-shared/src/utilities";
import {CheckBox} from "react-native-elements";

import Modal from "react-native-modalbox";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {RenderTextChipComponent} from "ch-mobile-shared/src/components/RenderTextChipComponent";
import ConversationService from "../../services/Conversation.service";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {Screens} from "../../constants/Screens";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import LottieView from "lottie-react-native";
import alfie from '../../assets/animations/Dog_with_Can.json';

const windowWidth = Dimensions.get('window').width;

const HEADER_SIZE = getHeaderHeight();

class ChatBotListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            selectedChatbot: null,
            chatbotList: [],
            chatBotFilters: [],
            filteredListItems: [],
            filtersApplied: false,
            appliedFilters: [],
            chatToOpen: null,
            activeSegmentId: 'all-chatbots'
        };

    }

    componentDidMount = async () => {
        this.getConversations(true)
    };

    getConversations = (showLoading) => {
        if (showLoading) {
            this.setState({isLoading: true});
        }
        const conversations = this.props.connections.chatbotList;
        if (showLoading) {
            this.setState({
                chatbotList: conversations,
                chatBotFilters: this.getChatBotFilters(conversations),
                isLoading: false
            });
        } else {
            this.setState({
                chatbotList: conversations,
                chatBotFilters: this.getChatBotFilters(conversations),
            });
        }
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if (this.state.chatToOpen !== null && this.state.isLoading) {
            this.startChatbot(null, this.state.chatToOpen);
        } else {
           if (this.state.activeSegmentId === 'completed-chatbots' && this.state.selectedChatbot !== null){
               const completed =  this.props.connections.activeConnections.filter(connection => connection.type === 'CHAT_BOT'
                   && connection.progress?.completed === true);
               if (completed.length === 0){
                   this.setState({selectedChatbot:null});
               }
           }
        }
    }

    assignConversation = async (selectedChatbot) => {
        try {
            if (selectedChatbot.assigned) {
                this.startChatbot(selectedChatbot.organizationId, null)
            } else {
                this.setState({isLoading: true})
                let response = await ConversationService.selfAssignConversation(
                    selectedChatbot.id,
                    selectedChatbot.organizationId,
                );
                if (response.errors) {
                    AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                    this.setState({isLoading: false})
                } else {
                    this.props.refreshConnections();
                    this.setState({chatToOpen: selectedChatbot.name})
                    this.getConversations(false);
                }
            }

        } catch (error) {
            AlertUtil.showErrorMessage(this.ERROR_SERVICES_UNREACHABLE);
        }
    };

    startChatbot = (organizationId, name) => {

        const connection = this.props.connections.activeConnections.find(connection => {
            if (organizationId) {
                return connection.connectionId === organizationId;
            } else {
                return connection.name === name;
            }
        })
        if (connection) {
            this.props.navigation.navigate(Screens.CHAT_INSTANCE, {contact: connection});
            this.setState({chatToOpen: null, isLoading: false})
        }


    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    toggleFilterItem = (filter, index) => {
        let {appliedFilters} = this.state;
        if (appliedFilters.includes(filter)) {
            appliedFilters = appliedFilters.filter(item => item !== filter);
        } else {
            appliedFilters.push(filter)
        }
        this.setState({appliedFilters});
    }

    renderChatBotInfo = item => {
        let avatar = null;
        if (valueExists(item.avatar)) {
            avatar = item.avatar;
        } else if (valueExists(item.profilePicture)) {
            avatar = item.profilePicture;
        }
        if (this.props.connections.activeConnections
            .find(connection => connection.connectionId === item.organizationId && item.organizationExists)) {

            item = this.props.connections.activeConnections
                .find(connection => connection.connectionId === item.organizationId && item.organizationExists);

        }
        const hasProgress = item.type === 'CHAT_BOT' && item.progress;
        return (
            <View style={styles.personalInfoMainWrapper}>
                <View style={styles.personalInfoWrapper}>
                    <View style={styles.imageWrapper}>
                        <View>
                            {avatar
                                ?
                                <Image
                                    style={styles.proImage}
                                    resizeMode="cover"
                                    source={{uri: S3_BUCKET_LINK + avatar}}/>
                                :
                                <Image
                                    style={styles.proImage}
                                    resizeMode="cover"
                                    source={require('../../assets/images/elfie-avatar.png')}/>
                            }
                        </View>

                    </View>

                    <View style={styles.itemDetail}>
                        {valueExists(item.name)
                            ?
                            <Text style={styles.itemName}>{item.name}</Text>
                            :
                            <Text style={styles.itemName}>Name not available</Text>
                        }
                        {/*<Text style={styles.itemDes} numberOfLines={1}>{item.usage}</Text>*/}
                    </View>


                </View>
                {item.tags && item.tags.length > 0 && (
                    <RenderTextChipComponent renderList={item.tags}/>
                )}

                <View style={styles.itemDesMain}>
                    {valueExists(item.description)
                        ?
                        <Text style={styles.itemDes}>{item.description}</Text>
                        :
                        <Text style={styles.itemDes}>Description not available.</Text>
                    }
                </View>
                {hasProgress
                && !item.archived
                && (
                    <View style={item.lastMessage && item.lastMessageTimestamp ?
                        {...styles.barProgressWrapper, paddingTop: 0} :
                        styles.barProgressWrapper}>
                        <ProgressBarAnimated
                            style={{width: '100%'}}
                            width={windowWidth - 136}
                            value={item?.progress?.percentage || 0}
                            height={8}
                            backgroundColor={Colors.colors.primaryIcon}
                            borderRadius={4}
                        />
                        <Text style={styles.barProgressText}>{item?.progress?.percentage || '0'}%</Text>
                    </View>
                )}

            </View>
        );
    };

    navigateLearnMoreScreen = () => {
        this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {
            contact: this.state.selectedChatbot
        });
    }

    getChatBotFilters = (conversations) => {
        return [...new Set(conversations.flatMap(conversation => conversation.tags).filter(Boolean))]
    }

    getEmptyMessages = () => {
        let emptyStateMsg = '';
        let emptyStateHead = '';
        if (this.state.activeSegmentId === 'completed-chatbots') {
            emptyStateHead = 'No chatbot completed';
            emptyStateMsg = 'You have not completed any chatbot. If you don’t think this is right, please check your chat list or' +
                ' you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
        } else {
            emptyStateHead = 'Chatbots not available';
            emptyStateMsg = 'Currently we do not have any chatbots available is our system.' +
                'If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
        }

        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    render() {
        if (this.state.isLoading) {
            return (<Loader/>);
        }
        const {selectedChatbot, activeSegmentId, appliedFilters} = this.state;
        let {chatbotList, chatBotFilters} = this.state;
        if (activeSegmentId === 'completed-chatbots') {
            chatbotList = this.props.connections.activeConnections.filter(connection => connection.type === 'CHAT_BOT'
                && connection.progress?.completed === true);
            chatBotFilters = this.getChatBotFilters(chatbotList);
        }
        if (appliedFilters.length > 0) {
            chatbotList = chatbotList.filter(item => item.tags?.some(tag => appliedFilters.includes(tag)));
        }
        let tabs = [
            {title: 'All chatbots', segmentId: 'all-chatbots'},
            {title: 'Completed', segmentId: 'completed-chatbots'},
        ];
        StatusBar.setBarStyle("dark-content", true);

        return (
            <Container>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <View style={styles.backButton}>
                            <BackButton
                                {...addTestID('back')}
                                onPress={this.backClicked}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title
                            {...addTestID("select-service-by-type-header")}
                            style={styles.headerText}>Browse chatbots</Title>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.refs?.modalContact?.open()
                                }}
                        >
                            <Image style={styles.filterIcon}
                                   source={this.state.appliedFilters?.length === 0 ?require('../../assets/images/filter.png') : require('../../assets/images/filtered.png')}/>
                        </Button>
                    </Right>
                </Header>
                <View style={{
                    paddingHorizontal: 24,
                }}>
                    <CommonSegmentHeader
                        segments={tabs}
                        segmentChanged={(segmentId) => {
                            this.setState({activeSegmentId: segmentId, selectedChatbot: null, appliedFilters: []});
                        }}
                    />
                </View>
                <Content
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        paddingHorizontal: 24,
                        ...CommonStyles.styles.headerShadow
                    }}>
                    </View>
                    {chatbotList && chatbotList.length > 0
                        ?
                        <View style={styles.list}>
                            <FlatList
                                scrollIndicatorInsets={{right: 1}}
                                showsVerticalScrollIndicator={false}
                                data={chatbotList}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity
                                        {...addTestID("Select-service-" + (index + 1))}
                                        activeOpacity={0.8}
                                        style={
                                            selectedChatbot && ((item.id && item.id === selectedChatbot.id) || (item.connectionId && item.connectionId === selectedChatbot.connectionId))
                                                ? [
                                                    styles.serviceCard,
                                                    {
                                                        borderWidth: 2,
                                                        borderColor: Colors.colors.mainPink80
                                                    },
                                                ]
                                                : styles.serviceCard
                                        }
                                        onPress={() => {
                                            this.setState({selectedChatbot: item})
                                        }}
                                    >
                                        {this.renderChatBotInfo(item)}
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                        :
                        this.getEmptyMessages()
                    }

                </Content>
                {selectedChatbot && (
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>

                        <View style={styles.secondaryBtnWrapper}>
                            <SecondaryButton
                                testId="learn-more"
                                iconLeft='info'
                                type={'Feather'}
                                color={Colors.colors.mainBlue}
                                onPress={() => {
                                    this.navigateLearnMoreScreen(selectedChatbot);
                                }}
                                text="Learn more"
                                size={24}
                            />
                        </View>
                        {activeSegmentId === 'completed-chatbots' ? (
                            <PrimaryButton
                                testId="schedule"
                                iconName='message-circle'
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.props.restartChatbot(selectedChatbot.connectionId);
                                    this.setState({selectedChatbot:null});
                                }}
                                text="Restart chatbot"
                                size={24}
                            />
                        ) : (
                            <PrimaryButton
                                testId="schedule"
                                iconName='message-circle'
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.assignConversation(selectedChatbot);
                                }}
                                text="Start chatbot"
                                size={24}
                            />
                        )}
                    </View>
                )}

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.filterDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '60%',
                        // bottom: this.state.modalHeightProps.height
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalContact"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <View style={{
                        marginVertical: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={styles.mainHeading}>Filter chatbots</Text>
                        <Text style={styles.countText}>{chatbotList?.length} total</Text>
                    </View>
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View>
                            <View style={{
                                marginVertical: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                            </View>
                            <View style={styles.checkBoxSectionMain}>
                                {chatBotFilters && chatBotFilters.length > 0
                                    ? chatBotFilters.map((filter, index) => (
                                        <ListItem
                                            key={index}
                                            style={
                                                appliedFilters.includes(filter)
                                                    ? [
                                                        styles.multiList,
                                                        {
                                                            backgroundColor: Colors.colors.primaryColorBG,
                                                            borderColor: Colors.colors.mainBlue40,
                                                        },
                                                    ]
                                                    : styles.multiList
                                            }
                                        >
                                            <Text
                                                style={
                                                    appliedFilters.includes(filter)
                                                        ? [
                                                            styles.checkBoxText,
                                                            {
                                                                color: Colors.colors.primaryText,
                                                            },
                                                        ]
                                                        : styles.checkBoxText
                                                }>
                                                {filter}
                                            </Text>
                                            <CheckBox
                                                containerStyle={
                                                    appliedFilters.includes(filter) ?
                                                        [
                                                            styles.multiCheck,
                                                            {
                                                                borderColor: Colors.colors.primaryIcon,
                                                            }
                                                        ]
                                                        : styles.multiCheck
                                                }
                                                center
                                                iconType='material'
                                                checkedIcon='check'
                                                uncheckedIcon=''
                                                checkedColor={Colors.colors.primaryIcon}
                                                checked={appliedFilters.includes(filter)}
                                                onPress={() => this.toggleFilterItem(filter, index)}
                                            />
                                        </ListItem>
                                    ))
                                    :
                                    <Text style={styles.checkBoxText}>No filters available</Text>
                                }
                            </View>

                        </View>
                    </Content>
                </Modal>

            </Container>


        );

    }
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    apptHeading: {
        marginTop: 30,
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 16,
    },
    list: {
        paddingLeft: 24,
        paddingRight: 24,

    },
    personalInfoMainWrapper:
        {
            flexDirection: 'column',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 24,

        },
    personalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    proBgMain: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.whiteColor,
    },
    itemDetail: {
        flex: 1,
        paddingLeft: 16,
    },
    itemDesMain: {
        paddingTop: 16,
        paddingBottom: 16,


    },
    itemName: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8,
    },
    itemDes: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeRegular,
    },
    checkWrapper: {},
    nextBtnwrap: {
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        borderRadius: 4,
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerContent: {
        flexDirection: 'row',
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
    extrasWrapper: {
        backgroundColor: Colors.colors.whiteColor,
        paddingBottom: 24,
        paddingRight: 24,
        paddingLeft: 24,
        paddingTop: 16
    },
    extrasHeading: {
        color: '#22242A',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    specialitiesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    singleSpeciality: {
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 16,
        paddingLeft: 16,
        marginRight: 8,
        borderRadius: 16,
        overflow: 'hidden',
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        fontSize: 14,
        letterSpacing: 0.28,
    },
    reviewBtnText: {
        color: '#515d7d',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.7,
    },
    modal: {
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: 620,
    },
    filterHead: {
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24,
    },
    filterText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    filterBody: {},
    filterScroll: {
        maxHeight: 450,
        paddingBottom: isIphoneX() ? 34 : 24
        // paddingVertical: 16
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    swipeBar: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -35,
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 20,
        marginBottom: 24,
        justifyContent: 'center',
        width: 80,
    },
    checkBoxMain: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    multiList: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    checkBoxText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        width: '90%'
    },

    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0
    },
    checkBoxSectionMain: {
        //paddingTop: 40
    },
    checkBoxSectionText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 16,
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        backgroundColor: Colors.colors.whiteColor
    },
    mainHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    countText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    serviceCard: {
        borderWidth: 2,
        borderColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column'
    },
    extrasSlots: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 24,
        marginBottom: 24
    },
    extrasSlotsInnerFirst: {
        marginRight: 16
    },

    extrasSlotsWeekText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,

    },
    extrasSlotsSlotsText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    extrasDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    ratingWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.borderColorLight,
        padding: 24,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reviewScore: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    totalReviews: {
        marginLeft: 8,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,
    },
    noProText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    secondaryBtnWrapper: {
        // marginBottom: 16
    },
    onlineStatus: {
        position: 'absolute',
        top: 35,
        right: 4,
        height: 10,
        width: 10,
        borderWidth: 2,
        borderColor: Colors.colors.whiteColor,
        borderRadius: 6,
    },
    successTopWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.colors.successIcon,
        backgroundColor: Colors.colors.successBG,
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 8,
        padding: 16,
        left: 0,
        right: 0,
        top: 48,
        position: 'absolute',
    },
    successBoxCheck: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: Colors.colors.successIcon
    },
    barProgressWrapper: {
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',

    },
    barProgressText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        width: 40,
        textAlign: 'right'
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
});

export default connectConnections()(ChatBotListScreen);
