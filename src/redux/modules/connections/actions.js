import {createAction} from 'redux-actions';
import {PROFILE_FETCH, PROFILE_GET_MARKED_EDUCATION_CONTENT, PROFILE_UPDATE_PROVIDER_ACCESS} from '../profile/actions';
import {REGISTER_TOKEN_REFRESH_TASK} from '../auth/actions';
import {APPOINTMENTS_FETCH} from '../appointments/actions';
import {FETCH_ASSIGNED_CONTENT} from '../educational-content/actions';
import {FETCH_WALLET} from '../payment/actions';
import {
    REVAMP_CONTEXT_FETCH,
    REVAMP_CONTEXT_UPDATE,
    REVAMP_ON_BOARDING_CONTEXT_FETCH,
    REVAMP_ON_BOARDING_CONTEXT_UPDATE,
    REVAMP_SUNDAY_CHECKIN_FETCH,
    REVAMP_SUNDAY_CHECKIN_UPDATE, REVAMP_SUNDAY_CHECKINS_LIST_FETCH
} from "../revamp/actions";

export const GET_CONNECTIONS = 'connections/GET';
export const GET_CONNECTIONS_SILENT = 'connections/GET_SILENT';
export const GET_SPECIFIC_CONNECTION = 'connections/GET_SPECIFIC';
export const SPECIFIC_CONNECTION_FETCHED = 'connections/SPECIFIC_CONNECTION_FETCHED';
export const CONNECTIONS_FETCHED = 'connections/FETCHED';
export const GET_CONNECTIONS_FAILED = 'connections/GET_FAILED';
export const CONNECT = 'connections/CONNECT';
export const CONNECTION_FAILED = 'connections/CONNECTION_FAILED';
export const DISCONNECT = 'connections/DISCONNECT';
export const DISCONNECTING = 'connections/DISCONNECTING';
export const DISCONNECTED = 'connections/DISCONNECTED';
export const REFRESH_CHAT_TIMESTAMPS = 'connections/REFRESH_CHAT_TIMESTAMPS';
export const UPDATED_CHANNEL_URL = 'connections/UPDATED_CHANNEL_URL';
export const NEW_CHAT_GROUP_CREATED = 'connections/NEW_CHAT_GROUP_CREATED';
export const GROUP_CALL_ACTIVE = 'connections/GROUP_CALL_ACTIVE';
export const ARCHIVE_CONNECTION = 'connections/ARCHIVE';
export const RESTART_CHATBOT = 'connections/RESTART_CHATBOT';
export const RESTART_CHATBOT_SUCCESS = 'connections/RESTART_CHATBOT_SUCCESS';
export const RESTART_CHATBOT_FAILED = 'connections/RESTART_CHATBOT_FAILED';
export const ARCHIVE_CONNECTION_FAILED = 'connections/ARCHIVE_FAILED';
export const FETCH_CHATBOTS = 'connections/FETCH_CHATBOTS';
export const FETCH_CHATBOTS_SUCCESS = 'connections/FETCH_CHATBOTS_SUCCESS';
export const FETCH_CHATBOTS_FAILURE = 'connections/FETCH_CHATBOTS_FAILURE';

export const FETCH_ALL_BOTS_PROGRESS = 'connections/FETCH_ALL_BOTS_PROGRESS';
export const FETCH_BOT_PROGRESS = 'connections/FETCH_BOT_PROGRESS';
export const BOT_PROGRESS_UPDATED = 'connections/BOT_PROGRESS_UPDATED';

export const FETCH_PENDING_CONNECTIONS = 'connections/FETCH_PENDING_CONNECTIONS';
export const PENDING_CONNECTIONS_FETCHED = 'connections/PENDING_CONNECTIONS_FETCHED';
export const PENDING_CONNECTIONS_FAILED = 'connections/PENDING_CONNECTIONS_FAILED';

export const FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS = 'connections/FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS';
export const LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED = 'connections/LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED';
export const LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED = 'connections/LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED';

export const FETCH_ALL_GROUPS = 'connections/FETCH_ALL_GROUPS';
export const ALL_GROUPS_FAILED = 'connections/ALL_GROUPS_FAILED';
export const ALL_GROUPS_FETCHED = 'connections/ALL_GROUPS_FETCHED';

export const connectActionCreators = {
    fetchConnections: createAction(GET_CONNECTIONS),
    connect: createAction(CONNECT),
    disconnect: createAction(DISCONNECT),
    fetchProfile: createAction(PROFILE_FETCH),
    fetchWallet: createAction(FETCH_WALLET),
    fetchAppointments: createAction(APPOINTMENTS_FETCH),
    fetchContentAssignedToMe: createAction(FETCH_ASSIGNED_CONTENT),
    registerTokenRefreshTask: createAction(REGISTER_TOKEN_REFRESH_TASK),
    fetchEducationMarkers: createAction(PROFILE_GET_MARKED_EDUCATION_CONTENT),
    updateProviderAccess: createAction(PROFILE_UPDATE_PROVIDER_ACCESS),
    newChatGroupCreated: createAction(NEW_CHAT_GROUP_CREATED),
    refreshConnections: createAction(GET_CONNECTIONS_SILENT),
    archiveConnection: createAction(ARCHIVE_CONNECTION),
    restartChatbot: createAction(RESTART_CHATBOT),
    fetchChatbots: createAction(FETCH_CHATBOTS),
    fetchRevampContext: createAction(REVAMP_CONTEXT_FETCH),
    updateRevampContext: createAction(REVAMP_CONTEXT_UPDATE),
    fetchRevampOnBoardingContext: createAction(REVAMP_ON_BOARDING_CONTEXT_FETCH),
    updateRevampOnBoardingContext: createAction(REVAMP_ON_BOARDING_CONTEXT_UPDATE),
    fetchEligibleProviders: createAction(FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS),
    fetchAllGroups: createAction(FETCH_ALL_GROUPS),
    fetchRevampSundayCheckin: createAction(REVAMP_SUNDAY_CHECKIN_FETCH),
    updateRevampSundayCheckin: createAction(REVAMP_SUNDAY_CHECKIN_UPDATE),
    fetchRevampSundayCheckinsList: createAction(REVAMP_SUNDAY_CHECKINS_LIST_FETCH)

};
