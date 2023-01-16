import React, { Component } from "react";
import { StatusBar } from "react-native";
import { AlertUtil, CONNECTION_TYPES, getAvatar, PendingConnectionsComponent } from "ch-mobile-shared";
import { Screens } from "../../constants/Screens";
import ProfileService from "../../services/Profile.service";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";
import { SEGMENT_EVENT } from "../../constants/CommonConstants";
import { connectAuth } from "../../redux";
import { NavigationActions, StackActions } from "react-navigation";
import momentTimeZone from "moment-timezone";

class PendingConnectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            pendingConnections: [],
        };
    }

    /**
     * @function getPendingConnections
     * @description This method is used to get pending connections list .
     */
    getPendingConnections = async () => {
        try {
            const connections = await ProfileService.getPendingConnections();
            if (connections.errors) {
                AlertUtil.showErrorMessage(connections.errors[0].endUserMessage);
                this.navigateToRespectiveScreen();
            } else {
                if (connections && connections.length < 1) {
                    this.navigateToRespectiveScreen();
                } else {
                    const pendingConnections = [];
                    connections.forEach(Connection => {
                        pendingConnections.push({
                            connectionId: Connection.connectionId,
                            joinedDate: Connection.joinedDate,
                            name: Connection.name,
                            profilePicture: Connection.profilePicture ? Connection.profilePicture : null,
                            type: Connection.type,
                            isConnected: true,
                        });
                    });
                    this.setState({pendingConnections: pendingConnections, isLoading: false});
                }
            }

        } catch (e) {
            console.warn(e);
            AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
            this.navigateToRespectiveScreen();
        }
    };

    componentDidMount = async () => {
        await this.getPendingConnections();
        this.props.fetchProfile();
    };


    /**
     * @function saveMemberTimeZone
     * @description This method is used to save current member timezone information
     */
    saveMemberTimeZone = async () => {
        try {
            this.setState({isLoading: true});
            const updateProfileTimezoneRequest = {
                timezoneId: momentTimeZone.tz.guess(true)
            }
            const response = await ProfileService.saveMemberTimeZone(updateProfileTimezoneRequest);
            if (response?.errors) {
                const errorMessage = response.errors[0]?.endUserMessage;
                AlertUtil.showErrorMessage(errorMessage);
                this.setState({isLoading: false});
            } else {
                console.log("Member timezone saved successfully");
                this.setState({isLoading: false});
            }
        } catch (e) {
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    }


    /**
     * @function navigateToRespectiveScreen
     * @description This method is used to navigate to the respective screen
     */
    navigateToRespectiveScreen = () => {
        this.saveMemberTimeZone();

        if (this.props.profile?.patient?.shortOnBoardingDetail?.postOnboardingAttempt) {
            this.navigateToTabView();
        } else {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                        routeName: Screens.MATCH_MAKER_SCREEN,
                        params: {
                            fromOnboardFlow: true
                        },
                    }
                )],
            });
            this.props.navigation.dispatch(resetAction);
        }
    };


    /**
     * @function navigateToTabView
     * @description This method is used to navigate to tab view
     */
    navigateToTabView = () => {
        const data = this.props.navigation.getParam("data", null);
        this.props.navigation.replace(Screens.TAB_VIEW, {data});
    };

    /**
     * @function navigateToChatList
     * @description This method is used to send accepted/rejected connections & moved to next screen.
     */
    navigateToChatList = async () => {
        const {pendingConnections} = this.state;
        const acceptedConnections = [], rejectedConnections = [];

        pendingConnections.forEach(pendingConnection => {
            if (pendingConnection.isConnected === true) {
                acceptedConnections.push(pendingConnection.connectionId);
            } else {
                rejectedConnections.push(pendingConnection.connectionId);
            }
        });

        const response = await ProfileService.processPendingConnections({acceptedConnections, rejectedConnections});
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.navigateToRespectiveScreen();
        } else {
            await this.newProviderSegmentEvents();
            this.navigateToRespectiveScreen();
        }
    };

    /**
     * @function newProviderSegmentEvents
     * @description This method is used to send segment events for selected connections.
     */
    newProviderSegmentEvents = async () => {
        const {pendingConnections} = this.state;
        const segmentProviderList = pendingConnections.filter(connection => connection.isConnected &&
            (connection.type === CONNECTION_TYPES.PRACTITIONER || connection.type === CONNECTION_TYPES.MATCH_MAKER));
        if (segmentProviderList && segmentProviderList.length > 0) {
            segmentProviderList.forEach(connection => {
                const segmentPayload = {
                    userId: this.props?.auth?.meta?.userId,
                    providerId: connection?.connectionId,
                    connectedAt: moment.utc(Date.now()).format(),
                    providerName: connection?.name,
                    providerRole: connection?.designation,
                };
                Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);
            });
        }
    };

    /**
     * @function stayConnected
     * @description This method is used to update pending connection status
     * @param connection
     */
    stayConnected = (connection) => {
        const {pendingConnections} = this.state;
        pendingConnections.forEach(pendingConnection => {
            if (connection.connectionId === pendingConnection.connectionId) {
                pendingConnection.isConnected = !pendingConnection.isConnected;
            }
        });
        this.setState({pendingConnections});
    };

    render() {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setBarStyle("dark-content", true);

        return (
            <PendingConnectionsComponent
                connections={this.state.pendingConnections}
                navigateToChatList={this.navigateToChatList}
                stayConnected={this.stayConnected}
                isLoading={this.state.isLoading}
            />
        );
    }

}

export default connectAuth()(PendingConnectionScreen);
