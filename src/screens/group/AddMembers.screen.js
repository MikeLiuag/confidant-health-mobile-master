import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {AddMembersComponent, AlertUtil, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import {connectConnections} from "../../redux";
import ProfileService from '../../services/Profile.service';
import {Screens} from '../../constants/Screens';
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class AddMembersScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.group = this.props.navigation.getParam('group', null);
        this.onSuccess = this.props.navigation.getParam('onSuccess', null);
        this.editMode = this.props.navigation.getParam('editMode', false);
        this.state = {
            isLoading: false,
            nameFocus: false,
            imageUploaded: false,
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Add Member screen'
        );
    }

    goBack = () => {
        this.props.navigation.goBack();
    };

    createGroup = async (selectedConnections) => {
        if (this.editMode) {
            this.addMembersToGroup(selectedConnections);
        } else {
            const groupParams = {
                groupName: this.group.name,
                selectedConnections,
            };
            const payload = {group: groupParams};
            if (this.group.file) {
                payload.file = this.group.file;
            }
            this.setState({isLoading: true});
            const groupResponse = await ProfileService.createGroup(payload);
            console.log(groupResponse);
            if (groupResponse.errors) {
                AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                const payload = {
                    ...groupParams,
                    ...groupResponse,
                };
                this.props.newChatGroupCreated(payload);
                AlertUtil.showSuccessMessage('New chat group created.');
                this.props.navigation.navigate(Screens.TAB_VIEW);
            }
        }
    };

    addMembersToGroup = async (selectedConnections) => {
        this.setState({isLoading: true});
        const groupParams = {
            channelUrl: this.group.channelUrl,
            selectedConnections,
        };
        const groupResponse = await ProfileService.addGroupMembers(groupParams);
        console.log(groupResponse);
        if (groupResponse.errors) {
            AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage('New members added successfully');
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN);

            if (this.onSuccess) {
                this.onSuccess();
            }
        }
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        let connections = this.props.connections.activeConnections.filter(connection => connection.type !== 'CHAT_BOT');
        if (this.editMode) {
            const existingMembers = [
                ...this.group.members.map(member => member.userId),
                ...this.group.pendingMembers.map(member => member.userId),
            ];
            connections = connections.filter(connection => !existingMembers.includes(connection.connectionId));

        }
        return (
            <AddMembersComponent

                connections={connections}
                isLoading={this.state.isLoading}
                editMode={this.editMode}
                createGroup={this.createGroup}
                goBack={this.goBack}
            />
        );
    };
}

const styles = StyleSheet.create({
    header: {
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
        paddingTop: 15,
        paddingLeft: 18,
        paddingRight: 18,
    },
    backButton: {
        marginLeft: 15,
        width: 35,
    },
    groupTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
    },
    emptyTextDes: {
        color: '#969FA8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center',
    },
    headRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        height: 40,
        paddingRight: 16,
        paddingLeft: 16,
        backgroundColor: '#f7f9ff',
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5,
    },
    ListTitle: {
        fontFamily: 'Roboto-Bold',
        color: '#515d7d',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.46,
        lineHeight: 12,
        textTransform: 'uppercase',
    },
    listCount: {
        fontFamily: 'Roboto-Bold',
        color: '#969fa8',
        fontSize: 12,
        lineHeight: 23,
        width: 24,
        height: 24,
        borderRadius: 13,
        backgroundColor: '#fff',
        borderWidth: 1,
        textAlign: 'center',
        borderColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    singleItem: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#EEE',
        borderWidth: 0.5,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarContainer: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 25,
        borderColor: '#4FACFE',
        borderWidth: 1,
    },
    contact: {
        flex: 2,
    },
    contactUsername: {
        fontFamily: 'Roboto-Bold',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        color: '#25345c',
        fontWeight: '600',
    },
    subText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19,
        color: '#969fa8',
        letterSpacing: 0,
    },
    checkWrapper: {
        paddingRight: 15,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
    },
});

export default connectConnections()(AddMembersScreen);
