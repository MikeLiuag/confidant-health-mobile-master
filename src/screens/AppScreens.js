import OnBoardingScreen from './on-boarding/OnBoarding.screen';
import {Screens} from '../constants/Screens';
import UpdateProfileScreen from './update-profile/UpdateProfile.screen';
import VideoCall from './tele-session/VideoCall.screen';
import {ChatInstance, ChatListScreen, ChatBotListScreen} from './chat';
import EducationalContentPieceScreen from './educational-content/content-pieces/EducationalContentPiece';
import ProviderListScreen from './live-chat/ProviderList.screen';
import ProviderDetailScreen from './live-chat/ProviderDetail.screen';
import LiveChatWindowScreen from './live-chat/LiveChatWindow.screen';
import ProgressReportScreen from './progress-report/ProgressReport.screen';
import ProgressReportSeeAllScreen from './progress-report/ProgressReportSeeAll.screen';
import TopicListScreen from './learning-library/TopicListScreen';
import PrivacyPolicy from './privacy-policy/PrivacyPolicy';
import Support from './settings/info/Support.screen';
import About from './settings/info/About.screen';
import TermsOfService from './terms-of-service/TermsOfService';
import ProviderSearchScreen from './live-chat/ProviderSearch.screen';
import CompletedSessionScreen from './tele-session/CompletedSession.screen';
import TelehealthWelcomeScreen from './tele-session/TelehealthWelcome.screen';
import ProviderAccessScreen from './live-chat/ProviderAccess.screen';
import InvitationScreen from './connections/Invitation.screen';
import ConnectionScreen from './connections/Connections.screen';
import ReviewDetailScreen from './live-chat/ReviewDetail.screen';
import TopicContentListScreen from './learning-library/TopicContentList.screen';
import WaitingRoomScreen from './tele-session/WaitingRoom.screen';
import PendingConnectionScreen from './connections/PendingConnection.screen';
import DCTReportViewScreen from './progress-report/DCTReportView.screen';
import OutcomeDetailScreen from './outcome/OutcomeDetail.screen';
import ContentSharingScreen from './learning-library/ContentSharing.screen';
import TakeAssessmentScreen from './chat/TakeAssessment.screen';
import FeedbackScreen from './learning-library/Feedback.screen';
import AppointmentSelectProviderScreen from './appointments/ApptSelectProvider.screen';
import AppointmentSelectServiceScreen from './appointments/ApptSelectService.screen';
import AppointmentSelectDateTimeScreen from './appointments/ApptSelectDateTime.screen';
import AppointmentConfirmDetailsScreen from './appointments/ApptConfirmDetails.screen';
import AppointmentEditMessageScreen from './appointments/ApptEditMessage.screen';
import SettingsScreen from './settings/Settings.screen';
import AppointmentsScreen from './appointments/Appointments.screen';
import AppointmentDetailsScreen from './appointments/AppointmentDetails.screen';
import AppointmentSubmittedScreen from "./appointments/AppointmentSubmitted.screen";
import SectionListScreen from "./learning-library/SectionList.screen";
import ChatbotProfileScreen from "./chat/ChatbotProfile";
import MemberProfileScreen from "./live-chat/MemberProfile.screen";
import NotificationScreen from "./settings/Notification.screen";
import PaymentCardScreen from './payment/PaymentCard.screen';
import SessionCostScreen from './payment/SessionCostScreen';
import SessionPaidScreen from './payment/SessionPaidScreen';
import CardListScreen from './payment/CardList.screen';
import InvoiceScreen from './payment/Invoice.screen';
import CreateGroupScreen from './group/CreateGroup.screen';
import AddMembersScreen from './group/AddMembers.screen';
import GroupDetailScreen from './group/GroupDetails.screen';

import MatchMakerDetailScreen from './live-chat/MatchMakerDetail.screen';
import TypeFormWebScreen from './service-request/TypeFormWeb.screen';
import ServiceListScreen from './service-request/ServiceList.screen';
import MyWalletScreen from './payment/wallet/MyWallet.screen';
import GroupCallScreen from './group/GroupCall.screen';
import MagicLinkScreen from './patient-onboarding/MagicLink.screen';
import SentMagicLinkScreen from './patient-onboarding/SentMagicLink.screen';
import EnterNameScreen from './on-boarding/EnterName.screen';
import SelectGoalsScreen from './on-boarding/SelectGoals.screen';
import EnterZipCodeScreen from './patient-onboarding/EnterZipCode.screen';
import EnterProviderCodeScreen from './patient-onboarding/EnterProviderCode.screen';
import ProfileImageScreen from './on-boarding/ProfileImage.screen';
import SignupNotificationsScreen from './on-boarding/SignupNotifications.screen';
import GenericPaymentScreen from './payment/GenericPayment.screen';
import GroupRulesViewScreen from './group/GroupRulesView.screen';
import EnterDateOfBirthScreen from './patient-onboarding/EnterDateOfBirth.screen';
import PatientInformationScreen from './appointments/PatientInformation.screen';
import MediaViewScreen from './live-chat/MediaViewScreen';
import AlfieQuestionScreen from './tele-session/AlfieQuestion.screen';
import PrivateFeedbackScreen from './tele-session/PrivateFeedback.screen';
import PublicFeedbackScreen from './tele-session/PublicFeedback.screen';
import SendFeedbackScreen from './tele-session/SendFeedback.screen';
import RewardPointsScreen from './tele-session/RewardPoints.screen';
import AddPaymentMethodAndPayScreen from './tele-session/AddPaymentMethodAndPay.screen';
import ConsentScreen from './appointments/Consent.screen';
import ExclusionCriteriaScreen from './on-boarding/ExclusionCriteria.screen';
import EmergencyServiceScreen from './on-boarding/EmergencyService.screen';
import ConfirmAndPayScreen from './tele-session/ConfirmAndPay.screen';
import SubscriptionRequiredScreen from './on-boarding/SubscriptionRequired.screen';
import PrivacyDisclosureScreen from './on-boarding/PrivacyDisclosure.screen';
import SelfScheduleStartScreen from './service-request/SelfScheduleStart.screen';
import ApptSelectServiceTypeScreen from './appointments/ApptSelectServiceType.screen';
import ApptSelectServiceByTypeScreen from './appointments/ApptSelectServiceByType.screen';
import ApptSelectServiceByTypeDetailScreen from './appointments/ApptSelectServiceDetail.screen';
import GroupDonationScreen from './group/GroupDonation.screen';
import GroupPayItForwardScreen from './group/GroupPayItForward.screen';
import GroupContributionScreen from './group/GroupContribution.screen';
import GroupRewardPointsScreen from './group/GroupRewardPoints.screen';
import PostSessionContributionScreen from './payment/PostSessionContributionScreen';
import {CommunityCongratsScreen} from './tele-session/CommunityCongrats.screen';
import onBoardingContributionScreen from './on-boarding/OnBoardingContribution.screen';
import MyCareTeamScreen from './progress-report/MyCareTeam.screen';
import MyContributionScreen from './progress-report/MyContribution.screen';
import NewApptDetailsScreen from './appointments/NewApptDetails.screen';
import ProviderFeedbackScreen from './appointments/ProviderFeedback.screen';
import NewChatUiItemsScreen from './chat/NewChatUiItems.screen';
import EducationReadDetailsScreen from './progress-report/EducationReadDetails.screen';
import NewPaymentDetailsScreen from './payment/NewPaymentDetails.screen';
import CommunityPaymentScreen from './payment/CommunityPayment.screen';
import SessionRewardScreen from './payment/SessionReward.screen';
import ChatBotActivity from './progress-report/ChatBotActivity.screen';
import GroupActivity from './progress-report/GroupActivity.screen';
import ExclusionCriteriaForCliniciansScreen from './patient-onboarding/ExclusionCriteriaForClinicians.screen';
import ExclusionCriteriaNotPassedScreen from './patient-onboarding/ExclusionCriteriaNotPassed.screen';
import AllGroupsScreen from './group/AllGroups.screen';
import NewGroupDetailsScreen from './group/NewGroupDetails.screen';
import NewGroupContributionScreen from './group/NewGroupContribution.screen';
import NewContributionDoneScreen from './group/NewContributionDone.screen';
import TelehealthSessionV2Screen from './tele-session/TelehealthSessionV2.screen';
import RevampTypeHomeScreen from "./revamp/RevampTypeHome.screen";
import RevampQuestionsScreen from "./revamp/RevampQuestions.screen";
import RevampRewardPointScreen from "./revamp/RevampRewardPoint.screen";
import RevampOnBoardingProgressScreen from "./revamp/RevampOnBoardingProgress.screen";
import RevampScheduleActivityScreen from "./revamp/RevampScheduleActivity.screen";
import RevampCheckInActivityScreen from "./revamp/RevampCheckInActivity.screen";
import RevampPlanOnboardingScreen from './revamp/RevampPlanOnboarding.screen';
import AddToYourPrioritiesScreen from './revamp-home/AddToYourPriorities.screen';
import PlanHomeDetailsScreen from './revamp-home/PlanHomeDetails.screen';
import WelcomeScreen from './on-boarding/Welcome.screen';
import PersonalizedWelcomeScreen from './on-boarding/PersonalizedWelcome.screen';
import SelectStateScreen from './on-boarding/SelectState.screen';
import DifficultiesScreen from './on-boarding/Difficulties.screen';
import ProviderInterestScreen from './on-boarding/ProviderInterest.screen';
import LifeEventsScreen from './on-boarding/LifeEvents.screen';
import RealPersonScreen from './on-boarding/RealPerson.screen';
import TimeOfDayScreen from './on-boarding/TimeOfDay.screen';
import AccessAndQualityScreen from './on-boarding/AccessAndQuality.screen';
import ContributionGateScreen from './on-boarding/ContributionGate.screen';
import RevampAllActivitiesScreen from "./revamp/RevampAllActivities.screen";
import RevampAddActivitiesScreen from "./revamp/RevampAddActivities.screen";
import RevampTokenSpinnerScreen from "./revamp/RevampTokenSpinner.screen";
import ApptStateLimitedConsentScreen from "./appointments/ApptStateLimitedConsent.screen";
import ApptStateLimitedConsentRejectionScreen from "./appointments/ApptStateLimitedConsentRejection.screen";
import CustomChatView from "../components/chat/CustomChatView";
import SundayCheckInHomeScreen from "./revamp/SundayCheckInHome.screen";
import RevampSundayCheckInQuestionsScreen from "./revamp/RevampSundayCheckInQuestions.screen";
import RevampPlanSundayCheckInScreen from "./revamp/RevampPlanSundayCheckIn.screen";
import ApptPaymentOptionsScreen from "./payment/ApptPaymentOptions";
import ApptActualPriceScreen from "./payment/ApptActualPrice";
import ApptInsuranceListScreen from "./payment/ApptIssuranceList";
import ApptOtherInsuranceOptionsListScreen from "./payment/OtherIssuranceOptionsList";
import PatientProhibitiveScreen from "./appointments/PatientProhibitiveScreen";
import RevampProgressReportScreen from "./revamp-home/RevampProgressReport.screen";

import ChoosePathScreen from "./on-boarding/ChoosePath.screen"
import EnterPhoneScreen from "./on-boarding/EnterPhone.screen";
import MatchMakerScreen from "./on-boarding/MatchMaker.screen";
import EnterEmailScreen from "./on-boarding/EnterEmail.screen";
import ScheduleScreen from "./on-boarding/Schedule.screen";
import SubscriptionPackageScreen from "./payment/SubscriptionPackageScreen";


export function getAuthScreens() {
  const authScreens = {};
  authScreens[Screens.ON_BOARDING_SCREEN] = OnBoardingScreen;
  authScreens[Screens.WELCOME_SCREEN] = WelcomeScreen;
  authScreens[Screens.PERSONALIZED_WELCOME_SCREEN] = PersonalizedWelcomeScreen;
  authScreens[Screens.SELECT_STATE_SCREEN] = SelectStateScreen;
  //authScreens[Screens.DIFFICULTIES_SCREEN] = DifficultiesScreen;
  //authScreens[Screens.PROVIDER_INTEREST_SCREEN] = ProviderInterestScreen;
  authScreens[Screens.LIFE_EVENTS_SCREEN] = LifeEventsScreen;
  authScreens[Screens.REAL_PERSON_SCREEN] = RealPersonScreen;
  authScreens[Screens.TIME_OF_DAY_SCREEN] = TimeOfDayScreen;
  authScreens[Screens.SIGNUP_NOTIFICATION_SCREEN] = SignupNotificationsScreen;
  authScreens[Screens.PRIVACY_POLICY_SCREEN] = PrivacyPolicy;
  authScreens[Screens.TERMS_OF_SERVICE_SCREEN] = TermsOfService;
  authScreens[Screens.ENTER_NAME_SCREEN] = EnterNameScreen;
  authScreens[Screens.ENTER_DATE_OF_BIRTH] = EnterDateOfBirthScreen;
  authScreens[Screens.SELECT_GOALS_SCREEN] = SelectGoalsScreen;
  authScreens[Screens.ENTER_ZIP_CODE_SCREEN] = EnterZipCodeScreen;
  authScreens[Screens.EXCLUSION_CRITERIA_SCREEN] = ExclusionCriteriaScreen;
  authScreens[Screens.EMERGENCY_SERVICE_SCREEN] = {
    name: Screens.EMERGENCY_SERVICE_SCREEN,
    screen: EmergencyServiceScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };

  authScreens[Screens.PRIVACY_DISCLOSURE_SCREEN] = PrivacyDisclosureScreen;
  authScreens[Screens.MAGIC_LINK_SCREEN] = MagicLinkScreen;
  authScreens[Screens.SENT_MAGIC_LINK_SCREEN] = SentMagicLinkScreen;
  authScreens[Screens.CHOOSE_PATH_SCREEN] = ChoosePathScreen;
  authScreens[Screens.SCHEDULE_SCREEN] = ScheduleScreen;
  return authScreens;
}

export function getAppScreens() {
  const appScreens = {};
  appScreens[Screens.PENDING_CONNECTIONS_SCREEN] = PendingConnectionScreen;
  appScreens[Screens.CHAT_INSTANCE] = ChatInstance;
  appScreens[Screens.CUSTOM_CHAT_VIEW] = {
    name: Screens.CUSTOM_CHAT_VIEW,
    screen: CustomChatView,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.SIGNUP_NOTIFICATION_SCREEN] = SignupNotificationsScreen;
  appScreens[Screens.UPDATE_PROFILE_SCREEN] = UpdateProfileScreen;
  appScreens[Screens.PROVIDER_LIST_SCREEN] = ProviderListScreen;
  appScreens[Screens.PROVIDER_DETAIL_SCREEN] = ProviderDetailScreen;
  appScreens[Screens.LIVE_CHAT_WINDOW_SCREEN] = LiveChatWindowScreen;
  appScreens[Screens.VIDEO_CALL] = {
    name: Screens.VIDEO_CALL,
    screen: VideoCall,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.TELE_SESSION_V2] =  {
    name: Screens.TELE_SESSION_V2,
    screen: TelehealthSessionV2Screen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.CHAT_CONTACT_LIST] = ChatListScreen;
  appScreens[Screens.CHATBOT_LIST_SCREEN] = ChatBotListScreen;
  appScreens[Screens.EDUCATIONAL_CONTENT_PIECE] = EducationalContentPieceScreen;
  appScreens[Screens.TOPIC_LIST_SCREEN] = TopicListScreen;
  appScreens[Screens.PROGRESS_REPORT_SEE_ALL_SCREEN] = ProgressReportSeeAllScreen;
  appScreens[Screens.PROGRESS_REPORT_SEE_ALL_SCREEN_DCT] = ProgressReportSeeAllScreen;
  appScreens[Screens.PRIVACY_POLICY_SCREEN] = PrivacyPolicy;
  appScreens[Screens.SUPPORT_SCREEN] = Support;
  appScreens[Screens.ABOUT_SCREEN] = About;
  appScreens[Screens.TERMS_OF_SERVICE_SCREEN] = TermsOfService;
  appScreens[Screens.PROVIDER_SEARCH] = ProviderSearchScreen;
  appScreens[Screens.TELEHEALTH_WELCOME] = TelehealthWelcomeScreen;
  appScreens[Screens.COMPLETED_SESSION] = CompletedSessionScreen;
  appScreens[Screens.PRIVATE_FEEDBACK_SCREEN] = PrivateFeedbackScreen;
  appScreens[Screens.PUBLIC_FEEDBACK_SCREEN] = PublicFeedbackScreen;
  appScreens[Screens.SEND_FEEDBACK_SCREEN] = SendFeedbackScreen;
  appScreens[Screens.PROVIDER_ACCESS_SCREEN] = ProviderAccessScreen;
  appScreens[Screens.INVITATION] = InvitationScreen;
  appScreens[Screens.REVIEW_DETAIL_SCREEN] = ReviewDetailScreen;
  appScreens[Screens.TOPIC_CONTENT_LIST_SCREEN] = TopicContentListScreen;
  appScreens[Screens.WAITING_ROOM_SCREEN] = WaitingRoomScreen;
  appScreens[Screens.DCT_REPORT_VIEW_SCREEN] = DCTReportViewScreen;
  appScreens[Screens.OUTCOME_DETAIL_SCREEN] = OutcomeDetailScreen;
  appScreens[Screens.ASSIGNABLE_CONTENT_LIST] = ContentSharingScreen;
  appScreens[Screens.TAKE_ASSESSMENT_SCREEN] = TakeAssessmentScreen;
  appScreens[Screens.FEEDBACK_SCREEN] = FeedbackScreen;
  appScreens[Screens.APPT_PATIENT_INFORMATION_SCREEN] = PatientInformationScreen;
  appScreens[Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN] = AppointmentSelectProviderScreen;
  appScreens[Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN] = AppointmentSelectServiceScreen;
  appScreens[Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN] = AppointmentSelectDateTimeScreen;
  appScreens[Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN] = AppointmentConfirmDetailsScreen;
  appScreens[Screens.REQUEST_APPT_STATE_CONSENT_SCREEN] = ApptStateLimitedConsentScreen;
  appScreens[Screens.REQUEST_APPT_STATE_CONSENT_REJECTION_SCREEN] = ApptStateLimitedConsentRejectionScreen;
  appScreens[Screens.APPT_SELECT_SERVICE_TYPE_SCREEN] = ApptSelectServiceTypeScreen;
  appScreens[Screens.APPT_SELECT_SERVICE_BY_TYPE_SCREEN] = ApptSelectServiceByTypeScreen;
  appScreens[Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN] = ApptSelectServiceByTypeDetailScreen;
  appScreens[Screens.REQUEST_APPT_EDIT_MESSAGE_SCREEN] = AppointmentEditMessageScreen;
  appScreens[Screens.CONFIRM_AND_PAY_SCREEN] = ConfirmAndPayScreen;
  appScreens[Screens.APPOINTMENT_SUBMITTED] = {
    name: Screens.APPOINTMENT_SUBMITTED,
    screen: AppointmentSubmittedScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.APPOINTMENT_DETAILS_SCREEN] = AppointmentDetailsScreen;
  appScreens[Screens.NOTIFICATION_SCREEN] = NotificationScreen;
  appScreens[Screens.SETTINGS_SCREEN] = SettingsScreen;
  appScreens[Screens.ACCESS_AND_QUALITY_SCREEN] = AccessAndQualityScreen;
  appScreens[Screens.DIFFICULTIES_SCREEN] = DifficultiesScreen;
  appScreens[Screens.PROVIDER_INTEREST_SCREEN] = ProviderInterestScreen;
  appScreens[Screens.CONTRIBUTION_GATE_SCREEN] = ContributionGateScreen;
  appScreens[Screens.PAYMENT_SCREEN] = PaymentCardScreen;
  appScreens[Screens.CHATBOT_PROFILE] = ChatbotProfileScreen;
  appScreens[Screens.MEMBER_PROFILE_SCREEN] = MemberProfileScreen;
  appScreens[Screens.SESSION_COST_SCREEN] = SessionCostScreen;
  appScreens[Screens.SESSION_PAID_SCREEN] = SessionPaidScreen;
  appScreens[Screens.CARD_LIST_SCREEN] = CardListScreen;
  appScreens[Screens.INVOICE_SCREEN] = InvoiceScreen;
  appScreens[Screens.CREATE_GROUP_SCREEN] = CreateGroupScreen;
  appScreens[Screens.ADD_MEMBERS_SCREEN] = AddMembersScreen;
  appScreens[Screens.GROUP_DETAIL_SCREEN] = GroupDetailScreen;
  appScreens[Screens.MATCH_MAKER_DETAIL_SCREEN] = MatchMakerDetailScreen;
  appScreens[Screens.CONNECTIONS_SCREEN] = ConnectionScreen;
  appScreens[Screens.TYPE_FORM_SCREEN] = TypeFormWebScreen;
  appScreens[Screens.MY_WALLET_SCREEN] = MyWalletScreen;
  appScreens[Screens.ENTER_PROVIDER_CODE_SCREEN] = EnterProviderCodeScreen;
  appScreens[Screens.PROFILE_IMAGE_SCREEN] = ProfileImageScreen;
  appScreens[Screens.CONSENT_SCREEN] = ConsentScreen;
  appScreens[Screens.ON_BOARDING_CONTRIBUTION_SCREEN] = onBoardingContributionScreen;
  appScreens[Screens.ENTER_NAME_SCREEN] = EnterNameScreen;
  appScreens[Screens.GENERIC_PAYMENT_SCREEN] = GenericPaymentScreen;
  appScreens[Screens.GROUP_RULES_ACCEPT_SCREEN] = GroupRulesViewScreen;
  appScreens[Screens.GENERIC_MEDIA_VIEW] = MediaViewScreen;
  appScreens[Screens.ALFIE_QUESTION_SCREEN] = AlfieQuestionScreen;
  appScreens[Screens.REWARD_POINTS_SCREEN] = RewardPointsScreen;
  appScreens[Screens.EXCLUSION_CRITERIA_SCREEN] = ExclusionCriteriaScreen;
  appScreens[Screens.SUBSCRIPTION_REQUIRED_SCREEN] = SubscriptionRequiredScreen;
  appScreens[Screens.POST_SESSION_CONTRIBUTION_SCREEN] = PostSessionContributionScreen;
  appScreens[Screens.COMMUNITY_CONGRATS_SCREEN] = CommunityCongratsScreen;
  appScreens[Screens.COMMUNITY_PAYMENT_SCREEN] = CommunityPaymentScreen;
  appScreens[Screens.SESSION_REWARD_SCREEN] = SessionRewardScreen;
  appScreens[Screens.MY_CARE_TEAM_SCREEN] = MyCareTeamScreen;
  appScreens[Screens.MY_CONTRIBUTION_SCREEN] = MyContributionScreen;
  appScreens[Screens.NEW_APPT_DETAILS_SCREEN] = NewApptDetailsScreen;
  appScreens[Screens.PROVIDER_FEEDBACK_SCREEN] = ProviderFeedbackScreen;
  appScreens[Screens.NEW_CHAT_UI_ITEMS_SCREEN] = NewChatUiItemsScreen;
  appScreens[Screens.NEW_PAYMENT_DETAILS_SCREEN] = NewPaymentDetailsScreen;
  appScreens[Screens.ALL_GROUPS_SCREEN] = AllGroupsScreen;
  appScreens[Screens.NEW_GROUP_DETAILS_SCREEN] = NewGroupDetailsScreen;
  appScreens[Screens.NEW_GROUP_CONTRIBUTION_SCREEN] = NewGroupContributionScreen;
  appScreens[Screens.NEW_CONTRIBUTION_DONE_SCREEN] = NewContributionDoneScreen;
  appScreens[Screens.GROUP_CALL_SCREEN] =  {
    name: Screens.GROUP_CALL_SCREEN,
    screen: GroupCallScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };

  appScreens[Screens.GROUP_DONATION_SCREEN] = GroupDonationScreen;
  appScreens[Screens.GROUP_PAY_IT_FORWARD_SCREEN] = GroupPayItForwardScreen;
  appScreens[Screens.GROUP_CONTRIBUTION_SCREEN] = GroupContributionScreen;
  appScreens[Screens.GROUP_REWARD_POINTS_SCREEN] = GroupRewardPointsScreen;
  appScreens[Screens.GROUP_DONATION_SCREEN] = GroupDonationScreen;
  appScreens[Screens.GROUP_PAY_IT_FORWARD_SCREEN] = GroupPayItForwardScreen;
  appScreens[Screens.GROUP_CONTRIBUTION_SCREEN] = GroupContributionScreen;
  appScreens[Screens.GROUP_REWARD_POINTS_SCREEN] = GroupRewardPointsScreen;
  appScreens[Screens.ADD_PAYMENT_METHOD_AND_PAY_SCREEN] = AddPaymentMethodAndPayScreen;
  appScreens[Screens.EDUCATION_READ_DETAILS_SCREEN] = EducationReadDetailsScreen;
  appScreens[Screens.CHATBOT_ACTIVITY_SCREEN] = ChatBotActivity;
  appScreens[Screens.GROUP_ACTIVITY_SCREEN] = GroupActivity;
  appScreens[Screens.EXCLUSION_CRITERIA_FOR_CLINICIANS_SCREEN] = ExclusionCriteriaForCliniciansScreen;
  appScreens[Screens.EXCLUSION_CRITERIA_NOT_PASSED_SCREEN] = ExclusionCriteriaNotPassedScreen;
  appScreens[Screens.NEW_GROUP_DETAILS_SCREEN] = NewGroupDetailsScreen;
  appScreens[Screens.REVAMP_TYPE_HOME_SCREEN] = RevampTypeHomeScreen;
  appScreens[Screens.REVAMP_QUESTIONS_SCREEN] = {
    name: Screens.REVAMP_QUESTIONS_SCREEN,
    screen: RevampQuestionsScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.REVAMP_REWARD_POINT_SCREEN] = {
    name: Screens.REVAMP_REWARD_POINT_SCREEN,
    screen: RevampRewardPointScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.REVAMP_ON_BOARDING_PROGRESS_SCREEN] = RevampOnBoardingProgressScreen;
  appScreens[Screens.REVAMP_SCHEDULE_ACTIVITY] = RevampScheduleActivityScreen;
  appScreens[Screens.REVAMP_CHECK_IN_ACTIVITY] = RevampCheckInActivityScreen;
  appScreens[Screens.REVAMP_PLAN_ONBOARDING] = {
    name: Screens.REVAMP_PLAN_ONBOARDING,
    screen: RevampPlanOnboardingScreen,
    navigationOptions: {
      gesturesEnabled: false,
    },
  };
  appScreens[Screens.ADD_YOUR_PRIORITIES_SCREEN] = AddToYourPrioritiesScreen;
  appScreens[Screens.PLAN_HOME_DETAILS_SCREEN] = PlanHomeDetailsScreen;
  appScreens[Screens.REVAMP_ALL_ACTIVITIES_SCREEN] = RevampAllActivitiesScreen;
  appScreens[Screens.REVAMP_ADD_ACTIVITIES_SCREEN] = RevampAddActivitiesScreen;
  appScreens[Screens.REVAMP_TOKEN_SPINNER_SCREEN] = RevampTokenSpinnerScreen;
  appScreens[Screens.SUNDAY_CHECK_IN_HOME_SCREEN] = SundayCheckInHomeScreen;
  appScreens[Screens.REVAMP_SUNDAY_CHECK_IN_QUESTIONS_SCREEN] = RevampSundayCheckInQuestionsScreen;
  appScreens[Screens.REVAMP_PLAN_SUNDAY_CHECKIN_SCREEN] = RevampPlanSundayCheckInScreen;
  appScreens[Screens.PATIENT_PROHIBITIVE_SCREEN] = PatientProhibitiveScreen;
  appScreens[Screens.APPOINTMENT_PAYMENT_OPTIONS_SCREEN] = ApptPaymentOptionsScreen;
  appScreens[Screens.APPOINTMENT_ACTUAL_PRICE_SCREEN] = ApptActualPriceScreen;
  appScreens[Screens.APPOINTMENT_INSURANCE_LIST_SCREEN] = ApptInsuranceListScreen;
  appScreens[Screens.APPOINTMENT_OTHER_INSURANCE_OPTIONS_LIST_SCREEN] = ApptOtherInsuranceOptionsListScreen;
  appScreens[Screens.ENTER_PHONE_SCREEN] = EnterPhoneScreen;
  appScreens[Screens.MATCH_MAKER_SCREEN] = MatchMakerScreen;
  appScreens[Screens.ENTER_EMAIL_SCREEN] = EnterEmailScreen;

  appScreens[Screens.REVAMP_PROGRESS_REPORT_SCREEN] = RevampProgressReportScreen;
  appScreens[Screens.SUBSCRIPTION_PACKAGE_SCREEN] = SubscriptionPackageScreen;
  return appScreens;
}

export function getTabScreens() {
  const tabScreens = {};
  tabScreens[Screens.APPOINTMENTS_SCREEN] = AppointmentsScreen;
  tabScreens[Screens.CHAT_CONTACT_LIST] = ChatListScreen;
  tabScreens[Screens.SERVICE_LIST_SCREEN] = SelfScheduleStartScreen;
  tabScreens[Screens.SECTION_LIST_SCREEN] = SectionListScreen;
  tabScreens[Screens.PROGRESS_REPORT_SCREEN] = ProgressReportScreen;
  return tabScreens;
}
