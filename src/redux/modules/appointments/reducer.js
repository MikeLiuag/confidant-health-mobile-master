import {USER_LOGOUT} from "../auth/actions";
import {
    ALL_SERVICES_FAILED, ALL_SERVICES_FETCHED,
    APPOINTMENTS_ADDED_TO_CALENDER, APPOINTMENTS_CURRENT_FETCHED,
    APPOINTMENTS_FETCH,
    APPOINTMENTS_FETCH_CURRENT,
    APPOINTMENTS_FETCH_FAILED, APPOINTMENTS_FETCH_PAST,
    APPOINTMENTS_FETCH_SILENT,
    APPOINTMENTS_FETCHED, APPOINTMENTS_PAST_FETCHED, FETCH_ALL_SERVICES,
} from './actions';
import moment from 'moment';

export const DEFAULT = {
    isLoading: false,
    isSilentLoading: false,
    isCurrentLoading: false,
    isPastLoading: false,
    error: false,
    errorMsg: null,
    appointments: [],
    currentAppointments: [],
    pastAppointments: [],
    allServices:[]
};

const arrayUniqueByKey = (array, key)=>{
    return [...new Map(array.map(item =>
        [item[key], item])).values()];
}

export const sortAppointments=(appointments)=>{
    return arrayUniqueByKey(appointments, 'appointmentId').sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
};

export default function appointmentReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case APPOINTMENTS_FETCH: {
            return {
                ...state,
                isLoading: true,
                error: false
            }
        }
        case APPOINTMENTS_FETCH_CURRENT: {
            if(!payload.refresh) {
                return {
                    ...state,
                    isCurrentLoading: true,
                    currentAppointments: []
                }
            } else return state;

        }
        case APPOINTMENTS_FETCH_PAST: {
            if(!payload.refresh) {
                return {
                    ...state,
                    isPastLoading: true,
                    pastAppointments: []
                }
            } else return state;

        }
        case APPOINTMENTS_CURRENT_FETCHED: {
            return {
                ...state,
                isCurrentLoading: false,
                isLoading: false,
                currentAppointments: payload.initialFetch? payload.appointments: arrayUniqueByKey([...state.currentAppointments, ...payload.appointments], 'appointmentId'),
                appointments: arrayUniqueByKey([...state.pastAppointments, ...payload.appointments], 'appointmentId')
            }
        }
        case APPOINTMENTS_PAST_FETCHED: {
            return {
                ...state,
                isPastLoading: false,
                isLoading: false,
                pastAppointments: payload.initialFetch? payload.appointments: arrayUniqueByKey([...state.pastAppointments, ...payload.appointments], 'appointmentId'),
                appointments: arrayUniqueByKey([...state.currentAppointments, ...payload.appointments], 'appointmentId')
            }
        }
        case APPOINTMENTS_FETCH_SILENT: {
            return {
                ...state,
                isSilentLoading: true,
                isLoading: false,
                error: false
            }
        }
        case APPOINTMENTS_FETCH_FAILED: {
            return {
                ...state,
                isLoading: false,
                isSilentLoading: false,
                error:true
            }
        }
        case APPOINTMENTS_FETCHED: {
            return {
                ...state,
                isLoading: false,
                error: false,
                isSilentLoading: false,
                appointments: payload.appointments
            }
        }
        case USER_LOGOUT: {
            return DEFAULT;
        }
        case FETCH_ALL_SERVICES: {
            return {
                ...state,
                isLoading: true
            };
        }
        case ALL_SERVICES_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            };
        }
        case ALL_SERVICES_FETCHED: {
            return {
                ...state,
                isLoading: false,
                allServices: payload
            };
        }
        default: {
            return {
                ...state,
                isLoading: false
            };
        }
    }
}
