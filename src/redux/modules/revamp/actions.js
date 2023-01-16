import {createAction} from "redux-actions";

export const REVAMP_CONTEXT_FETCH = 'revampContext/FETCH';
export const REVAMP_CONTEXT_FETCHED = 'revampContext/FETCHED';
export const REVAMP_CONTEXT_FETCHED_FAILED = 'revampContext/FETCHED_FAILED';
export const REVAMP_CONTEXT_UPDATE = 'revampContext/UPDATE';
export const REVAMP_CONTEXT_UPDATE_FAILED = 'revampContext/UPDATE_FAILED';
export const REVAMP_CONTEXT_UPDATE_SUCCESS = 'revampContext/UPDATE_SUCCESS';
export const REVAMP_ON_BOARDING_CONTEXT_FETCH = 'revampOnBoardingContext/FETCH';
export const REVAMP_ON_BOARDING_CONTEXT_FETCHED = 'revampOnBoardingContext/FETCHED';
export const REVAMP_ON_BOARDING_CONTEXT_FETCHED_FAILED = 'revampOnBoardingContext/FETCHED_FAILED';
export const REVAMP_ON_BOARDING_CONTEXT_UPDATE = 'revampOnBoardingContext/UPDATE';
export const REVAMP_ON_BOARDING_CONTEXT_UPDATE_FAILED = 'revampOnBoardingContext/UPDATE_FAILED';
export const REVAMP_ON_BOARDING_CONTEXT_UPDATE_SUCCESS = 'revampOnBoardingContext/UPDATE_SUCCESS';
export const REVAMP_SUNDAY_CHECKIN_FETCH = 'revampSundayCheckin/FETCH';
export const REVAMP_SUNDAY_CHECKIN_FETCHED = 'revampSundayCheckin/FETCHED';
export const REVAMP_SUNDAY_CHECKIN_FETCHED_FAILED = 'revampSundayCheckin/FETCHED_FAILED';
export const REVAMP_SUNDAY_CHECKIN_UPDATE = 'revampSundayCheckin/UPDATE';
export const REVAMP_SUNDAY_CHECKIN_UPDATE_FAILED = 'revampSundayCheckin/UPDATE_FAILED';
export const REVAMP_SUNDAY_CHECKIN_UPDATE_SUCCESS = 'revampSundayCheckin/UPDATE_SUCCESS';
export const REVAMP_SUNDAY_CHECKINS_LIST_FETCH = 'revampSundayCheckinsList/FETCH';
export const REVAMP_SUNDAY_CHECKINS_LIST_FETCHED = 'revampSundayCheckinsList/FETCHED';
export const REVAMP_SUNDAY_CHECKINS_LIST_FETCHED_FAILED = 'revampSundayCheckinsList/FETCHED_FAILED';


export const revampActionCreators = {
    fetchRevampContext: createAction(REVAMP_CONTEXT_FETCH),
    updateRevampContext: createAction(REVAMP_CONTEXT_UPDATE),
    fetchRevampOnBoardingContext: createAction(REVAMP_ON_BOARDING_CONTEXT_FETCH),
    updateRevampOnBoardingContext: createAction(REVAMP_ON_BOARDING_CONTEXT_UPDATE),
    fetchRevampSundayCheckin: createAction(REVAMP_SUNDAY_CHECKIN_FETCH),
    updateRevampSundayCheckin: createAction(REVAMP_SUNDAY_CHECKIN_UPDATE),
    fetchRevampSundayCheckinsList: createAction(REVAMP_SUNDAY_CHECKINS_LIST_FETCH)
};
