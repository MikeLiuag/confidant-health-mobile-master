import {all, call, fork, put, take} from "redux-saga/effects";
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
} from "./actions";
import {AlertUtil} from "ch-mobile-shared";
import ConversationService from "../../../services/Conversation.service";

function* revampContextFetcher() {
    while (true) {
        try {
            yield take(REVAMP_CONTEXT_FETCH);
            const revampContext = yield call(ConversationService.getRevampContext);
            if (revampContext.errors) {
                yield put({
                    type: REVAMP_CONTEXT_FETCHED_FAILED,
                    errorMsg: revampContext.errors[0].endUserMessage
                });

            } else {
                yield put({
                    type: REVAMP_CONTEXT_FETCHED, revampContext
                });

            }
        } catch (e) {
            yield put({type: REVAMP_CONTEXT_FETCHED_FAILED, errorMsg: e});
        }
    }
}

function* revampContextUpdateHandler() {
    while (true) {
        try {
            const {payload} = yield take(REVAMP_CONTEXT_UPDATE);
            const response = yield call(ConversationService.updateRevampContext, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: REVAMP_CONTEXT_UPDATE_FAILED
                });
            } else {
                yield put({
                    type: REVAMP_CONTEXT_UPDATE_SUCCESS
                });
                yield put({
                    type: REVAMP_CONTEXT_FETCH
                });
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_FETCH
                });
            }
        } catch (e) {
            yield put({type: REVAMP_CONTEXT_UPDATE, errorMsg: e});
        }
    }
}

function* revampOnBoardingContextFetcher() {
    while (true) {
        try {
            const payload = yield take(REVAMP_ON_BOARDING_CONTEXT_FETCH)
            const revampOnBoardingContext = yield call(ConversationService.getRevampOnBoardingContext);
            if (revampOnBoardingContext.errors) {
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_FETCHED_FAILED,
                    errorMsg: revampOnBoardingContext.errors[0].endUserMessage
                });

            } else {
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_FETCHED,  revampOnBoardingContext
                });
                if(payload.onSuccess){
                    payload.onSuccess();
                }
            }
        } catch (e) {
            yield put({type: REVAMP_ON_BOARDING_CONTEXT_FETCHED_FAILED, errorMsg: e});
        }
    }
}

function* revampOnBoardingContextUpdateHandler() {
    while (true) {
        try {
            const {payload} = yield take(REVAMP_ON_BOARDING_CONTEXT_UPDATE);
            const response = yield call(ConversationService.updateRevampOnBoardingContext, payload.revampOnBoardingContext);

            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_UPDATE_FAILED
                });
            } else {
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_UPDATE_SUCCESS
                });
                yield put({
                    type: REVAMP_ON_BOARDING_CONTEXT_FETCH,
                    onSuccess: payload.onSuccess
                });
                yield put({
                    type: REVAMP_CONTEXT_FETCH
                });
            }
        } catch (e) {
            yield put({type: REVAMP_ON_BOARDING_CONTEXT_UPDATE, errorMsg: e});
        }
    }
}

function* revampSundayCheckInFetcher() {
    while (true) {
        try {
            let {payload} = yield take(REVAMP_SUNDAY_CHECKIN_FETCH);
            if (!payload){
                payload = null
            }
            const revampSundayCheckIn = yield call(ConversationService.getSundayCheckIn,payload);
            if (revampSundayCheckIn.errors) {
                yield put({
                    type: REVAMP_SUNDAY_CHECKIN_FETCHED_FAILED,
                    errorMsg: revampSundayCheckIn.errors[0].endUserMessage
                });

            } else {
                yield put({
                    type: REVAMP_SUNDAY_CHECKIN_FETCHED,  revampSundayCheckIn
                });
            }
        } catch (e) {
            yield put({type: REVAMP_SUNDAY_CHECKIN_FETCHED_FAILED, errorMsg: e});
        }
    }
}

function* revampSundayCheckInUpdateHandler() {
    while (true) {
        try {
            const {payload} = yield take(REVAMP_SUNDAY_CHECKIN_UPDATE);
            const response = yield call(ConversationService.updateSundayCheckIn, payload.revampSundayCheckIn);

            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: REVAMP_SUNDAY_CHECKIN_UPDATE_FAILED
                });
            } else {
                yield put({
                    type: REVAMP_SUNDAY_CHECKIN_UPDATE_SUCCESS
                });
                // yield put({
                //     type: REVAMP_SUNDAY_CHECKIN_FETCH,
                //     onSuccess: payload.onSuccess
                // });
                // yield put({
                //     type: REVAMP_SUNDAY_CHECKINS_LIST_FETCH,
                //     onSuccess: payload.onSuccess
                // });
            }
        } catch (e) {
            yield put({type: REVAMP_SUNDAY_CHECKIN_UPDATE, errorMsg: e});
        }
    }
}

function* revampSundayCheckInsListFetcher() {
    while (true) {
        try {
            yield take(REVAMP_SUNDAY_CHECKINS_LIST_FETCH)
            const revampSundayCheckInsList = yield call(ConversationService.getSundayCheckIns);
            if (revampSundayCheckInsList.errors) {
                yield put({
                    type: REVAMP_SUNDAY_CHECKINS_LIST_FETCHED_FAILED,
                    errorMsg: revampSundayCheckInsList.errors[0].endUserMessage
                });

            } else {
                yield put({
                    type: REVAMP_SUNDAY_CHECKINS_LIST_FETCHED,  revampSundayCheckInsList
                });
            }
        } catch (e) {
            yield put({type: REVAMP_SUNDAY_CHECKINS_LIST_FETCHED_FAILED, errorMsg: e});
        }
    }
}
export default function* revampSaga() {
    yield all([
        fork(revampOnBoardingContextFetcher),
        fork(revampContextFetcher),
        fork(revampContextUpdateHandler),
        fork(revampOnBoardingContextUpdateHandler),
        fork(revampSundayCheckInFetcher),
        fork(revampSundayCheckInUpdateHandler),
        fork(revampSundayCheckInsListFetcher)
    ]);
}
