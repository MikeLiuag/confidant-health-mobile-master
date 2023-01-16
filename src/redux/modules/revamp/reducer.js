import {
    REVAMP_CONTEXT_FETCH,
    REVAMP_CONTEXT_FETCHED,
    REVAMP_CONTEXT_FETCHED_FAILED,
    REVAMP_CONTEXT_UPDATE,
    REVAMP_CONTEXT_UPDATE_FAILED,
    REVAMP_CONTEXT_UPDATE_SUCCESS,
    REVAMP_ON_BOARDING_CONTEXT_FETCH,
    REVAMP_ON_BOARDING_CONTEXT_FETCHED,
    REVAMP_ON_BOARDING_CONTEXT_FETCHED_FAILED,
    REVAMP_ON_BOARDING_CONTEXT_UPDATE,
    REVAMP_ON_BOARDING_CONTEXT_UPDATE_FAILED,
    REVAMP_ON_BOARDING_CONTEXT_UPDATE_SUCCESS,
    REVAMP_SUNDAY_CHECKIN_FETCH,
    REVAMP_SUNDAY_CHECKIN_FETCHED,
    REVAMP_SUNDAY_CHECKIN_FETCHED_FAILED,
    REVAMP_SUNDAY_CHECKIN_UPDATE,
    REVAMP_SUNDAY_CHECKIN_UPDATE_FAILED,
    REVAMP_SUNDAY_CHECKIN_UPDATE_SUCCESS,
    REVAMP_SUNDAY_CHECKINS_LIST_FETCH,
    REVAMP_SUNDAY_CHECKINS_LIST_FETCHED,
    REVAMP_SUNDAY_CHECKINS_LIST_FETCHED_FAILED
} from './actions';


export const DEFAULT = {
    isLoading: false,
    error: false,
    errorMsg: null,
    revampContext: null,
    revampContextUpdated: false,
    revampOnBoardingContext: null,
    revampOnBoardingContextUpdated: false,
    revampSundayCheckIn: null,
    revampSundayCheckInUpdated: false,
    revampSundayCheckInsList: []
};

export default function revampReducer(state = DEFAULT, action = {}) {
    const {type, payload, revampContext, revampOnBoardingContext, revampSundayCheckIn, revampSundayCheckInsList} = action;
    switch (type) {
        case REVAMP_CONTEXT_FETCH: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_CONTEXT_FETCHED: {
            return {
                ...state,
                revampContext,
                isLoading: false
            }
        }
        case REVAMP_CONTEXT_FETCHED_FAILED: {
            return {
                ...state,
                isLoading: false,
                revampContext: null
            }
        }
        case REVAMP_CONTEXT_UPDATE: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_CONTEXT_UPDATE_FAILED: {
            return {
                ...state,
                isLoading: false
            }
        }
        case REVAMP_CONTEXT_UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                revampContextUpdated: true
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_FETCH: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_FETCHED: {
            return {
                ...state,
                revampOnBoardingContext,
                isLoading: false
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_FETCHED_FAILED: {
            return {
                ...state,
                revampOnBoardingContext: null,
                isLoading: false,
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_UPDATE: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_UPDATE_FAILED: {
            return {
                ...state,
                isLoading: false
            }
        }
        case REVAMP_ON_BOARDING_CONTEXT_UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                revampContextUpdated: false
            }
        }
        case REVAMP_SUNDAY_CHECKIN_FETCH: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_SUNDAY_CHECKIN_FETCHED: {
            return {
                ...state,
                revampSundayCheckIn,
                isLoading: false
            }
        }
        case REVAMP_SUNDAY_CHECKIN_FETCHED_FAILED: {
            return {
                ...state,
                revampSundayCheckIn: null,
                isLoading: false,
            }
        }
        case REVAMP_SUNDAY_CHECKIN_UPDATE: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_SUNDAY_CHECKIN_UPDATE_FAILED: {
            return {
                ...state,
                isLoading: false
            }
        }
        case REVAMP_SUNDAY_CHECKIN_UPDATE_SUCCESS: {
            return {
                ...state,
                isLoading: false,
                revampSundayCheckInUpdated: false
            }
        }
        case REVAMP_SUNDAY_CHECKINS_LIST_FETCH: {
            return {
                ...state,
                isLoading: true
            }
        }
        case REVAMP_SUNDAY_CHECKINS_LIST_FETCHED: {
            return {
                ...state,
                revampSundayCheckInsList,
                isLoading: false
            }
        }
        case REVAMP_SUNDAY_CHECKINS_LIST_FETCHED_FAILED: {
            return {
                ...state,
                revampSundayCheckInsList: [],
                isLoading: false,
            }
        }
        default: {
            return state;
        }
    }
}
