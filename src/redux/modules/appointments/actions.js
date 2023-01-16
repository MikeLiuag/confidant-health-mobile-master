import { createAction } from "redux-actions";

export const APPOINTMENTS_FETCH = 'appointments/FETCH';
export const APPOINTMENTS_FETCH_CURRENT = 'appointments/FETCH_CURRENT';
export const APPOINTMENTS_FETCH_PAST = 'appointments/FETCH_PAST';
export const APPOINTMENTS_CURRENT_FETCHED = 'appointments/CURRENT_FETCHED';
export const APPOINTMENTS_PAST_FETCHED = 'appointments/PAST_FETCHED';
export const APPOINTMENTS_FETCH_CURRENT_FAILED = 'appointments/FETCH_CURRENT_FAILED';
export const APPOINTMENTS_FETCH_PAST_FAILED = 'appointments/FETCH_PAST_FAILED';
export const APPOINTMENTS_FETCH_SILENT = 'appointments/FETCH_SILENT';
export const APPOINTMENTS_FETCHED = 'appointments/FETCHED';
export const APPOINTMENTS_FETCH_FAILED = 'appointments/FETCH_FAILED';
export const APPOINTMENTS_ADD_TO_CALENDER = 'appointments/ADD_TO_CALENDER';
export const APPOINTMENTS_ADDED_TO_CALENDER = 'appointments/ADDED_TO_CALENDER';

export const FETCH_ALL_SERVICES = 'connections/FETCH_ALL_SERVICES';
export const ALL_SERVICES_FAILED = 'connections/ALL_SERVICES_FAILED';
export const ALL_SERVICES_FETCHED = 'connections/ALL_SERVICES_FETCHED';


const GET_CONNECTIONS_SILENT = 'connections/GET_SILENT';

export const appointmentsActionCreators = {
    fetchAppointments: createAction(APPOINTMENTS_FETCH),
    fetchAppointmentsSilently: createAction(APPOINTMENTS_FETCH_SILENT),
    addToCalender: createAction(APPOINTMENTS_ADD_TO_CALENDER),
    refreshConnections: createAction(GET_CONNECTIONS_SILENT),
    fetchAllServices: createAction(FETCH_ALL_SERVICES),

};
