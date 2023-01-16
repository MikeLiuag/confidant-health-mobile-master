import React, {Component} from 'react';
import {FlatList, Platform, StatusBar, StyleSheet} from 'react-native';
import {Body, Container, Content, Header, Left, Right, Text, Title, View} from 'native-base';
import {
    AlertUtil,
    BackButton,
    Colors,
    CommonSegmentHeader,
    CommonStyles,
    getHeaderHeight,
    TextStyles
} from 'ch-mobile-shared';
import {CommonGroupCard} from '../../components/group/CommonGroupCard';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/Profile.service";
import {connectAuth} from "../../redux";
import Loader from "../../components/Loader";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";

const HEADER_SIZE = getHeaderHeight();

const TABS = [
    {title: 'All groups', segmentId: 'allGroups'},
    {title: 'My groups', segmentId: 'myGroups'},
];

class AllGroupsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.allGroupsDetails = navigation.getParam('allGroupsDetails', null);
        this.fromOnboardFlow = navigation.getParam('fromOnboardFlow', null);
        this.state = {
            activeSegmentId: null,
            isLoading: true,
            allGroups: [],
            myGroups: []
        };
    }

    goBack = () => {
        if(this.fromOnboardFlow){
            this.props.navigation.replace(Screens.TAB_VIEW);
        }else {
            this.props.navigation.goBack();
        }
    };

    getAllGroup = async () => {
        this.setState({isLoading : true});
        const userId = this.props?.auth?.meta?.userId;
        let response = await ProfileService.getAllGroup(userId, true);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            let myJoinedGroups = [];
            if(response && response.length>0){
                myJoinedGroups = response.filter(group => group?.joinedGroup);
            }
            this.setState({allGroups: response, myGroups: myJoinedGroups, isLoading: false})
        }
    }

    componentDidMount = async () => {
        this.screenBlurListener = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.getAllGroup()
            }
        );
    };

    componentWillUnmount(): void {
        if (this.screenBlurListener) {
            this.screenBlurListener.remove();
        }
    }

    groupDetails = (selectedGroup) => {
        if(selectedGroup?.joinedGroup){
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                    connection : {
                        ...selectedGroup,
                        type: "CHAT_GROUP",
                        channelUrl: selectedGroup.channelUrl,
                        connectionId : selectedGroup.channelUrl
                    }
                }
            );
        }else{
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                channelUrl: selectedGroup.channelUrl
            });
        }

    };

    getEmptyMessages = () => {
        const {activeSegmentId} = this.state;
        let emptyStateMsg = '';
        let emptyStateHead = '';
        if (activeSegmentId === 'allGroups') {
            emptyStateHead = 'Groups not available';
            emptyStateMsg = 'Currently we do not have any groups available is our system. If you don’t think this is right, please check your chat list or' +
                ' you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
        } else {
            emptyStateHead = 'You have not join any group yet' ;
            emptyStateMsg = 'You have not join any group yet. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
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

    getEmptyMessages = () => {
        const {activeSegmentId} = this.state;
        let emptyStateMsg = '';
        let emptyStateHead = '';
        if (activeSegmentId === 'allGroups') {
            emptyStateHead = 'No Groups Available';
            emptyStateMsg = 'We don’t have any groups available at the moment. If you’d like to learn more about future groups, reach out to your matchmaker or email help@confidanthealth.com.';
        } else {
            emptyStateHead = 'You haven’t joined any groups' ;
            emptyStateMsg = 'When you sign up for groups, they will be listed here. If your group is not listed here, reach out to your matchmaker or email help@confidanthealth.com.';
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

    render = () => {
        if(this.state.isLoading){
            return <Loader/>;
        }
        const {activeSegmentId,allGroups,myGroups} = this.state;
        let Data;
        if(activeSegmentId === 'allGroups' ){
            Data = allGroups;
        }else {
            Data = myGroups;
        }

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <BackButton onPress={this.goBack} />
                    </Left>
                    <Body style={{ flex: 2}}>
                        <Title style={styles.headerTitle}>Support groups</Title>
                    </Body>
                    <Right />
                </Header>

                <View style={{paddingHorizontal: 24,
                    ...CommonStyles.styles.headerShadow
                }}>
                    <CommonSegmentHeader
                        segments={TABS}
                        segmentChanged={(segmentId) => {
                            this.setState({activeSegmentId: segmentId});
                        }}
                    />
                </View>

                <Content contentContainerStyle={{ paddingHorizontal: 24}}>
                    {Data && Data.length > 0 ?
                        <View style={styles.groupList}>
                            <FlatList
                                data={Data}
                                renderItem={({item, index}) => (
                                    <CommonGroupCard
                                        onPress={this.groupDetails}
                                        totalMembers={true}
                                        groupDetails={item}
                                    />
                                )}
                            />
                        </View> :
                        this.getEmptyMessages()
                    }
                </Content>

            </Container>
        );
    };
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    headerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast
    },
    groupList: {},
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        marginBottom: 30
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        textAlign: 'center',
        marginBottom: 32
    },

});

export default connectAuth()(AllGroupsScreen);
