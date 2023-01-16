import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AlertUtil, ConnectionsV2Component, CONNECTION_TYPES, PENDING_CONNECTION_STATUS} from 'ch-mobile-shared';
import {connectConnections} from "../../redux";
import AlfieLoader from './../../components/Loader';
import moment from 'moment';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/Profile.service";
import {ERROR_NOT_FOUND, SEGMENT_EVENT} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";

class ConnectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.navLock = false;
        const patient = navigation.getParam('patient', null);
        this.state = {
            modalVisible: false,
            innerModalVisible: false,
            activeConnectionsVisible: true,
            patient: patient,
            activeConnections: this.props.connections.activeConnections,
            pastConnections: this.props.connections.pastConnections,
        };
    }

    componentDidMount(): void {
        this.connectionRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.props.fetchConnections();
            },
        );
    }

    componentWillUnmount(): void {
        if (this.connectionRefresher) {
            this.connectionRefresher.remove();
        }
    }


    /**
     * @function getConnectionSubText
     * @description This method is used to get connection sub Text..
     * @param connection
     */

    getConnectionSubText = connection => {
        if (this.state.activeConnectionsVisible) {
            if (connection.type === CONNECTION_TYPES.PRACTITIONER || connection.type === CONNECTION_TYPES.MATCH_MAKER) {
                return connection.designation;
            } else if (connection.type === CONNECTION_TYPES.PATIENT) {
                if (connection.lastModified) {
                    return (
                        'Connected Since ' +
                        moment(connection.lastModified).format('MMM YYYY')
                    );
                } else {
                    return '';
                }
            } else if (connection.type === CONNECTION_TYPES.CHAT_GROUP) {
                return 'Group Chat';
            } else {
                return 'Chatbot';
            }
        } else {
            if (connection.lastModified) {
                return (
                    'Disconnected Since ' +
                    moment(connection.lastModified).format('MMM YYYY')
                );
            } else {
                return '';
            }
        }
    };


    /**
     * @function backClicked
     * @description This method is used to navigate Back
     */
    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentWillReceiveProps = nextProps => {
        if (
            this.props.connections.activeConnections.length !==
            nextProps.connections.activeConnections.length ||
            this.props.connections.pastConnections.length !==
            nextProps.connections.pastConnections.length
        ) {
            this.setState({
                activeConnections: nextProps.connections.activeConnections,
                pastConnections: nextProps.connections.pastConnections,
            });
        }
    };


    /**
     * @function getSections
     * @description This method is used to get connections according to selected tab.
     */

    getSections = () => {
        const {activeConnectionsVisible, activeConnections, pastConnections} = this.state;
        let connections = activeConnectionsVisible ? activeConnections : pastConnections;
        connections = connections.filter(connection =>
            connection.type === CONNECTION_TYPES.PRACTITIONER || connection.type === CONNECTION_TYPES.PATIENT || connection.type === CONNECTION_TYPES.MATCH_MAKER
        ).map(item => {
            return {...item, value: item.name, key: item.connectionId}
        });
        return connections;
    };

    propagate = result => {
        this.setState({
            activeConnections: result.active,
            pastConnections: result.past,
        });
    };


    /**
     * @function navigateToProfile
     * @description This method is used to view profile.
     * @param connection
     */

    navigateToProfile = (connection) => {
        if (connection.type === CONNECTION_TYPES.PRACTITIONER) {
            const {patient} = this.props.profile;
            this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
                provider: {
                    userId: connection.connectionId,
                    name: connection.name,
                    profilePicture: connection.profilePicture,
                    type: connection.type
                },
                patient: {
                    userId: patient.userId,
                    nickName: patient.fullName,
                },
            });
        } else if (connection.type === CONNECTION_TYPES.MATCH_MAKER) {
            const {patient} = this.props.profile;
            this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, {
                provider: {
                    userId: connection.connectionId,
                    name: connection.name,
                    avatar: connection.profilePicture,
                    profilePicture: connection.profilePicture,
                    type: connection.type,
                },
                patient: {
                    userId: patient.userId,
                    nickName: patient.fullName,
                },
            });

        } else if (connection.type === CONNECTION_TYPES.PATIENT) {
            this.props.navigation.navigate(Screens.MEMBER_PROFILE_SCREEN, {
                userId: connection.connectionId,
                name: connection.name,
                profilePicture: connection.profilePicture,
                lastModified: connection.lastModified,
                isConnected: this.state.activeConnectionsVisible,
            });
        } else if (connection.type === CONNECTION_TYPES.CHAT_GROUP) {
            this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
                ...connection
            })
        } else {
            this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {contact: connection});
        }
    };


    /**
     * @function navigateToChat
     * @description This method is used to navigate to chat
     * @param selectedConnection
     */
    navigateToChat = (selectedConnection) => {
        if (selectedConnection.type === CONNECTION_TYPES.CHAT_BOT) {
            this.props.navigation.navigate(Screens.CHAT_INSTANCE, {contact: selectedConnection});
        } else {
            if (this.props.chat.sendbirdStatus === 2) {
                this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                    provider: {...selectedConnection, userId: selectedConnection.connectionId},
                    referrer: Screens.TAB_VIEW,
                    patient: this.props.auth.meta,
                    connection: selectedConnection,
                });
            } else {
                AlertUtil.showErrorMessage("Please wait until chat service is connected");
            }
        }
        setTimeout(() => {
        }, 1000);
    }

    /**
     * @function getFeedbackSummary
     * @description This method is used to navigate to get provider feedback summary
     * @param providerId
     *
     */

    getFeedbackSummary = async (providerId) => {
        try {
            const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(providerId);
            if (feedbackSummaryDetails.errors) {
                console.warn(feedbackSummaryDetails.errors[0].endUserMessage);
                if (feedbackSummaryDetails.errors[0].errorCode !== ERROR_NOT_FOUND) {
                    AlertUtil.showErrorMessage(
                        feedbackSummaryDetails.errors[0].endUserMessage,
                    );
                }
            } else {
                this.setState({
                    feedbackSummary: feedbackSummaryDetails,
                });
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage("Unable to retrieve feedback summary");
        }
    };

    navigateToProhibitiveScreen = ()=>{
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }


    /**
     * @function navigateToRequestAppointment
     * @description This method is used to navigate to select service screen
     * @param selectedConnection
     */

    navigateToRequestAppointment = async (selectedConnection) => {

        if(this.props.profile.patient.isPatientProhibitive){
            this.navigateToProhibitiveScreen()
        }
        else {
            selectedConnection.userId = selectedConnection.connectionId;
            const { feedbackSummary } = this.state;
            await this.getFeedbackSummary(selectedConnection.userId);
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                selectedProvider: { ...selectedConnection, ...feedbackSummary },
            });
        }
    }

    /**
     * @function disconnect
     * @description This method is used to disconnect selected connection
     * @param selectedConnection
     */
    disconnect = async (selectedConnection) => {
        this.onClose();
        this.props.disconnect({userId: selectedConnection.connectionId});
    }

    connect = async (selectedConnection) => {
        this.onClose();
        this.props.connect({userId: selectedConnection.connectionId});
    }

    /**
     * @function connectWithProvider
     * @description This method is used to connect with provider
     * @param selectedConnection
     */
    connectWithProvider = (selectedConnection) => {
        this.navigateToAccessSelection(selectedConnection);
    };


    /**
     * @function navigateToAccessSelection
     * @description This method is used to navigate to provider access screen
     * @param selectedConnection
     */
    navigateToAccessSelection = (selectedConnection) => {
        if (selectedConnection.type === CONNECTION_TYPES.PRACTITIONER || selectedConnection.type === CONNECTION_TYPES.MATCH_MAKER) {
            this.props.navigation.navigate(Screens.PROVIDER_ACCESS_SCREEN, {
                patientInfo: this.props.auth.meta,
                providerInfo: {...selectedConnection, userId: selectedConnection.connectionId},
            });
        }
    };


    /**
     * @function createGroup
     * @description This method is used to create group
     */
    createGroup = () => {
        this.onClose();
        this.props.navigation.navigate(Screens.CREATE_GROUP_SCREEN);
    };

    /**
     * @function showModal
     * @description This method is used to show modal
     */
    showModal = () => {
        if (!this.navLock) {
            this.setState({...this.state, modalVisible: true});
        }
    };

    /**
     * @function onClose
     * @description This method is used to close modal .
     */
    onClose = () => {
        this.setState({modalVisible: false});
    };

    /**
     * @function sectionChanged
     * @description This method is used to change section
     * @param activeConnectionsVisible
     */
    sectionChanged = activeConnectionsVisible => {
        this.setState({...this.state, activeConnectionsVisible});
    };

    /**
     * @function newProviderSegmentEvent
     * @description This method is used to send segment event for new provider connection
     * @param connection
     */
    newProviderSegmentEvent = async (connection) => {
        if(connection.type === CONNECTION_TYPES.PRACTITIONER || connection.type === CONNECTION_TYPES.MATCH_MAKER) {
            const segmentPayload = {
                userId: this.props?.auth?.meta?.userId,
                providerId: connection?.connectionId,
                connectedAt: moment.utc(Date.now()).format(),
                providerName: connection?.name,
                providerRole: connection?.designation
            };
            await Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);
        }
    }


    /**
     * @function navigateToTabView
     * @description This method is used to navigate to Tab view
     */
    navigateToTabView = () => {
        this.props.navigation.replace(Screens.TAB_VIEW);
    }

    /**
     * @function updatePendingConnections
     * @description This method is used to accept new connections
     * @param connection , connectionStatus
     */
    updatePendingConnections = async (connection,connectionStatus) => {
        this.setState({ isLoading : true });
        const {connections} = this.props;
        let acceptedConnections = [] , rejectedConnections = [];
        if(connectionStatus === PENDING_CONNECTION_STATUS.ACCEPTED){
            acceptedConnections.push(connection.connectionId);
        }else{
            const newConnection = connections?.pendingConnections?.find(connection => connection.connectionId === connection.connectionId);
            rejectedConnections.push(newConnection.connectionId);
        }
        const response = await ProfileService.processPendingConnections({acceptedConnections, rejectedConnections})
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.navigateToTabView();
        } else {
            this.props.fetchConnections();
            await this.newProviderSegmentEvent(connection);
            this.setState({isLoading:false})
        }
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.connections.isLoading) {
            return <AlfieLoader/>;
        }
        return (

            <ConnectionsV2Component
                isLoading={this.state.isLoading}
                connections={this.props.connections}
                navigateToProfile={this.navigateToProfile}
                navigateToChat={this.navigateToChat}
                navigateToRequestAppointment={this.navigateToRequestAppointment}
                connect={this.connect}
                disconnect={this.disconnect}
                backClicked={this.backClicked}
                updatePendingConnections = {this.updatePendingConnections}
            />
        );
    }
}


export default connectConnections()(ConnectionScreen);
