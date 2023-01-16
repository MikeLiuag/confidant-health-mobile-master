export const ApiEndpoints = {
    GET_PROFILE: {
        path: '/profile/profile',
        method: 'GET',
    },
    CHECK_PATIENT_ONBOARDING_STATUS: {
        path: '/profile/onboard/patient/status',
        method: 'GET',
    },
    MAGIC_LOGIN: {
        path: '/auth/login/magicLink',
        method: 'POST',
    },
    PATIENT_ON_BOARDING: {
        path: '/profile/onboard/patient',
        method: 'POST',
    },
    DIRECT_LINE: {
        method: 'post',
        path: 'tokens/generate',
    },
    GET_CONVERSATION_ID: {
        path: '/conversation/validateSource',
        method: 'GET',
    },
    GET_CHAT_TOKEN: {
        path: '/conversation/token/generate',
        method: 'POST',
    },
    GET_CHAT_BOT_HISTORY: {
        path: '/conversation/chat/history',
        method: 'GET',
    },
    UPDATE_PROFILE: {
        path: '/profile/profile/update',
        method: 'POST',
    },
    REFRESH_AUTH_TOKEN: {
        path: '/auth/token/refresh',
        method: 'GET',
    },
    SUICIDAL_CRITERIA: {
        path: "/auth/token/suicidal",
        method: "PUT"
    },
    PATIENT_DCT: {
        path: '/profile/profile/dct',
        method: 'GET',
    },
    PATIENT_AVATARS: {
        path: '/profile/profile/avatar',
        method: 'GET',
    },
    REGISTER_PLAYERID: {
        path: '/auth/player/{playerId}',
        method: 'POST',
    },
    REMOVE_PLAYERID: {
        path: '/auth/removePlayer/{playerId}',
        method: 'DELETE',
    },
    INITIATE_VIDEO_CHAT: {
        path: '/conversation/telehealth/startSession/{userID}',
        method: 'POST',
    },
    ALLOW_PROVIDER_ACCESS: {
        path: '/profile/profile/allowProviderAccess/{providerId}',
        method: 'POST',
    },
    DISCONNECT_PROVIDER: {
        path: '/profile/connections/{providerId}/disconnect',
        method: 'POST',
    },
    GET_ALLOWED_PROVIDERS: {
        path: '/profile/profile/providerAccess',
        method: 'GET',
    },
    SEARCH_PROVIDER_BY_CODE: {
        path: '/profile/provider/searchByCode',
        method: 'GET',
    },
    REFRESH_DIRECTLINE_TOKEN: {
        path: '/profile/roaster/token/refresh',
        method: 'POST',
    },
    GET_PROVIDER_PROFILE: {
        path: '/profile/provider/{providerId}',
        method: 'GET',
    },

    SAVE_REWARDS_PROFILE: {
        path: '/profile/profile/rewards',
        method: 'POST',
    },

    GET_FEEDBACK_SUMMARY: {
        path: '/scheduling/telehealth/feedback/summary/{providerId}',
        method: 'GET',
    },
    SHARE_FEEDBACK: {
        path: '/scheduling/telehealth/feedback',
        method: 'PUT',
    },
    GET_FEEDBACK: {
        path: '/scheduling/telehealth/feedback',
        method: 'GET',
    },
    INVITE_MEMBER: {
        path: '/profile/invite/member',
        method: 'POST',
    },
    INVITE_PROVIDER: {
        path: '/profile/invite/provider',
        method: 'POST',
    },
    GET_CONNECTIONS: {
        path: '/profile/connections',
        method: 'GET',
    },
    MARK_AS_COMPLETE_EDUCATIONAL_CONTENT: {
        path: '/profile/education/{slug}/markAsComplete',
        method: 'POST',
    },
    TOPIC_COMPLETED: {
        path: '/profile/education/topic/{entryId}/completed',
        method: 'POST',
    },
    EDUCATION_VIEWED: {
        path: '/profile/education/{entryId}/viewed',
        method: 'POST',
    },
    BOOKMARK_EDUCATIONAL_CONTENT: {
        path: '/profile/education/{slug}/bookmark',
        method: 'POST',
    },
    GET_MARKED_EDUCATIONAL_CONTENT: {
        path: '/profile/education/markedSlugs',
        method: 'GET',
    },
    CONNECT: {
        path: '/profile/connections/{userId}/connect',
        method: 'POST',
    },
    PENDING_CONNECTIONS: {
        path: '/profile/connections/pending',
        method: 'GET',
    },
    PROCESS_PENDING_CONNECTIONS: {
        path: '/profile/connections/pending/process',
        method: 'POST',
    },
    GET_SPECIFIC_CONNECTION: {
        path: '/profile/connections/{userId}',
        method: 'GET',
    },
    USER_ACTIVITY: {
        path: '/audit/getUserActivity/{userId}',
        method: 'GET',
    },
    GET_CONTENT_ASSIGNED_TO_ME: {
        path: '/profile/education/assignedToMe',
        method: 'GET',
    },
    ALL_MATCH_MAKERS: {
        path: '/profile/matchmakers',
        method: 'GET',
    },
    GET_CHANNEL_URL: {
        path: '/conversation/liveChat/{connectionId}/channelUrl',
        method: 'GET',
    },
    GET_DCT_REPORT_VIEW: {
        path: '/profile/profile/dctDetails/{userId}',
        method: 'GET',
    },
    OUTCOME_DETAIL: {
        path: '/profile/profile/outcomeDetails/{contextId}/{dctId}',
        method: 'GET',
    },
    GET_ASSIGNED_SLUGS: {
        path: '/profile/education/{connectionId}/assignedSlugs',
        method: 'GET',
    },
    SHARE_CONTENT: {
        path: '/profile/education/assign',
        method: 'POST',
    },
    CONVERSATION_LIST: {
        path: '/conversation/conversation/list',
        method: 'GET',
    },
    SELF_ASSIGN_CONVERSATION: {
        path: '/conversation/conversation/assign',
        method: 'POST',
    },
    CAPTURE_EDUCATION_FEEDBACK: {
        path: '/profile/education/{entryId}/feedback',
        method: 'PUT',
    },
    LIST_APPOINTMENT_ELIGIBLE_PROVIDERS: {
        path: '/scheduling/appointment/listProviders',
        method: 'GET',
    },
    GET_PROVIDER_SERVICES: {
        path: '/scheduling/appointment/services/{providerId}',
        method: 'GET',
    },
    GET_AVAILABLE_SLOTS: {
        path: '/scheduling/appointment/getAvailableSlots',
        method: 'POST'
    },
    CHANGE_PASSWORD: {
        path: '/auth/changePassword',
        method: 'POST'
    },
    REQUEST_APPOINTMENT: {
        path: '/scheduling/appointment/request',
        method: 'POST'
    },
    GET_ALL_APPOINTMENTS: {
        path: '/scheduling/appointment/list',
        method: 'GET'
    },
    GET_ALL_APPOINTMENTS_V2: {
        path: '/scheduling/appointment/list/v2',
        method: 'POST'
    },
    REQUEST_APPOINTMENT_CHANGES: {
        path: '/scheduling/appointment/{appointmentId}/requestChanges',
        method: 'POST'
    },
    CONFIRM_APPOINTMENT: {
        path: '/scheduling/appointment/confirmByMember',
        method: 'PUT'
    },
    CANCEL_APPOINTMENT: {
        path: '/scheduling/appointment/{appointmentId}/cancel',
        method: 'PUT'
    },
    GET_NOTIFICATION_SETTINGS: {
        path: "/profile/settings/notifications",
        method: "GET"
    },
    UPDATE_NOTIFICATION_SETTINGS: {
        path: "/profile/settings/notifications",
        method: "POST"
    },
    ARRIVE_FOR_APPOINTMENT: {
        path: "/scheduling/appointment/{appointmentId}/join",
        method: "POST"
    },
    COMPLETE_APPOINTMENT: {
        path: "/scheduling/appointment/complete/{appointmentId}",
        method: "POST"
    },
    CHARGE_FOR_APPOINTMENT: {
        path: "/billing/payments/appointmentCharges",
        method: "POST"
    },
    GET_CARDS_LIST: {
        path: "/billing/payments/cards/list",
        method: "GET"
    },
    ADD_CARD: {
        path: "/billing/payments/cards/add",
        method: "POST"
    },
    DELETE_CARD: {
        path: "/billing/payments/cards/{cardIdToDelete}",
        method: "DELETE"
    },
    APPOINTMENT_CHARGES: {
        path: "/billing/payments/appointmentCharges",
        method: "POST"
    },
    CREATE_GROUP: {
        path: "/profile/group",
        method: "POST"
    },
    ADD_PROFILE_ELEMENT: {
        path: "/conversation/profile/profileAttributes",
        method: "POST"
    },
    GET_GROUP_DETAILS: {
        path: "/profile/group/{channelUrl}",
        method: "GET"
    },
    GET_ALL_GROUP_DETAILS: {
        path: "/profile/groups/all/{userId}",
        method: "GET"
    },

    ADD_GROUP_MEMBERS: {
        path: "/profile/group/members",
        method: "PUT"
    },
    UPDATE_GROUP: {
        path: "/profile/group",
        method: "PUT"
    },
    REMOVE_GROUP_MEMBER: {
        path: "/profile/group/{channelUrl}/{userId}/leave",
        method: "POST"
    },
    DELETE_GROUP: {
        path: "/profile/group/{channelUrl}/delete",
        method: "DELETE"
    },
    GET_WALLET: {
        path: "/billing/wallet",
        method: "GET"
    },
    GET_PAYMENT_HISTORY: {
        path: "/billing/payments/history",
        method: "GET"
    },
    TOPUP_WALLET: {
        path: "/billing/wallet/topup",
        method: "POST"
    },
    PAY_FROM_WALLET: {
        path: "/billing/wallet/pay",
        method: "POST"

    },
    PAY_GENERIC_FROM_WALLET: {
        path: "/billing/wallet/generic/pay",
        method: "POST"

    },
    PAY_GENERIC_VIA_CARD: {
        path: "/billing/payments/capture/generic",
        method: "POST"

    },
    START_OR_JOIN_GROUP_CALL: {
        path: "/profile/group/{channelUrl}/startOrJoinCall",
        method: "POST"
    },
    SEND_ATTACHMENT: {
        path: "/profile/media/chat/sendAttachment",
        method: "POST"
    },
    JOIN_PUBLIC_GROUP: {
        path: "/profile/group/{channelUrl}/join",
        method: "POST"
    },
    APP_SUBSCRIPTION_PAYMENT: {
        path: "/billing/payments/subscribe",
        method: "POST"
    },
    APP_SUBSCRIPTION_STATUS: {
        path: "/billing/payments/subscription/check",
        method: "GET"
    },
    UPLOAD_IMAGE: {
        path: '/profile/provider/uploadImage',
        method: 'POST'
    },

    GET_PATIENT_ON_BOARDING_GOALS: {
        path: '/auth/onboard/patient/goals',
        method: 'GET'
    },
    GET_ALL_SERVICE_TYPES: {
        path: '/scheduling/schedule/providerServiceTypes',
        method: 'GET'
    },
    GET_SERVICES_BY_TYPE: {
        path: '/scheduling/appointment/servicesByType',
        method: 'GET'
    },
    ASSOCIATE_POST_PAYMENT: {
        path: '/scheduling/appointment/{appointmentId}/postpay',
        method: 'PUT'
    },
    GET_SUBSCRIPTION: {
        path: '/billing/payments/subscription',
        method: 'GET'
    },
    CANCEL_SUBSCRIPTION: {
        path: '/billing/payments/subscription/cancel',
        method: 'POST'
    },
    GET_CONVERSATION_PROGRESS: {
        path: '/conversation/conversation/{connectionId}/progress',
        method: 'GET'
    },
    ARCHIVE_CONNECTION: {
        path: '/profile/connections/archive/{connectionId}',
        method: 'POST'
    },
    RESTART_CHATBOT: {
        path: '/conversation/conversation/{connectionId}/restart',
        method: 'POST'
    },
    GET_MASTER_SCHEDULE: {
        path: '/scheduling/appointment/masterSchedule',
        method: 'POST'
    },
    PAY_FOR_APPOINTMENT_BY_CARD: {
        path: "/billing/payments/capture/appointment/{appointmentId}",
        method: 'POST'
    },
    GET_REVAMP_TYPE: {
        path: "/conversation/revamp/revampType",
        method: 'GET'
    },
    GET_REVAMP_TYPES_LIST: {
        path: "/conversation/revamp/revampTypes",
        method: 'GET'
    },
    UPDATE_SUBSCRIPTION_STATUS: {
        path: '/billing/payments/subscription/update',
        method: 'POST'
    },
    GET_ALL_SERVICES: {
        path: '/scheduling/schedule/getAllSystemServices',
        method: 'GET'
    },
    CREATE_REVAMP_ON_BOARDING_CONTEXT: {
        path: "/conversation/revamp/revampOnBoardingContext",
        method: 'POST'
    },
    UPDATE_REVAMP_ON_BOARDING_CONTEXT: {
        path: "/conversation/revamp/revampOnBoardingContext",
        method: 'PUT'
    },
    GET_REVAMP_ON_BOARDING_CONTEXT: {
        path: "/conversation/revamp/revampOnBoardingContext",
        method: 'GET'
    },
    UPDATE_REVAMP_CONTEXT: {
        path: "/conversation/revamp/revampContext",
        method: 'PUT'
    },
    GET_REVAMP_CONTEXT: {
        path: "/conversation/revamp/revampContext",
        method: 'GET'
    },
    CHECK_IN_ACTIVITY: {
        path: "/conversation/revamp/addCheckIn",
        method: 'POST'
    },
    ADD_MULTIPLE_PROFILE_ELEMENT: {
        path: "/conversation/profile/addMultipleprofileAttributes",
        method: "POST"
    },
    GET_DATA_ELEMENTS: {
        path: "/profile/profile/profileElements",
        method: "POST"
    },
    CREATE_SUNDAY_CHECKIN: {
        path: "/conversation/revamp/sundayCheckIn",
        method: "POST"
    },
    UPDATE_SUNDAY_CHECKIN: {
        path: "/conversation/revamp/sundayCheckIn",
        method: "PUT"
    },
    GET_SUNDAY_CHECKIN: {
        path: "/conversation/revamp/sundayCheckIn",
        method: "GET"
    },
    SCHEDULE_ACTIVITY: {
        path: "/conversation/revamp/addActivitySchedule",
        method: "POST"
    },

    GET_SUNDAY_CHECKINS: {
        path: "/conversation/revamp/sundayCheckIns",
        method: "GET"
    },

    GET_PROGRESS_REPORT_APPOINTMENTS: {
        path: "/scheduling/appointment/list/revamp",
        method: "GET"
    },
    SAVE_MEMBER_TIMEZONE: {
        path: "/profile/profile/saveTimezone",
        method: "PUT"
    },
    UPDATE_POST_ON_BOARDING_ATTEMPT: {
        path: "/profile/profile/updatePostOnboardingAttempt",
        method: "POST"
    },
    GET_INSURANCE_LIST: {
        path: '/billing/insurances',
        method: 'GET'
    },
    CREATE_PATIENT_INSURANCE_PROFILE: {
        path: '/billing/insurances/patientProfile/{insuranceId}',
        method: 'POST'
    },
    GET_PATIENT_INSURANCE_PROFILE: {
        path: '/billing/billingProfile',
        method: 'GET'
    },
    GET_SUBSCRIPTION_PACKAGE: {
        path: '/billing/payments/recurringSubscription/packages',
        method: 'GET'
    },
    GET_PATIENT_SUBSCRIPTION_PACKAGES: {
        path: '/billing/payments/user/recurringSubscription',
        method: 'GET'
    },
    SUBSCRIBE_PACKAGE: {
        path: '/billing/payments/user/recurringSubscription',
        method: 'POST'
    },
    UPDATE_PATIENT_SUBSCRIPTION_PACKAGE: {
        path: '/billing/payments/user/recurringSubscription/{status}',
        method: 'PUT'
    },
    GET_PATIENT_SUBSCRIPTIONS_PACKAGE_HISTORY: {
        path: '/billing/payments/user/recurringSubscriptions/history',
        method: 'PUT'
    }
};
