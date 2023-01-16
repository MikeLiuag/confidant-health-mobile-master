import React, {Component} from 'react';
import {connectConnections} from '../../redux';
import {FlatList, Image, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from 'native-base';
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
    CHATBOT_DEFAULT_AVATAR, AlertUtil,
} from 'ch-mobile-shared';
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/Dog_with_Can.json';
import {Screens} from '../../constants/Screens';
import {DEFAULT_AVATAR_COLOR} from 'ch-mobile-shared/src/constants';

const HEADER_SIZE = getHeaderHeight();
class GroupActivity extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            careTeamList : null,
            selectedCareTeamDetails : null,
            modalOpen: false,
            modalHeightProps: {
                height: 50
            }
        };
    }

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    getEmptyMessages = () => {
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
                <Text style={styles.emptyTextMain}>No groups joined</Text>
                <Text style={styles.emptyTextDes}>You don't have any chat groups joined.</Text>
                <View style={styles.bookBtn}>
                    <PrimaryButton
                        onPress={()=>{
                            this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN);
                        }}
                        text={'Find a New Group for Members'}
                    />
                </View>
            </View>
        );
    };

    openGroupChat = (item)=>{
        if (this.props.chat.sendbirdStatus === 2) {
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                provider: { ...item, userId: item.connectionId },
                referrer: Screens.GROUP_ACTIVITY_SCREEN,
                patient: this.props.auth.meta,
                connection: item,
            });
        } else {
            AlertUtil.showErrorMessage("Please wait until chat service is connected");
        }
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const groups = this.props.connections.activeConnections.filter(connection=>connection.type==='CHAT_GROUP');
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                    </Body>
                    <Right/>
                </Header>
                <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Groups
                        </Text>
                        {groups && groups.length>0 &&
                        <Text style={styles.memberCount}>{groups.length} groups joined</Text>
                        }
                    </View>

                    {groups && groups.length>0 ?
                        <View style={styles.teamWrapper}>
                            <FlatList
                                data={groups}
                                renderItem={({item, index}) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.singleItem}
                                            onPress={() => {
                                                this.openGroupChat(item);
                                            }}>
                                            <View style={styles.imageWrapper}>
                                                {
                                                    item.profilePicture ?
                                                        <Image
                                                            style={styles.proImage}
                                                            resizeMode="cover"
                                                            source={{uri: getAvatar(item)}}/>
                                                        : <View style={{
                                                            ...styles.proBg,
                                                            backgroundColor: item.colorCode ? item.colorCode : DEFAULT_AVATAR_COLOR,
                                                        }}><Text style={styles.proLetter}>{item.name.charAt(0).toUpperCase()}</Text></View>
                                                }
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.itemTitle}>{item.name}</Text>
                                                {item.lastMessage && (
                                                    <Text numberOfLines={1} style={styles.mainText}>
                                                        {item.lastMessage}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={styles.iconContainer}>
                                                <Button transparent style={styles.nextIcon} onPress={() => {
                                                    this.openGroupChat(item);
                                                }}>
                                                    <Image
                                                        style={styles.bottomBackgroundBlue}
                                                        source={require('../../assets/images/Path.png')}
                                                    />
                                                </Button>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                                keyExtractor={item => item.connectionId}
                            />
                        </View> : this.getEmptyMessages()
                    }
                </Content>
            </Container>
        );
    }

}
const styles = StyleSheet.create({
    header: {
        paddingTop: 30,
        paddingLeft: 18,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    titleWrap: {
        marginBottom: 16
    },
    memberCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        marginTop: -20
    },
    teamWrapper: {
        marginBottom: 40
    },
    singleTeamItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        marginBottom: 8
    },
    teamUpperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    domainIcon: {

    },
    nextApptWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor:  Colors.colors.mediumContrastBG
    },
    nextApptTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    nextApptDate: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    modalStatus: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
    },
    teamImgWrap: {
        width: 48,
        height: 48
    },
    teamImgWrapModal: {
        width: 68,
        height: 68
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    statusDotModal: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 3,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    teamImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    teamImgModal: {
        width: 68,
        height: 68,
        borderRadius: 34
    },
    teamDetails: {
        paddingLeft: 12,
        flex: 1
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoTitleModal: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingLeft: 4
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    infoContentModal: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        paddingLeft: 4
    },
    actionList: {
        marginTop: 24
    },
    singleActionItem: {
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 12,
        marginBottom: 16
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
        // paddingLeft: 16,
        // paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    bookBtn: {
        // maxWidth: 240,
        alignSelf: 'center'
    },
    progressBarr: {
        height: 10,
        borderRadius: 5,
        marginBottom: 9
    },
    container: {
        padding: 0,
        marginTop: -5
    },
    contentWrapper: {
        zIndex: 50,
        // marginTop: isIphoneX()? MARGIN_X : 0
        marginTop: -130,
        width: '100%',
        paddingRight: 0,
        paddingLeft: 0
    },
    topicHeader: {
        backgroundColor: '#fff',
    },
    gredientBG: {
        paddingTop: 100
    },
    imgBG: {
        paddingTop: 100,
        zIndex: -1
    },
    textDurationWrapper: {
        flexDirection: 'row',
    },
    searchWrapper: {
        flexDirection: 'row',
        zIndex: 100,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: isIphoneX() ? 26 : 3
    },
    backBox: {
        flex: 0.5,
    },
    fieldBox: {
        flex: 2,
    },
    searchField: {
        color: '#FFF',
    },
    cancelBox: {
        flex: 0.5,
    },
    backBtn: {
        paddingLeft: 0,
    },
    backIcon: {
        color: '#FFF',
        fontSize: 35,
    },
    cancelBtn: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Regular',
    },
    searchBtn: {
        paddingRight: 0,
    },
    searchIcon: {
        color: '#FFF',
        fontSize: 22,
        transform: [{rotateZ: '90deg'}],
    },
    greImage: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    },
    topIcon: {
        marginTop: 16,
        alignSelf: 'center',
        marginBottom: 16,
        width: 60,
        height: 60,
    },
    largeText: {
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        color: '#FFF',
        marginBottom: 16,
        marginTop: 77
    },
    subHead: {
        fontFamily: 'Roboto-Regular',
        color: '#FFF',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 40,
    },
    titleMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        fontWeight: '500',

    },
    readStatus: {
        color: '#3CB1FD',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        fontWeight: '500',
    },
    list: {
        backgroundColor: '#FFF',
        paddingBottom: 60,
    },
    singleItem: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderColor: '#f5f5f5',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        padding: 24,
        marginBottom: 10,
        justifyContent:'space-between',
        alignItems: 'center'
    },
    iconContainer: {
        paddingRight: 4,
        alignItems: 'center',
        maxWidth: 80
    },
    readIcon: {
        width: 50,
        height: 50,
    },
    textContainer: {
        flex: 1,
        // justifyContent: 'center',
        paddingLeft: 20,
    },
    mainText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        letterSpacing: 0.28,
        color: '#999',
        marginTop: 8
    },
    itemTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.28,
        lineHeight: 14
    },
    subText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 18,
        color: '#646c73',
        width: '90%',
    },
    markWrapper: {
        paddingTop: 10,
    },
    nextButton: {},
    loadersty: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    barWrapper: {
        //paddingLeft: 10,
        //paddingRight: 10,
        //paddingBottom: 40,
    },
    completedText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontStyle: 'normal',
        lineHeight: 15,
    },
    boldText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 15,
    },
    nextIcon: {
        backgroundColor: "#EBF4FC",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },
    completedIcon: {
        backgroundColor: "#EBFCE4",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        // overflow: 'hidden',
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: '#4FACFE',
        borderWidth: 2,
    },


});
export default connectConnections()(GroupActivity);
