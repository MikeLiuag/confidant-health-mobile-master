import {all, call, fork, put, take, takeLatest} from 'redux-saga/effects';
import {
    ALL_SERVICES_FAILED, ALL_SERVICES_FETCHED,
    APPOINTMENTS_ADD_TO_CALENDER,
    APPOINTMENTS_ADDED_TO_CALENDER, APPOINTMENTS_CURRENT_FETCHED,
    APPOINTMENTS_FETCH,
    APPOINTMENTS_FETCH_CURRENT, APPOINTMENTS_FETCH_CURRENT_FAILED,
    APPOINTMENTS_FETCH_FAILED, APPOINTMENTS_FETCH_PAST, APPOINTMENTS_FETCH_PAST_FAILED,
    APPOINTMENTS_FETCH_SILENT,
    APPOINTMENTS_FETCHED, APPOINTMENTS_PAST_FETCHED, FETCH_ALL_SERVICES,
} from './actions';
import AppointmentService from '../../../services/Appointment.service';
import moment from 'moment';
import { AlertUtil, getAvatar, getDSTOffset, getTimeByDSTOffset } from "ch-mobile-shared";
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import AuthStore from '../../../utilities/AuthStore';
import momentTimeZone from "moment-timezone";
import ScheduleService from "../../../services/ScheduleService";


function* appointmentsChannel() {
    yield takeLatest([APPOINTMENTS_FETCH, APPOINTMENTS_FETCH_SILENT], appointmentsCombinedFetcher);
}

function* appointmentsCombinedFetcher(action) {
    try {
        // yield put({
        //     type: GET_CONNECTIONS
        // });
        let refresh = false;
        if (action.type === APPOINTMENTS_FETCH_SILENT) {
            refresh = true;
        }
        yield put({
            type: APPOINTMENTS_FETCH_CURRENT,
            payload: {size: 30, refresh},
        });
        yield put({
            type: APPOINTMENTS_FETCH_PAST,
            payload: {size: 30, refresh},
        });
    } catch (e) {
        yield put({type: APPOINTMENTS_FETCH_FAILED, errorMsg: e});
    }

}

function* fetchAppointments(args,action) {
    const {type, successAction, failAction} = args[0];
    const {payload} = action;
    const {size} = payload;
    const refDate = moment();
    yield call(fetchAppointmentsByType, type, size, refDate, successAction, failAction, true);
}

function* fetchCurrentAppointments() {
    yield takeLatest(APPOINTMENTS_FETCH_CURRENT, fetchAppointments, [{type: 'current', successAction: APPOINTMENTS_CURRENT_FETCHED, failAction: APPOINTMENTS_FETCH_CURRENT_FAILED}]);
}

function* fetchPastAppointments() {
    yield takeLatest(APPOINTMENTS_FETCH_PAST, fetchAppointments, [{type: 'past', successAction: APPOINTMENTS_PAST_FETCHED, failAction: APPOINTMENTS_FETCH_PAST_FAILED}]);
}

function* fetchAppointmentsByType(type, size, refDate, successAction, failAction, initialFetch = false) {
    try {
        let response = yield call(AppointmentService.getAppointmentsV2, type, size,
            refDate.format('DD-MM-yyyy'),momentTimeZone.tz.guess(true));


        if (response.errors) {
            yield put({
                type: failAction,
                errorMsg: response.errors[0].endUserMessage,
            });
        } else {
            if (!response.singleAppointments) {
                response.singleAppointments = [];
            }
            let appointments = response.singleAppointments;
            appointments = yield call(Promise.all, appointments.map(async appointment => {
                    const startMoment = getTimeByDSTOffset(appointment.startTime);
                    const endMoment = getTimeByDSTOffset(appointment.endTime);
                    appointment.date = startMoment.format('DD');
                    appointment.month = startMoment.format('MMM');
                    appointment.year = startMoment.format("YYYY");
                    appointment.startText = startMoment.format('h:mm a');
                    appointment.endText = endMoment.format('h:mm a');
                    appointment.profilePicture = appointment.participantImage;
                    appointment.avatar = appointment.profilePicture ? getAvatar(appointment) : null;
                    const inCalender = await AuthStore.hasCalendarEvent(appointment.appointmentId);
                    appointment.addedInCalendar = !!(inCalender && inCalender === appointment.appointmentId);
                    return appointment;
                }),
            );
            if (appointments.length > 0) {
                yield put({
                    type: successAction,
                    payload: {appointments: appointments, initialFetch},
                });
                if (response.hasMore) {
                    if (type === 'current') {
                        refDate = refDate.add('days', 30);
                    } else {
                        refDate = refDate.subtract('days', 30);
                    }
                    yield call(fetchAppointmentsByType, type, size + 30, refDate, successAction, failAction, false);
                }
            } else {
                if (response.hasMore) {
                    yield call(fetchAppointmentsByType, type, size + 30, refDate, successAction, failAction, initialFetch);
                } else {
                    yield put({
                        type: successAction,
                        payload: {appointments: [], initialFetch},
                    });
                }
            }
        }
    } catch (e) {
        console.log(e);
        yield put({type: failAction, errorMsg: e});
    }
}

function* addToCalenderHandler() {
    while (true) {
        const {payload} = yield take(APPOINTMENTS_ADD_TO_CALENDER);
        try {
            const {onSave, ...request} = payload;
            const eventInfo = yield call(AddCalendarEvent.presentEventCreatingDialog, request);
            if (eventInfo.action === 'SAVED') {
                yield call(AuthStore.setCalendarEvent, payload.appointmentId);
                AlertUtil.showSuccessMessage('Appointment Successfully saved in calendar.');
                yield put({type: APPOINTMENTS_FETCH});
                if (onSave) {
                    onSave();
                }
            }
        } catch (error) {
            AlertUtil.showErrorMessage('Permission not granted.');
            console.log(error);
        }

    }
}

function* fetchAllServices() {
    while (true) {
        yield take(FETCH_ALL_SERVICES);
        try {
            const allServices = yield call(ScheduleService.getAllServices);
            if (allServices.errors) {
                AlertUtil.showErrorMessage(allServices.errors[0].endUserMessage);
                yield put({
                    type: ALL_SERVICES_FAILED, payload: {
                        errorMsg: allServices?.errors[0]?.endUserMessage,
                    }
                })
            } else {
                yield put({type: ALL_SERVICES_FETCHED, payload: allServices})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: ALL_SERVICES_FAILED})

        }
    }

}


export default function* appointmentSaga() {
    yield all([
        fork(appointmentsChannel),
        fork(addToCalenderHandler),
        fork(fetchCurrentAppointments),
        fork(fetchPastAppointments),
        fork(fetchAllServices)
    ]);
}
