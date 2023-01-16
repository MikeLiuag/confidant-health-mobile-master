import React, {Component} from 'react';
import ProfileService from '../../services/Profile.service';
import {AlertUtil, arrayUniqueByKey, ContentfulClient, isMissed, ProgressReportComponent} from 'ch-mobile-shared';
import {connectProfile} from '../../redux';
import {Screens} from '../../constants/Screens';
import BillingService from "../../services/Billing.service";

class ProgressReportScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            outcomeCompleted: {},
            riskTags: {},
            isError: false,
            assignedContent: {totalCount: 0, assignedContent: []},
            subscriptionAmount: null,
            subscriptionPaused: false,
            totalEducationRead: [],
            subscriptions: null
        };
        this.screenWillFocusListener = null;
    }

    fetchSubscription = async () => {

        const response = await BillingService.getSubscription();
        if (response.errors) {
            AlertUtil.showErrorMessage('Something went wrong with the subscription service.');
            this.setState({isLoading: false});
        } else {
            if (response && response.subscriptionAmount) {
                this.setState({
                    isLoading: false,
                    subscriptionAmount: response.subscriptionAmount,
                    subscriptionPaused : response.cancelled
                });
            } else {
                this.setState({
                    isLoading: false,
                    subscriptionAmount: null,
                });
            }
        }
    };

    componentDidMount(): void {
        this.getAllContent();
        this.fetchSubscription();
        this.getPatientInsuranceProfile();
        this.progressReportRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.getAllContent();
                this.fetchSubscription();
            }
        );
    }

    componentWillUnmount(): void {
        if(this.progressReportRefresher) {
            this.progressReportRefresher.remove();
        }
        if (this.screenWillFocusListener) {
            this.screenWillFocusListener.remove();
        }

    }

    getContentAssignedToMe = async () => {
        this.props.fetchContentAssignedToMe();
    };

    updateContentTitles = async (contentActivityList) => {
        return Promise.all(contentActivityList.map(activity => {
            return this.getContentTitle(activity).then(title => {
                activity.referenceText = title;
            });
        }));
    };

    getContentTitle = (activity) => {
        const slugContent = activity.referenceText;
        let params = {
            'content_type': 'educationalContent',
            'sys.id': slugContent,
        };
        return ContentfulClient.getEntries(params).then(entries => {
            if (entries && entries.total > 0) {
                return  entries.items[0].fields.title;
            }
        });
    };

    getAllContent = async () =>{
        // this.setState({isLoading: true});
        try {
            this.getContentAssignedToMe();
            const data: any = await ProfileService.getUserActivity(
                this.props.auth.meta.userId,
            );
            if (data.errors) {
                this.setState({
                    isLoading: false,
                    isError: data.errors[0],
                });
            } else {
                const contentActivities =  data.recentActivities.filter(activity => activity.activityType === 'CONTENT');
                if (contentActivities && contentActivities.length > 0) {
                    await this.updateContentTitles(contentActivities);
                }

                this.setState({
                    isLoading: false,
                    isError: false,
                    recentActivities: data.recentActivities ? data.recentActivities : '',
                    totalActivitiesCount: data.totalRecentActivities,
                    outcomeCompleted: data.outcomeCompleted ? data.outcomeCompleted : '',
                    riskTags: data.riskTags ? data.riskTags : '',
                    totalEducationRead: data.totalEducationRead,
                    totalCompletedAppointments: data.totalCompletedAppointments,
                    totalCompletedConversations: data.totalCompletedConversations,
                    totalRecentActivities: data.totalRecentActivities,
                    walletBalance: data.walletBalance,
                });

            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false, isError: true});
        }

}


    backClicked = () => {
        this.props.navigation.goBack();
    };

    seeAll = props => {
        this.props.navigation.navigate(
            Screens.PROGRESS_REPORT_SEE_ALL_SCREEN,
            props,
        );
    };g

    NavigateToAppointmentsScreen = () => {
        this.props.navigation.navigate(Screens.APPOINTMENTS_SCREEN);
    };

    dctDetails = (dctId, scorable) => {
        this.props.navigation.navigate(
            Screens.DCT_REPORT_VIEW_SCREEN,
            {
                dctId ,scorable
            }
        );
    };

    assignContent = () => {
        this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN, {
            forAssignment: true
        });
    };

    navigateToContribution = ()=>{
        if(this.state.subscriptionAmount) {
            this.props.navigation.navigate(Screens.MY_CONTRIBUTION_SCREEN);
        } else {
            this.props.navigation.navigate(Screens.SUBSCRIPTION_REQUIRED_SCREEN, {
                manualSubscription: true
            })
        }
    };

    navigateToSubscriptionPackageScreen = ()=>{
            this.props.navigation.navigate(Screens.SUBSCRIPTION_PACKAGE_SCREEN,{getPatientSubscriptionPackage: this.getPatientInsuranceProfile, subscriptions: this.state.subscriptions});

    };

    getPatientInsuranceProfile = async () => {
        try {
            this.setState({ isLoading: true });
            const response = await BillingService.getPatientInsuranceProfile();
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({ isLoading: false });
            } else {
                this.setState({ isLoading: false, subscriptions: response.recurringSubscription});
            }

        } catch (e) {
            console.warn(e);
            AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
            this.setState({ isLoading: false });
        }
    };

    getPatientSubscriptionPackage = async () => {
        try {
            this.setState({ isLoading: true });
            const response = await BillingService.getPatientSubscriptionPackage();
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({ isLoading: false });
            } else {
                this.setState({ isLoading: false, subscriptions: response});
            }
        } catch (e) {
            console.warn(e);
            AlertUtil.showErrorMessage("Whoops ! something went wrong ! ");
            this.setState({ isLoading: false });
        }
    };


    getMergedSections = () => {
        return arrayUniqueByKey([...this.props.appointments.currentAppointments, ...this.props.appointments.pastAppointments], 'appointmentId');
    };

    getSegmentedAppointments = (appointments) => {
        const segments = {
            pending: [],
            current: [],
            past: [],
        };
        appointments.forEach(appointment => {
            if (appointment.status === 'NEEDS_ACTION') {
                segments.pending.push(appointment);
            } else {
                if (appointment.status === 'FULFILLED' || appointment.status === 'NO_SHOW' || appointment.status === 'CANCELLED' || (appointment.status === 'BOOKED' && isMissed(appointment))) {
                    segments.past.push(appointment);
                } else {
                    segments.current.push(appointment);
                }

            }
        });
        return segments;
    };

    render() {
        const appointmentSegments = this.getSegmentedAppointments(this.getMergedSections());
        const groupsJoined = this.props.connections.activeConnections.filter( connection => connection.type === 'CHAT_GROUP');
        const chatBots =  this.props.connections.activeConnections.filter( connection => connection.type === 'CHAT_BOT');
        const completedChatbots = chatBots.filter( bot => bot.progress?.completed === true);
        const careTeamMembers = this.props.connections.activeConnections.filter( connection => connection.type === 'MATCH_MAKER' || connection.type === 'PRACTITIONER')
        const completedArticlesCount = this.props.profile.markAsCompleted.filter(article=>article.slug!==null && article.slug!=='null').length
        return (
            <ProgressReportComponent
                backClicked={this.backClicked}
                profileData={this.props.profile.patient}
                activityData={this.state.recentActivities}
                totalEducationRead={completedArticlesCount}
                walletBalance={this.props.payment.wallet.balance}
                totalCompletedConversations={this.state.totalCompletedConversations}
                totalPastAppointments={appointmentSegments.past.length}
                totalBookedAppointments={appointmentSegments.current.length}
                groupsJoined={groupsJoined.length}
                completedChatBots={completedChatbots.length}
                retry={this.getAllContent}
                outcomeData={this.state.outcomeCompleted}
                riskTagsData={this.state.riskTags}
                hasAccess={true}
                totalActivitiesCount={this.state.totalActivitiesCount}
                assignedContent={this.props.educational.assignedContent}
                activityError={this.state.isError}
                isLoading={this.state.isLoading || this.props.profile.isLoading || this.props.educational.isLoading}
                seeAll={this.seeAll}
                dctDetails={this.dctDetails}
                assignContent={this.assignContent}
                isProviderApp={false}
                navigateToEducation={()=>{this.props.navigation.navigate(Screens.EDUCATION_READ_DETAILS_SCREEN)}}
                navigateToWallet={()=>{this.props.navigation.navigate(Screens.MY_WALLET_SCREEN)}}
                navigateToAppointments={this.NavigateToAppointmentsScreen}
                navigateToProfile={()=>{this.props.navigation.navigate(Screens.UPDATE_PROFILE_SCREEN)}}
                navigateToGroups={()=>{this.props.navigation.navigate(Screens.GROUP_ACTIVITY_SCREEN)}}
                navigateToChatbots={()=>{this.props.navigation.navigate(Screens.CHATBOT_ACTIVITY_SCREEN)}}
                navigateToSettings={()=>{this.props.navigation.navigate(Screens.SETTINGS_SCREEN);}}
                navigateToCareTeam={()=>{if(careTeamMembers.length>0){this.props.navigation.navigate(Screens.MY_CARE_TEAM_SCREEN);}}}
                navigateToContribution={this.navigateToContribution}
                navigateToSubscriptionPackageScreen={this.navigateToSubscriptionPackageScreen}
                navigateToSupportScreen = {()=>{this.props.navigation.navigate(Screens.SUPPORT_SCREEN)}}
                recurringSubscription = {this.state.subscriptions}
                careTeamMembers={careTeamMembers.length}
                subscriptionAmount={this.state.subscriptionAmount}
                subscriptionPaused={this.state.subscriptionPaused}
            />
        );
    }
}

export default connectProfile()(ProgressReportScreen);
