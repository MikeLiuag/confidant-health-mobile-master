import {take, put, call, all, fork, cancel} from "redux-saga/effects";

import {
    USER_LOGOUT,
    USER_LOGIN_FAILED,
    USER_MAGIC_LOGIN,
    REGISTER_TOKEN_REFRESH_TASK,
    MAGIC_LOGIN_EMAIL_SENT,
} from './actions';

import AuthService from "../../../services/Auth.service";
import AuthStore from './../../../utilities/AuthStore';
import KeyValueStorage from "react-native-key-value-storage";
import {eventChannel} from "redux-saga";
import {AlertUtil, SocketClient} from 'ch-mobile-shared';
import Instabug from 'instabug-reactnative';

function* loginWithMagicHandler() {
    while (true) {
        const {payload} = yield take(USER_MAGIC_LOGIN);
        try {
            const response = yield call(AuthService.loginViaMagicLink, payload.request);
            if (response.errors) {
                const {provisionalPatientDetails} = payload.request;
                let errorMessage = response.errors[0].endUserMessage;
                const invalidPayload = (!provisionalPatientDetails.nickName && errorMessage === "Name is required for onboarding");
                if (invalidPayload) {
                    errorMessage = "Please enter registered email address";

                }
                AlertUtil.showErrorMessage(errorMessage);
                yield put({
                    type: USER_LOGIN_FAILED,
                    errorMsg: errorMessage
                });
            } else {
                AlertUtil.showSuccessMessage(response.successMessage);
                yield put({type: MAGIC_LOGIN_EMAIL_SENT});
                if (payload.callback) {
                    payload.callback();
                }
            }
        } catch (error) {
            yield put({type: USER_LOGIN_FAILED, errorMsg: error});
        }
    }
}

function* logoutHandler() {
    while (true) {
        yield take(USER_LOGOUT);
        SocketClient.getInstance().unregisterConnectivityCallbacks("GlobalSocketWatcher");
        const authToken = yield call(AuthStore.getAuthToken);
        yield call(AuthService.logout);
        yield call(Instabug.logOut);
        SocketClient.getInstance().disconnect();
        let playerId = yield call(KeyValueStorage.get, 'playerId');
        if (playerId && authToken) {
            const response = yield call(AuthService.removePlayerId, playerId, authToken);
            if (response.errors) {
                console.log(response.errors[0].endUserMessage)
            } else {
                try {
                    yield call(KeyValueStorage.remove, 'playerId');
                    console.log('PLAYER ID SUCCESSFULLY REMOVED');
                } catch (e) {
                    console.log('Error removing player Id');
                    console.log(e);
                }
            }
        }
    }

}

function* registerTokenRefreshTask() {

    let refreshTask = null;
    while (true) {
        yield take(REGISTER_TOKEN_REFRESH_TASK);
        console.log('Registering timer channel');
        if (refreshTask) {
            yield cancel(refreshTask);
        }
        refreshTask = yield fork(authTokenRefreshTask);
    }
}

function* authTokenRefreshTask() {
    let expiryMillis = yield call(AuthStore.getTokenExpiration);
    while (true) {
        if (!expiryMillis) {
            expiryMillis = 3600000;
            console.warn('Backend has not provided expiration time. Using fallback expiry time ' + expiryMillis + 'ms');
        } else {
            expiryMillis = parseInt(expiryMillis) - new Date().getTime();
            console.log('Converted Milis: ' + expiryMillis);
        }
        const repeatChannel = yield call(timerChannel, expiryMillis);
        yield take(repeatChannel);
        console.log('Auth Token is expiring soon. Refreshing...');
        const refreshed = yield call(AuthService.refreshAuthToken);
        if (refreshed.errors) {
            console.warn('Failed to refresh Auth Token. App session will be logged out soon');
        } else {
            console.log('Auth Token Refreshed Successfully. Setting new timeout for token refresh');
            if (!refreshed.expiration) {
                console.warn('Backend has not provided Expiration time. Using previous expiration timeout for token refresh');
            } else {
                expiryMillis = refreshed.expiration;
            }
        }
    }
}

function timerChannel(millis) {
    return eventChannel(emitter => {
            const timeOut = setTimeout(() => {
                emitter({});
            }, millis - 10000);
            return () => {
                clearTimeout(timeOut)
            }
        }
    )
}

function* saveAuthToken({accessToken, expiration, tokenType}) {
    yield call(
        AuthStore.setAuthToken,
        accessToken,
        expiration,
        tokenType
    );
}

export default function* authSaga() {
    yield all([
        fork(loginWithMagicHandler),
        fork(logoutHandler),
        fork(registerTokenRefreshTask)
    ]);
}
