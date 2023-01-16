/*==================Code For Production Specific Credentials====================*/
import Config from 'react-native-config';
import default_group_image from '../assets/images/default-group.png'
import RemoteConfig from './../../configurations.json';
import {extractDynamicConfigurations} from 'ch-mobile-shared';
let applicationConfig = extractDynamicConfigurations(RemoteConfig);
if(!applicationConfig) {
    throw new Error("Unable to find dynamic environment configurations. Please check that the environment specific build scripts you used didn't throw any error. i.e. ./build-latest-dev.sh");
}
console.log('================Current working environment===============');
console.log(Config.REACT_APP_ENVIRONMENT);

export const S3_BUCKET_LINK = applicationConfig['s3.bucket.url'];
export const OPENTOK_APIKEY = applicationConfig['opentok.apiKey'];
export const STRIPE_PUBLISHABLE_KEY = applicationConfig['stripe.publishableKey'];
export const ONESIGNAL_APP_ID = applicationConfig['onesignal.appId'];
export const SENDBIRD_APP_ID = applicationConfig['sendbird.appId'];
export const SEGMENT_WRITE_KEY = applicationConfig['segment.writeKey'];
export const APP_PREFIX = applicationConfig['appPrefix'];
export const PUBLIC_WEBSITE_URL_FOR_BRANCH_CANONICAL_URL = applicationConfig['branch.webUrl'];
export const S3_CLIENT_OPTIONS = {
    region: applicationConfig['s3.client.region'],
    accessKey: applicationConfig['s3.client.accessKey'],
    secretKey: applicationConfig['s3.client.secretKey'],
    successActionStatus: applicationConfig['s3.client.successActionStatus'],
    bucket: applicationConfig['s3.bucket.name'],
};
export const INSTABUG_TOKEN = applicationConfig['instabug.token'];
/*=======================================Code ENDS==========================================*/
export const EMAIL_REGEX = /^[\_a-zA-Z0-9]{1,64}([\.\_a-zA-Z0-9]{0,63})@[a-zA-Z0-9-]{1,64}(\.[a-zA-Z0-9-])*(\.[a-zA-Z]{2,4})?(\.[a-zA-Z]{2,4})$/;

export const PHONE_REGEX = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

export const PASSWORD_REGEX = /^.*(?=.{8})(?=.*\d)(?=.*[a-zA-Z]).*$/;
export const PASSWORD_ERROR =
    'Your alphanumeric password should contain at least 8 characters. If you have any issues, please contact help@confidanthealth.com';

export const NAME_REGEX = /^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/;

export const ZIP_CODE_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;

export const AGE_REGEX = /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/;
// Constants for Patient On Boarding Screen --- START ---
// Local Storage Items
export const APPLIED_FOR_MYSELF = 'myself';
export const APPLIED_FOR_SOMEONEELSE = 'someone-else';
export const GENDER_MALE = 'male';
export const GENDER_FEMALE = 'female';
export const GENDER_OTHER = 'other';
export const USER_TYPE = 'PATIENT';
export const VIDEO_CALL = 'VIDEO_CALL';
export const LOGGED_OUT = 'loggedOut';
export const USER_ID = 'userId';
export const NICK_NAME = 'nickName';
export const FACE_TOGGlE_KEY = 'Face_Toggle_Key';
//export const CAMERA_SUBTITLE = "Confidant Telehealth uses video chat and requires access to your camera, so the other person can see you.";
//export const MICROPHONE_SUBTITLE = "Confidant Telehealth also requires access to your microphone, so the other person can hear you speak.";
export const CONTINUE_SUBTITLE =
    'With Confidant Telehealth you’re able' +
    '\n' +
    'to have HIPAA compliant video chat ' +
    '\n' +
    ' sessions right inside the application.' +
    '\n' +
    ' ' +
    ' The system has been designed to ' +
    '\n' +
    'make this process as easy as possible ' +
    '\n' +
    ' for everyone involved. Now you have ' +
    '\n' +
    'your device properly connected and' +
    '\n' +
    'you’re good to go';
export const PATIENT_ONBOARDING_SCREEN_HEADINGS = {
    appliedFor: 'Who are you using this for?',
    ageMyself: 'How old are you?',
    genderMySelf: 'What gender are you?',
    ageSomeoneElse: 'How old are they?',
    genderSomeoneElse: 'What gender are they?',
};

export const AGE_WHEEL_INIT = '25';
export const CONSENT_OPTIONS = [
    {
        title: 'I consent to share my information \n' + 'with the medical team.'
    },
    {
        title:
        'I authorize the medical team to \n' +
        'communicate with me electronically.',
    }
];
export const CUSTOME_BUBBLES_MESSAGES = {
    CLINICAL_SERVICES: 'Learn more about our clinical services',
    CLINICAL_TEAM: 'Get introduced to our Clinical Team',
    AVAILABLE_COACHES: 'Get introduced to our Clinical Team',
};
export const PROVIDER_FILTERS_LOOKINGFOR_OPTIONS = [
    {title: 'Provider'},
    {
        title:
            'Therapist',
    }, {
        title:
            'Social Worker',
    },
];
export const PROVIDER_FILTERS_SPECIALITY_OPTIONS = [
    {title: 'Substance Use'},
    {
        title:
            'Psychologist',
    }, {
        title:
            'Social Worker',
    },
];

export const FILTER_SERVICE_BY_COST = [
    {title: "$50 and less", value: 50},
    {title: "$75 and less", value: 75},
    {title: "$100 and less", value: 100},
];
export const FILTER_SERVICE_BY_DURATION = [
    {title: "1 Hour and less", value: 60},
    {title: "30 Minutes and less", value: 30},
    {title: "15 Minutes and less", value: 15},
];
export const FILTER_SERVICE_BY_RATING = [
    {title: "5 Star Rating and less", value: 5},
    {title: "4+ Star Rating and less", value: 4},
    {title: "3+ Star Rating and less", value: 3},
];

export const FILTER_TRANSACTIONS = [
    {title: "All transactions", value: ""},
    {title: "Session payments", value: "SESSION_PAYMENT"},
    {title: "Community contributions", value: "COMMUNITY_PAYMENT"},
    {title: "Group contributions", value: "GROUP_PAYMENT"},
    {title: "Prizes", value: "PRIZES"},
    {title: "App subscriptions", value: "APP_SUBSCRIPTION"},
    {title: "Wallet Topups", value: "WALLET_TOP_UP"},
]

export const TRANSACTIONS_TYPE = {
    SESSION_PAYMENT : "SESSION_PAYMENT",
    COMMUNITY_PAYMENT: "COMMUNITY_PAYMENT",
    GROUP_PAYMENT: "GROUP_PAYMENT",
    PRIZES: "PRIZES",
    APP_SUBSCRIPTION: "APP_SUBSCRIPTION",
    WALLET_TOP_UP: "WALLET_TOP_UP"
}

// Age List for Age Wheel
export const AGE_LIST = [
    '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
    '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
    '61', '62', '63', '64', '65', '66', '67', '68', '69', '70',
    '71', '72', '73', '74', '75', '76', '77', '78', '79', '80',
    '81', '82', '83', '84', '85', '86', '87', '88', '89', '90',
    '91', '92', '93', '94', '95', '96', '97', '98', '99', '100',
    '101', '102', '103', '104', '105', '106', '107', '108', '109', '110',
    '111', '112', '113',
];
// Constants for Patient On Boarding Screen --- END ---

export const DEFAULT_IMAGE = 'profileImages/testUser_defaultAvatar.png';
export const DEFAULT_GROUP_IMAGE = 'profileImages/testUser_defaultGroupAvatar.png';
export const CHATBOT_DEFAULT_AVATAR = 'https://i.imgur.com/Tgbdv8K.png';
export const DEFAULT_AVATAR_COLOR = '#505D80';
export const AVATAR_COLOR_ARRAY = [
    '#7a00e7',
    '#f78795',
    '#d97eff',
    '#2bb826',
    '#ff7f05',
];

export const PROGRESSBAR_COLOR_ARRAY = ['#7a00e7', '#f78795', '#d97eff', '#2bb826', '#ff7f05'];

//Constant to deactivate token on Frontend and redirect to login page if set to true

export const EXPIRE_TOKEN = false;

export const HEADER_X = 78;
export const HEADER_NORMAL = 70;
export const MARGIN_X = -42;
export const MARGIN_NORMAL = -18;
export const ERROR_NOT_FOUND = 'NOT_FOUND';

export const STRIPE_ERROR = 'Payment service error, please try later';
export const CONFIDANT_HELP_EMAIL = 'help@confidanthealth.com';
export const CONFIDANT_CALL_NUMBER = '203.747.8696';
export const CONFIDANT_TEXT_NUMBER = '203.747.8696';
export const EMERGENCY_CALL_NUMBER = '911';
export const NATIONAL_SUICIDE_PREVENTION_HELP_LINE = '1.800.273.8255';
export const HERE_YOUR_INFORMATION = "HERE'S YOUR INFORMATION:";
export const YOU_ARE_ON_TAKING_A_GREAT_STEP = 'YOU ARE ON TAKING A GREAT STEP!';
export const GET_CONNECTED_TO = 'GET CONNECTED TO';
export const GROUP_CTA_POPUP_TITLE = 'JOIN THIS GROUP SESSION';
export const BY_DESIGNATION = 'Filter providers by Designation';
export const BY_RATING = 'Filter providers by Rating';
export const BY_COST = 'Filter Services by cost';
export const BY_DURATION = 'Filter services by duration';

export const APPOINTMENT_STATUS = {
    PROPOSED: 'PROPOSED',
    PENDING: 'PENDING',
    BOOKED: 'BOOKED',
    ARRIVED: 'ARRIVED',
    FULFILLED: 'FULFILLED',
    CANCELLED: 'CANCELLED',
    ENTERED_IN_ERROR: 'ENTERED_IN_ERROR',
    CHECKED_IN: 'CHECKED_IN',
    WAITLIST: 'WAITLIST',
    CONFIRMED: 'CONFIRMED'
};


export const SEGMENT_EVENT = {
    APPOINTMENT_REQUESTED: 'Appointment Requested',
    APPOINTMENT_CONFIRMED: 'Appointment Confirmed',
    APPOINTMENT_CANCELLED: 'Appointment Cancelled',
    FUNDS_ADDED_TO_WALLET: 'Funds Added to Wallet',
    TELEHEALTH_SESSION_STARTED: 'Telehealth Session Started',
    TELEHEALTH_SESSION_COMPLETED: 'Telehealth Session Completed',
    TELEHEALTH_SESSION_ENDED: 'Telehealth Session Ended',
    TELEHEALTH_SESSION_FEEDBACK_COMPLETED: 'Telehealth Session Feedback Completed',
    GROUP_JOINED: 'Group Joined',
    GROUP_CHAT_MESSAGE_SENT: 'Group Chat Message Sent',
    GROUP_SESSION_COMPLETED: 'Group Session Completed',
    CONTRIBUTION_SUBSCRIPTION_STARTED: 'Contribution Subscription Started',
    CONTRIBUTION_SUBSCRIPTION_UPDATED: 'Contribution Subscription Updated',
    CONTRIBUTION_MADE: 'Contribution Made',
    SECTION_OPENED: 'Section Opened',
    TOPIC_OPENED: 'Topic Opened',
    EDUCATION_OPENED: 'Education Opened',
    EDUCATION_BOOKMARKED: 'Education Bookmarked',
    EDUCATION_MARKED_AS_READ: 'Education Marked As Read',
    APP_SHARED: 'App Shared',
    CHATBOT_ASSIGNED: 'Chatbot Assigned',
    CHATBOT_OPENED: 'Chatbot Opened',
    CHATBOT_CLOSED: 'Chatbot Closed',
    NEW_PROVIDER_CONNECTION: 'Connection Added',
    ACTION_CLICKED: 'Action Clicked',
    BUTTON_CLICKED: 'Button Clicked',
    SETTING_OPENED: 'Setting Opened',
    PROFILE_UPDATED: 'Profile Updated',
    MEMBER_ONBOARDED: 'Member Onboarded',
    MEMBER_REQUESTED_MAGIC_LINK: 'Member Requested Magic Link',
    SUPPORT_REQUESTED: 'Support Requested',
    SIGNED_UP_FOR_NEWS_AND_UPDATES: 'Signed up for news and updates',
    GROUP_SESSION_JOINED: 'Group session joined',
    APPOINTMENT_CHANGE_REQUESTED: 'Appointment Change Requested',
    NEW_LOGIN: 'New user login',
    ON_BOARDING_STARTED: 'Onboarding started',
    NEW_MEMBER_ONBOARDING_SUCCESSFULLY: 'New member onBoarding successfully',
    APPLICATION_OPENED: 'Application Opened',
    UPDATE_APP_VERSION: 'Update App Version',
    APPLICATION_UPDATED: 'Application Updated'


};

export const START_CHATBOT = "start chatbot";
export const START_NEW_CHATBOT = "Start a New Chatbot";


export const TIME_PICKER = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
    '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'
];

export const TIME_KEY_VALUE = [
    {key: '00', value: 0}, {key: '01', value: 1}, {key: '02', value: 2}, {key: '03', value: 3}, {key: '04', value: 4},
    {key: '05', value: 5}, {key: '06', value: 6}, {key: '07', value: 7}, {key: '08', value: 8}, {key: '09', value: 9},
    {key: '10', value: 10}, {key: '11', value: 11}, {key: '12', value: 12}, {key: '13', value: 13}, {
        key: '14',
        value: 14
    },
    {key: '15', value: 15}, {key: '16', value: 16}, {key: '17', value: 17}, {key: '18', value: 18}, {
        key: '19',
        value: 19
    },
    {key: '20', value: 20}, {key: '21', value: 21}, {key: '22', value: 22}, {key: '23', value: 23}, {
        key: '24',
        value: 24
    }
];

export const CONNECTIONS_SEGMENTS_OPTIONS = {
    ACTIVE: 'active',
    PAST: 'past',
    FULL_PLAN : 'fullPlan',
    PRIORITY : 'priority'
}

export const PROVIDER_DESIGNATIONS = {
    PRESCRIBER : 'Prescriber',
    NURSE_PRACTITIONER : 'Nurse Practitioner',
    PSYCHIATRIC_NURSE_PRACTITIONER : 'Psychiatric Nurse Practitioner'
}

export const MAX_DESCRIPTION_LENGTH = 75;


export const REVAMP_VALUES_DISPLAY_TYPE = {
    CHECK_LIST: "List",
    BUTTON_LIST: "Button List",
    TILED_BUTTON_LIST: "Tiled Button List",
    TILED_LIST: "Tiled",
    TILED_IMAGE_BUTTON_LIST: "Tiled image button list",
    GROUPED_LIST: "Grouped list",
    GROUPED_CHIPS: "Grouped chips",
    SWITCH: "Switch button",
    INPUT_FIELD: "Input Field",
    DATE_TIME_PICKER: "Date time picker",
    DAY_TIME_PICKER: "Week time picker",
    TABS: "Tabs",
    RATING_SCALE: "Rating scale",
};

export const REVAMP_QUESTION_RENDER_TYPE = {
    DIALOG: "Display in popup",
    SCREEN: "Display on next screen",
    INLINE: "Display on current screen",
    TAB: "Display in Tab screen"
};

export const REVAMP_VALUE_INPUT_TYPE = {
    SINGLE_SELECT: "Single Select",
    MULTI_SELECT: "Multi Select",
    BOOLEAN: "boolean",
    DATE: "Date",
    DATE_TIME: "Date time",
    DAY_TIME: "Week time",
    TEXT_INPUT: "Text",
    NO_INPUT: "No Input",
    RATING_SCALE: "Rating scale",
};

export const REVAMP_ACTION_BUTTON_POSITIONS = {
    DISABLED_END: "Disabled end",
    DISABLED_BELOW: "Disabled below",
    ENABLED_BELOW: "Disabled enabled",
    ENABLED_END: "Enabled end",
    DISABLED_FLOATING: "Disabled floating",
    ENABLED_FLOATING: "Enabled floating",
    HIDDEN_FLOATING: "Hidden floating",
};

export const REVAMP_ACTION_BUTTON_ACTIONS = {
    NEXT: "Next",
    SKIP: "Skip",
    SHARE: "Share",
    FOCUS_VALUE: "Focus value",
    CLOSE: "Close popup",
    SCHEDULE_ACTIVITY: "Schedule activity",
    CHECK_IN_ACTIVITY: "Check in activity"
};

export const REVAMP_POPUP_BEHAVIOR = {
    SHOW_SELECTION: "show selection",
    PROMPT: "Prompt",
    RESPONSE_BASED_PROMPT: "Response based prompt",
};

export const REVAMP_DESCRIPTION_TYPE = {
    ONE_LINER: "One liner",
    NUMERIC_LIST: "Numeric list",
    RESPONSE_BASED: "Response based"
};

export const MINUTE_PICKER = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21',
    '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32',
    '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43',
    '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54',
    '55', '56', '57', '58', '59',
];

export const TIME_PICKER_12_HOURS = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12'
];

export const REVAMP_ON_BOARDING_CONTEXT_STATUS = {
    IN_PROGRESS: {key: 'IN_PROGRESS', value: 'IN_PROGRESS'},
    COMPLETED: {key: 'COMPLETED', value: 'COMPLETED'},
};

export const REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS = {
    IN_PROGRESS: {key: 'IN_PROGRESS', value: 'IN_PROGRESS'},
    COMPLETED: {key: 'COMPLETED', value: 'COMPLETED'},
};

export const REVAMP_ON_BOARDING_TYPES = {
    REWARD: {key: 'Reward', value: 'Reward'},
    VALUES: {key: 'Values', value: 'Values'},
    ACTIVITIES: {key: 'Activities', value: 'Activities'},
    MIND_AND_BODY: {key: 'Mind & Body', value: 'Mind & Body'},
    PLAN: {key: 'Plan', value: 'Plan'},
};
export const REVAMP_TYPES = {
    Reward: 'Reward',
    Values: 'Values',
    Activities: 'Activities',
    Mind_And_Body: 'Mind & Body',
    Plan: 'Plan'
}

export const PLAN_STATUS = {
    IN_PROGRESS : {key :'IN_PROGRESS',value:'In Progress'},
    SCHEDULED : {key :'SCHEDULED',value:'Scheduled'},
    NOT_STARTED : {key :'NOT_STARTED',value:'Not Started'},
    COMPLETED : {key :'COMPLETED',value:'Completed'}
}

export const CONTENT_TYPE = {
    RECOMMEND_PROVIDER_PROFILE : "recommend-provider-profile",
    GROUP_RECOMMENDATION : "group-recommendation",
    PROFILE_ELEMENT : "profile-element",
    EDUCATION_CONTENT : "education-content",
    SHARE_CHATBOT : "share-chatbot",
    APPOINTMENT_LINK : "appointment-link",
    LEARNING_LIBRARY : "learning-library",
    SERVICE_REQUEST : "service-request",
    SHARE_PROVIDER_PROFILE : "share-provider-profile",
    REVAMP__HOME : "revamp-home",
    TELEHEALTH_SCREEN : "telehealth-screen",
    MAIN_APP_SCREEN : "main-app-screen",

}

export const PAYMENT_OPTIONS = {
    PAY_CASH : "PAY_CASH",
    USE_INSURANCE : "USE_INSURANCE",
    USE_SUBSCRIPTION : "USE_SUBSCRIPTION",
}
export const PAYMENT_METHOD = {
    OTHER : "OTHER",
    INSURANCE : "INSURANCE",
    SUBSCRIPTION : "SUBSCRIPTION",
}

export const SCHEDULE_ACTIVITY_QUESTIONS = {
    PLEASURE_FROM_THIS_ACTIVITY: {
        key: 'How much pleasure do you think this activity will bring to you?',
        value: 'Pleasure from this activity'
    },
    ALIGNED_WITH_VALUES: {
        key: 'Do you think this activity aligns with your values?',
        value: 'Aligned with values'
    },
    GETTING_CLOSER_TO_REWARD: {
        key: 'Do you think doing this activity will bring you closer to your reward?',
        value: 'Getting closer to reward'
    },
    BLOCKERS: {
        key: 'Is there anything that could prevent you from doing this activity?',
        value: 'Blockers'
    },
    /*Handling: {
    key :'How can you handle these obstacles?',
    value:'Handling'
    }*/
}
export const PAYEE= {
    TRANSACTIONAL:'TRANSACTIONAL',
    INSURANCE:'INSURANCE',
    RECURRING_SUBSCRIPTION:'RECURRING_SUBSCRIPTION'
}

export const PLAN_ITEMS_TYPES ={
    EDUCATION: 'EDUCATION',
    TOPIC: 'TOPIC',
    ACTIVITY: 'ACTIVITY',
    GROUP: 'GROUP',
    CONVERSATION: 'CONVERSATION',
    PROVIDER: 'PROVIDER',
    PROVIDER_TYPE: 'PROVIDER_TYPE',
    SERVICE: 'SERVICE'
}
export const PrimaryMotivation ={
    WANT_TO_BOOK_AN_APPOINTMENT: 'Wants to book an appointment',
    WANT_TO_TALK_TO_SOMEONE: 'Wants to talk with someone',
    WANT_TO_EXPLORE_APP_OWN: 'Wants to explore on their own',
    SKIP_SHORT_ON_BOARDING: 'Click on Skip at time of short onboarding',
}
