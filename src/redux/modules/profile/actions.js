import { createAction } from "redux-actions";
import {FETCH_ASSIGNED_CONTENT} from '../educational-content/actions';

export const PROFILE_FETCH = 'profile/FETCH';
export const PROFILE_FETCHED = 'profile/FETCHED';
export const PROFILE_FETCH_FAILED = 'profile/FETCH_FAILED';
export const PROFILE_UPDATE = 'profile/UPDATE';
export const PROFILE_UPDATE_FAILED = 'profile/UPDATE_FAILED';
export const PROFILE_UPDATED = 'profile/UPDATED';
export const PROFILE_CLEAR_ERRORS = 'profile/CLEAR_ERRORS';
export const PROFILE_GET_ALLOWED_PROVIDERS = 'profile/GET_ALLOWED_PROVIDERS';
export const PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED = 'profile/ALLOWED_PROVIDERS_FETCH_FAILED';
export const PROFILE_ALLOWED_PROVIDERS_FETCHED = 'profile/ALLOWED_PROVIDERS_FETCHED';
export const PROFILE_UPDATE_PROVIDER_ACCESS = 'profile/UPDATE_PROVIDER_ACCESS';
export const PROFILE_UPDATE_PROVIDER_ACCESS_UPDATED = 'profile/PROFILE_UPDATE_PROVIDER_ACCESS_UPDATED';
export const PROFILE_UPDATE_PROVIDER_ACCESS_FAILED = 'profile/PROFILE_UPDATE_PROVIDER_ACCESS_FAILED';
export const PROFILE_GET_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_GET_MARKED_EDUCATION_CONTENT';
export const PROFILE_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_MARKED_EDUCATION_CONTENT';
export const PROFILE_GET_EDUCATION_STATUS_FAILED = 'profile/GET_EDUCATION_STATUS_FAILED';
export const PROFILE_UPDATE_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_UPDATE_MARKED_EDUCATION_CONTENT';

export const profileActionCreators = {
    updateProfile: createAction(PROFILE_UPDATE),
    clearErrors: createAction(PROFILE_CLEAR_ERRORS),
    refreshAllowedProviders: createAction(PROFILE_GET_ALLOWED_PROVIDERS),
    updateProviderAccess: createAction(PROFILE_UPDATE_PROVIDER_ACCESS),
    fetchContentAssignedToMe: createAction(FETCH_ASSIGNED_CONTENT),
    fetchProfile : createAction(PROFILE_FETCH)
    //updateMarkedEducationContent:createAction(PROFILE_UPDATE_MARKED_EDUCATION_CONTENT)
};
