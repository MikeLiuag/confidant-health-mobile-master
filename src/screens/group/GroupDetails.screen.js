import React, {Component} from 'react';
import {AlertUtil, Colors, GroupDetailComponent} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/Profile.service";
import {connectLiveChat} from "../../redux";
import {AVATAR_COLOR_ARRAY, SEGMENT_EVENT} from "../../constants/CommonConstants";
import DeepLinksService from "../../services/DeepLinksService";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

const BUTTON_LIST = [
    {
        title: 'Leave group',
        iconName: "closecircleo",
        iconBackground: Colors.colors.errorBG,
        iconColor: Colors.colors.errorIcon,
        type: 'LEAVE_GROUP'
    },
    {
        title: 'Join group',
        iconName: "users",
        iconBackground: Colors.colors.primaryColorBG,
        iconColor: Colors.colors.primaryIcon,
        type: 'JOIN_GROUP'
    },
    {
        title: 'Share group',
        iconName: "share",
        iconBackground: Colors.colors.secondaryColorBG,
        iconColor: Colors.colors.secondaryIcon,
        type: 'SHARE_GROUP'
    },
    {
        title: 'Go to chat',
        iconName: "message-circle",
        iconBackground: Colors.colors.secondaryColorBG,
        iconColor: Colors.colors.secondaryIcon,
        type: 'GO_TO_GROUP_CHAT'
    }
]

class GroupDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            channelUrl: navigation.getParam('channelUrl', null),
        };

    }

    goBack = () => {
        this.props.navigation.goBack();
    };


    componentDidMount(): void {
        this.getGroupDetails();
        this.screenBlurListener = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.getGroupDetails();
            }
        );
    }

    getGroupDetails = async () => {
        try {
            const {channelUrl} = this.state;
            const groupsResponse = await ProfileService.getGroupDetails(channelUrl);
            if (groupsResponse.errors) {
                AlertUtil.showErrorMessage(groupsResponse.errors[0].endUserMessage);
                this.props.fetchConnections();
                this.props.navigation.navigate(Screens.TAB_VIEW);
            } else {
                if (groupsResponse && groupsResponse.members && groupsResponse.members.length > 0) {
                    groupsResponse.members = groupsResponse.members.map((item, index) => {
                        if (!item.profilePicture && item.userId !== this.props?.auth?.meta?.userId) {
                            item.colorCode = this.findAvatarColorCode(item.userId, index);
                        }
                        return item;
                    });
                }
                let members = groupsResponse?.members;
                const groupOrganizer = groupsResponse?.members.find(member => member.userId === groupsResponse?.groupOrganizer);
                if (groupOrganizer) {
                    members = groupsResponse?.members.filter(member => member.userId !== groupOrganizer?.userId)
                }
                this.setState({
                    groupDetails: {
                        ...this.props.navigation.state.params,
                        ...groupsResponse,
                        groupOrganizer: groupOrganizer,
                        members: members,
                    }, isLoading: false
                });
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage('Whoops ! something went wrong ! ');
            this.props.fetchConnections();
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }

    };

    findAvatarColorCode = (connectionId, index) => {
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length];
    }

    /**
     * @function navigateToConnectionProfile
     * @description This method is used to navigate to connection Profile.
     */
    navigateToConnectionProfile = (connection) => {
        if (connection.userType === 'PRACTITIONER' || connection.userType === 'MATCH_MAKER') {
            this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
                provider: connection
            });
        } else if (connection.userType === 'PATIENT') {
            this.props.navigation.navigate(Screens.MEMBER_PROFILE_SCREEN, {
                ...connection
            })
        }
    };

    /**
     * @function navigateToShareGroupDetails
     * @description This method is used to share group.
     */
    navigateToShareGroupDetails = () => {
        const {channelUrl} = this.state;
        setTimeout(async () => {
            await DeepLinksService.shareGroupLink('facebook', channelUrl);
        }, 500);
    }

    /**
     * @function navigateToContribution
     * @description This method is used to navigate to group contribution screen.
     */


    navigateToContribution = () => {
    }


    /**
     * @function joinGroup
     * @description This method is used to join group.
     */

    joinGroup = async () => {
        this.setState({isLoading: true});
        const {channelUrl} = this.state;
        const response = await ProfileService.joinPublicGroup(channelUrl);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage("Group Joined Successfully");
            this.props.fetchConnections();
            this.props.fetchAppointments();

            const groupInfo = await ProfileService.getGroupDetails(channelUrl);
            if (groupInfo.errors) {
                AlertUtil.showErrorMessage("This group is not public");
            } else {
                const segmentGroupJoinedPayload = {
                    userId: this.props?.auth?.meta?.userId,
                    groupId: channelUrl,
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
            this.goBack();
        }
    }

    /**
     * @function joinGroup
     * @description This method is used to join group.
     */

    goToGroupChat = async () => {
        const {groupDetails} = this.state;
        if (this.props.chat.sendbirdStatus === 2) {
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                referrer: Screens.TAB_VIEW,
                connection: {...groupDetails, type: "CHAT_GROUP"},
            });
        } else {
            AlertUtil.showErrorMessage("Please wait until chat service is connected");
        }


        setTimeout(() => {
            this.navLock = false;
        }, 1000);
    }

    /**
     * @function leaveGroup
     * @description This method is used to leave group.
     */
    leaveGroup = async () => {

        this.setState({isLoading: true});
        const response = await ProfileService.removeMember(this.state.channelUrl, this.props?.auth?.meta?.userId);
        if (response.errors) {
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({isLoading: false});
            AlertUtil.showSuccessMessage("You are no longer participant of " + this.connection.name + " group");
            this.props.fetchConnections();
            this.goBack();
        }
    };

    render() {
        const {isLoading, groupDetails} = this.state;
        return (
            <GroupDetailComponent
                isLoading={isLoading}
                navigateBack={this.goBack}
                groupDetails={groupDetails}
                buttonOptions={BUTTON_LIST}
                leaveGroup={this.leaveGroup}
                joinGroup={this.joinGroup}
                goToGroupChat={this.goToGroupChat}
                navigateToShareGroupDetails={this.navigateToShareGroupDetails}
                navigateToConnectionProfile={this.navigateToConnectionProfile}
                navigateToContribution={this.navigateToContribution}
                isProviderApp={false}
            />

        );
    }
}

export default connectLiveChat()(GroupDetailsScreen);
