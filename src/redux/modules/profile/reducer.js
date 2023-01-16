import {USER_LOGOUT} from "../auth/actions";
import {
    PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED,
    PROFILE_UPDATE_PROVIDER_ACCESS_FAILED,
    PROFILE_ALLOWED_PROVIDERS_FETCHED,
    PROFILE_CLEAR_ERRORS,
    PROFILE_FETCH_FAILED,
    PROFILE_FETCHED,
    PROFILE_UPDATE,
    PROFILE_UPDATED,
    PROFILE_MARKED_EDUCATION_CONTENT,
    PROFILE_GET_EDUCATION_STATUS_FAILED, PROFILE_UPDATE_FAILED, PROFILE_FETCH,
} from './actions';
import {
    EDUCATIONAL_CONTENT_BOOKMARKED, EDUCATIONAL_CONTENT_COMPLETED
} from "../educational-content/actions";

export const DEFAULT = {
    isLoading: false,
    error: null,
    errorMsg: null,
    patient: null,
    profileUpdated: false,
    providerAccess: {
        allowedProviders: [],
        deniedProviders: []
    },
    bookmarked: [],
    markAsCompleted: [],
    educationStatusError: null,
};

export default function profileReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case PROFILE_FETCH: {
            return {
                ...state,
                isLoading: true
            }
        }
        case PROFILE_FETCHED: {
            return {
                ...state,
                patient: payload.data,
                isLoading: false,
                error: false,
                errorMsg: null,
            }
        }
        case PROFILE_FETCH_FAILED: {
            return {
                ...state,
                patient: null,
                error: true,
                isLoading: false,
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_ALLOWED_PROVIDERS_FETCHED: {
            return {
                ...state,
                providerAccess: payload
            }
        }
        case PROFILE_ALLOWED_PROVIDERS_FETCH_FAILED: {
            return {
                ...state,
                providerAccess: {
                    allowedProviders: [],
                    deniedProviders: []
                },
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_UPDATE: {
            return {
                ...state,
                isLoading: true
            }
        }
        case PROFILE_UPDATE_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_UPDATE_PROVIDER_ACCESS_FAILED: {
            return {
                ...state,
                isLoading: false,
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_UPDATED: {
            return {
                ...state,
                isLoading: false,
                profileUpdated: true,
                patient: {
                    ...state.patient,
                    fullName: payload.fullName ? payload.fullName : state.patient.fullName,
                    firstName: payload.firstName ? payload.firstName : state.patient.firstName,
                    lastName: payload.lastName ? payload.lastName : state.patient.lastName,
                    dob: payload.dob ? payload.dob : state.patient.dob,
                    age: payload.age ? payload.age : state.patient.age,
                    emailAddress: payload.emailAddress ? payload.emailAddress : state.patient.emailAddress,
                    phoneNumber: payload.phoneNumber ? payload.phoneNumber : state.patient.phoneNumber,
                    address1: payload.address1 ? payload.address1 : state.patient.address1,
                    address2: payload.address2 ? payload.address2 : state.patient.address2,
                    city: payload.city ? payload.city : state.patient.city,
                    state: payload.state ? payload.state : state.patient.state,
                    zipCode: payload.zipCode ? payload.zipCode : state.patient.zipCode,
                    emergencyContact: payload.emergencyContact ? payload.emergencyContact : state.patient.emergencyContact,
                    emergencyPhone: payload.emergencyPhone ? payload.emergencyPhone : state.patient.emergencyPhone,
                    appliedFor: payload.appliedFor ? payload.appliedFor : state.patient.appliedFor,
                    gender: payload.gender ? payload.gender : state.patient.gender,
                    isRegistered: payload.isRegistered ? payload.isRegistered : state.patient.isRegistered,
                    profileImage: payload.profileImage ? payload.profileImage : state.patient.profileImage,
                    passedFirstAppointmentFlow: payload.passedFirstAppointmentFlow ? payload.passedFirstAppointmentFlow : false
                }
            }
        }
        case PROFILE_CLEAR_ERRORS: {
            return {
                ...state,
                error: false,
                isLoading: false,
                errorMsg: null,
                profileUpdated: false
            }
        }

        case PROFILE_MARKED_EDUCATION_CONTENT: {
            return {
                ...state,
                isLoading: false,
                bookmarked: payload.bookmarkedContentResponse,
                markAsCompleted: payload.markAsCompletedContentResponse,
            }
        }
        case PROFILE_GET_EDUCATION_STATUS_FAILED : {
            return {
                ...state,
                isLoading: false,
                educationStatusError: action.errorMsg
            }
        }
        case EDUCATIONAL_CONTENT_BOOKMARKED: {
            let bookmarked = state.bookmarked;
            if (payload.shouldMark) {
                bookmarked.push({slug: payload.markInfo.slug});
            } else {
                bookmarked = bookmarked.filter(marker => {
                    return marker.slug !== payload.markInfo.slug;

                });
            }
            return {
                ...state,
                isLoading: false,
                bookmarked
            };
        }
        case EDUCATIONAL_CONTENT_COMPLETED: {
            const markAsCompleted = state.markAsCompleted;
            markAsCompleted.push({slug: payload.markInfo.slug});
            return {
                ...state,
                isLoading: false,
                markAsCompleted
            };
        }
        case USER_LOGOUT: {
            return DEFAULT;
        }
        default: {
            return state;
        }
    }
}
