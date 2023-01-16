import {select, all, call, fork, put, take} from "redux-saga/effects";
import {
    PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED, PROFILE_ALLOWED_PROVIDERS_FETCHED,
    PROFILE_FETCH,
    PROFILE_FETCH_FAILED,
    PROFILE_FETCHED, PROFILE_GET_ALLOWED_PROVIDERS,
    PROFILE_UPDATE,
    PROFILE_UPDATE_FAILED,
    PROFILE_UPDATED,
    PROFILE_UPDATE_PROVIDER_ACCESS,
    PROFILE_UPDATE_PROVIDER_ACCESS_UPDATED,
    PROFILE_UPDATE_PROVIDER_ACCESS_FAILED,
    PROFILE_GET_MARKED_EDUCATION_CONTENT,
    PROFILE_MARKED_EDUCATION_CONTENT,
    PROFILE_GET_EDUCATION_STATUS_FAILED,

} from "./actions";
import ProfileService from "../../../services/Profile.service";
import {GET_CONNECTIONS} from "../connections/actions";
import {AlertUtil} from "ch-mobile-shared";
import Analytics from '@segment/analytics-react-native';
import { S3_BUCKET_LINK, SEGMENT_EVENT } from "../../../constants/CommonConstants";
import Instabug, {identifyUser} from 'instabug-reactnative';

function* profileFetcher() {
    while (true) {
        try {
            yield take(PROFILE_FETCH);
            // yield put({
            //     type: GET_CONNECTIONS
            // });
            const profileData = yield call(ProfileService.getProfile);
            if (profileData.errors) {
                yield put({
                    type: PROFILE_FETCH_FAILED,
                    errorMsg: profileData.errors[0].endUserMessage
                });

            } else {
                const userMeta = yield select(state => state.auth.meta);
                Analytics.identify(userMeta.userId, {
                    name: profileData.fullName,
                    email: profileData.emailAddress,
                    phone: profileData.phoneNumber,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName
                });
                Instabug.identifyUser(profileData.emailAddress, profileData.fullName);
                yield put({
                    type: PROFILE_FETCHED, payload: {
                        data: {...profileData, lastModified: profileData.joinedDate, userId: userMeta.userId}
                    }
                });
                yield put({
                    type: PROFILE_GET_ALLOWED_PROVIDERS,
                });
            }
        } catch (e) {
            yield put({type: PROFILE_FETCH_FAILED, errorMsg: e});
        }
    }
}

function* profileUpdateHandler() {
    while (true) {
        try {
            const {payload} = yield take(PROFILE_UPDATE);
            const response = yield call(ProfileService.updateProfile, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({
                    type: PROFILE_UPDATE_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                AlertUtil.showSuccessMessage("Profile updated successfully");
                const userMeta = yield select(state => state.auth.meta);
                const existingProfile = yield select(state => state.profile.patient);
                Analytics.track(SEGMENT_EVENT.PROFILE_UPDATED, {
                    userId: userMeta.userId,
                    name: response.fullName || existingProfile.fullName,
                    email: response.emailAddress || existingProfile.emailAddress,
                    phone: response.phoneNumber || existingProfile.phoneNumber,
                    firstName: response.firstName || existingProfile.firstName,
                    lastName: response.lastName || existingProfile.lastName
                });
                yield put({
                    type: PROFILE_UPDATED,
                    payload: response
                });
            }
        } catch (e) {
            yield put({type: PROFILE_UPDATE_FAILED, errorMsg: e});
        }
    }
}

function* allowedProvidersRefreshHandler() {
    while (true) {
        try {
            yield take(PROFILE_GET_ALLOWED_PROVIDERS);
            const response = yield call(ProfileService.getAllowedProviders);
            if (response.errors) {
                yield put({
                    type: PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                yield put({
                    type: PROFILE_ALLOWED_PROVIDERS_FETCHED,
                    payload: response
                });
            }
        } catch (e) {
            yield put({type: PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED, errorMsg: e});
        }
    }
}

function* updateProviderAccessTask() {
    while (true) {
        try {
            const {payload} = yield take(PROFILE_UPDATE_PROVIDER_ACCESS);
            const response = yield call(ProfileService.allowProviderAccess, payload.providerId, payload.allowed);
            if (response.errors) {
                yield put({
                    type: PROFILE_UPDATE_PROVIDER_ACCESS_FAILED,
                    errorMsg: response.errors[0].endUserMessage
                });
            } else {
                yield put({
                    type: PROFILE_GET_ALLOWED_PROVIDERS
                });
            }
        } catch (error) {
            yield put({type: PROFILE_UPDATE_PROVIDER_ACCESS_FAILED, errorMsg: error});
        }
    }
}

function* markedEducationalContentFetcher() {
    while (true) {
        try {
            yield take(PROFILE_GET_MARKED_EDUCATION_CONTENT);
            let bookmarkedContentResponse = yield call(ProfileService.getMarkedEducationalContent, "bookmarked");
            let markAsCompletedContentResponse = yield call(ProfileService.getMarkedEducationalContent, "completedSlug");

            if (bookmarkedContentResponse.errors) {
                yield put({
                    type: PROFILE_GET_EDUCATION_STATUS_FAILED,
                    errorMsg: bookmarkedContentResponse.errors[0].endUserMessage
                });
            } else if (markAsCompletedContentResponse.errors) {
                yield put({
                    type: PROFILE_GET_EDUCATION_STATUS_FAILED,
                    errorMsg: markAsCompletedContentResponse.errors[0].endUserMessage
                });
            } else {
                bookmarkedContentResponse = bookmarkedContentResponse.map(slug => {
                    return {slug}
                });
                markAsCompletedContentResponse = markAsCompletedContentResponse.map(slug => {
                    return {slug}
                });
                yield put({
                    type: PROFILE_MARKED_EDUCATION_CONTENT,
                    payload: {bookmarkedContentResponse, markAsCompletedContentResponse}
                });
            }
        } catch (error) {
            console.warn(error);
            yield put({type: PROFILE_GET_EDUCATION_STATUS_FAILED, errorMsg: error});
        }
    }
}


export default function* profileSaga() {
    yield all([
        fork(profileFetcher),
        fork(profileUpdateHandler),
        fork(allowedProvidersRefreshHandler),
        fork(updateProviderAccessTask),
        fork(markedEducationalContentFetcher),

    ]);
}
