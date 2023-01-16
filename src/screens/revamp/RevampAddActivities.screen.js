import React, {Component} from 'react';
import {Image, Platform, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Accordion, Body, Container, Content, Header, Icon, Left, Right, Text, Title, View} from 'native-base';
import {
    AlertUtil,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
    valueExists
} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {Screens} from "../../constants/Screens";
import {REVAMP_ON_BOARDING_TYPES, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {connectRevamp} from "../../redux";
import ConversationService from "../../services/Conversation.service";

const HEADER_SIZE = getHeaderHeight();

class RevampAddActivitiesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            selectedActivity: null,
            showActivityModal: false,
            valuesGroups: [],
            selectedActivities: []
        }
    }

    componentDidMount() {
        this.getRevampTypes()
    }

    navigateToAddActivitiesScreen = () => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_ADD_ACTIVITIES_SCREEN)
    };

    setSelectedActivityNull = () => {
        this.setState({selectedActivity: null, showActivityModal: false})
    }

    navigateUserActivitiesScreen = (selectedActivity) => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_ALL_ACTIVITIES_SCREEN)
    };

    getRevampTypes = async () => {
        try {
            this.setState({isLoading: true})
            const response = await ConversationService.getRevampTypesList();
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
                AlertUtil.showErrorMessage('Type not available');
                this.setState({isLoading: false});
            } else {
                const activitiesTypeData = response.find(type => type.name === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key)
                this.setState({
                    valuesGroups: activitiesTypeData.children[0].revampMetaData.valuesGroups,
                    isLoading: false
                });
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    }

    updateRevampContext = async () => {
        try {
            let {selectedActivities, valuesGroups} = this.state;
            let revampContext = this.props.revamp.revampContext;

            let activities = valuesGroups.flatMap(groups => groups.values)
                .filter(value => selectedActivities.some(activity => activity.name === value.name)).map(activity => {
                    return {
                        activity: activity,
                        scheduled: false
                    }
                })

            if (revampContext.activities && revampContext.activities.length > 0) {
                activities.map(activity => {
                    if (!revampContext.activities.some(activityContext => activityContext.activity.name === activity.activity.name)) {
                        revampContext.activities.push({
                            activity: activity.activity,
                            scheduled: false
                        })
                    }
                })
            } else {
                revampContext.activities = selectedActivities
            }
            this.props.updateRevampContext(revampContext);
            this.props.navigation.goBack();

        } catch (e) {
            console.log(e);
        }
    };

    _renderHeader = (item, expanded) => {
        return (
            <View style={{
                flexDirection: "row",
                marginBottom: expanded ? 8 : 24,
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 24,
            }}>
                <View style={styles.headTextWrap}>
                    <View style={styles.iconBg}>
                        {item.icon &&
                            <Image style={styles.iconImg}
                                   resizeMode={'contain'}
                                // source={valueExists(item.icon) ? this.state.revampImages[item.icon] : require("../../assets/images/Question.png")}
                                   source={{uri: item.icon && S3_BUCKET_LINK + item.icon}}
                            />}
                    </View>
                    <Text style={styles.headMainText}>{item.name}</Text>
                </View>
                <View>
                    {expanded
                        ? <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-up"/>
                        : <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-down"/>}
                </View>
            </View>
        );
    }

    _renderContent = (item) => {
        let {selectedActivities} = this.state;

        return (
            <View style={{...styles.chipWrapper, paddingHorizontal: 24, marginTop: 24}}>
                {item.values && item.values.map(item => {
                    return (
                        <TouchableOpacity onPress={() => {
                            if (selectedActivities.some(activity => activity.name === item.name)) {
                                selectedActivities = selectedActivities.filter(activity => activity.name !== item.name)
                            } else {
                                selectedActivities.push(item)
                            }
                            this.setState({selectedActivities})
                        }}>
                            <View style={{
                                ...styles.chipView,
                                backgroundColor: selectedActivities.some(activity => activity.name === item.name)
                                    ? valueExists(item.colorCode)
                                        ? item.colorCode
                                        : Colors.colors.mainBlue
                                    : Colors.colors.highContrastBG
                            }}>
                                <Text style={{
                                    ...styles.chipText,
                                    color: selectedActivities.some(activity => activity.name === item.name)
                                        ? Colors.colors.whiteColor
                                        : Colors.colors.mediumContrast
                                }}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        );
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const {isLoading} = this.state;
        if (isLoading) {
            return <Loader/>
        }
        const {selectedActivities, valuesGroups} = this.state;
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
                    <Right style={{flex: 1}}></Right>
                </Header>
                <Image
                    style={styles.questionsBg}
                    source={require('../../assets/images/AddActivitiesBG.png')}/>
                <Content scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    <View style={{
                        ...styles.mainContentWrapper,
                        marginBottom: 94,
                        marginTop: 24
                    }}>
                        <Text style={styles.mainHeading}>Add Activities</Text>
                        <Text style={styles.subHeading}>Add any activities that you plan to do.</Text>
                    </View>
                    <View style={styles.sectionWrapper}>
                        <Accordion
                            dataArray={valuesGroups}
                            animation={true}
                            expanded={-1}
                            style={{borderTopColor: Colors.colors.borderColor, marginBottom: 8}}
                            renderHeader={this._renderHeader}
                            renderContent={this._renderContent}
                        />
                    </View>
                </Content>
                {selectedActivities.length > 0
                    && <View style={styles.greBtns}>
                        <PrimaryButton
                            onPress={() => {
                                this.updateRevampContext();
                            }}
                            text="Continue"
                        />
                    </View>
                }
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
        paddingBottom: 16,
        textAlign: 'left'
    },
    mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left'
    }
    , subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
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
    numericListNumberBox: {
        height: 34,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        borderRadius: 5

    },
    numericListNumber: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.mainPink,
        textAlign: 'center'
    },
    numericListText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        marginTop: 8,

    },
    toggleButtonText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginRight: 35,
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
    chipWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        marginBottom: 32,
    },
    chipView: {
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 16,
        marginRight: 4,
        marginBottom: 8,
    },
    chipText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    },
    textAreaContainer: {
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    switchContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        paddingHorizontal: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },

    greBtn: {
        paddingTop: 24,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        alignItems: 'center',
        ...CommonStyles.styles.stickyShadow,
    },

    actionButtonBG: {
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingTop: 20,
        backgroundColor: '#fff',
        ...CommonStyles.styles.shadowBox,
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

export default connectRevamp()(RevampAddActivitiesScreen);

