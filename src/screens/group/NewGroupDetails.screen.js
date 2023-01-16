import React, {Component} from 'react';
import {Colors, AlertUtil, GroupDetailComponent} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/Profile.service";
import {connectLiveChat} from "../../redux";
import {AVATAR_COLOR_ARRAY} from "../../constants/CommonConstants";
import DeepLinksService from "../../services/DeepLinksService";

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
        title: 'Invite Members',
        iconName: "user-plus",
        iconBackground: Colors.colors.warningBG,
        iconColor: Colors.colors.warningIcon,
        type: 'INVITE_GROUP'
    },
    {
        title: 'Contribute to the group',
        iconName: "dollar-sign",
        iconBackground: Colors.colors.successBG,
        iconColor: Colors.colors.successIcon,
        type: 'CONTRIBUTE_GROUP'
    }
]

class NewGroupDetailsScreen extends Component<Props> {

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
    }

    getGroupDetails = async () => {
        try {
            const {channelUrl} = this.state;
            const groupsResponse = await ProfileService.getGroupDetails(channelUrl);
            if (groupsResponse.errors) {
                console.log(groupsResponse.errors);
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
                this.setState({
                    groupDetails: {
                        ...this.props.navigation.state.params,
                        ...groupsResponse
                    }, isLoading: false});
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
        const {channelUrl, groupLink, groupsSettings} = this.state;
        if (connection.userType === 'PRACTITIONER' || connection.userType === 'MATCH_MAKER') {
            this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
                providerId: connection.userId,
                type: connection.type,
            });
        } else if (connection.userType === 'PATIENT') {
            this.props.navigation.navigate(Screens.MEMBER_DETAIL_SCREEN, {
                connection: connection
            })
        } else if (connection.userType === 'CHAT_GROUP') {
            this.props.navigation.navigate(Screens.NEW_GROUP_DETAILS_SCREEN,
                {
                    name: connection.name,
                    profilePicture: connection.profilePicture,
                    channelUrl: channelUrl,
                    publicGroupType: groupsSettings.groupTypePublic,
                    publicGroupLink: groupLink,

                });
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
     * @function navigateToInviteGroupDetails
     * @description This method is used to navigate to Manage group members screen.
     */
    navigateToInviteGroupDetails = () => {
        //this.props.navigation.navigate(Screens.MANAGE_GROUP_MEMBERS_SCREEN);
    }

    /**
     * @function navigateToManageMembers
     * @description This method is used to navigate to Manage group members screen.
     */
    navigateToManageMembers = () => {
        //this.props.navigation.navigate(Screens.MANAGE_GROUP_MEMBERS_SCREEN);
    }

    navigateToContribution = () => {}

    joinGroup = ()=>{}

    leaveGroup = async () => {
        this.setState({ isLoading: true });
        const response = await ProfileService.removeMember(this.state.channelUrl, this.props?.auth?.meta?.userId);
        if (response.errors) {
            this.setState({ isLoading: false });
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({ isLoading: false });
            AlertUtil.showSuccessMessage("You are no longer participant of " + this.connection.name + " group");
            this.props.fetchConnections();
            this.goBack();
        }
    };

    render() {
        const {isLoading,groupDetails} = this.state;
        return (
            <GroupDetailComponent
                isLoading = {isLoading}
                navigateBack = {this.goBack}
                groupDetails = {groupDetails}
                buttonOptions = {BUTTON_LIST}
                leaveGroup = {this.leaveGroup}
                joinGroup = {this.joinGroup}
                navigateToShareGroupDetails = {this.navigateToShareGroupDetails}
                navigateToInviteGroupDetails = {this.navigateToInviteGroupDetails}
                navigateToManageMembers = {this.navigateToManageMembers}
                navigateToConnectionProfile = {this.navigateToConnectionProfile}
                navigateToContribution = {this.navigateToContribution}
                isProviderApp = {false}
            />

        );
    }
}

export default connectLiveChat()(NewGroupDetailsScreen);
