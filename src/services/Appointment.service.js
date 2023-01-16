import {HttpClient} from 'ch-mobile-shared';
import {ApiEndpoints} from '../constants/ApiEndpoints';

export default class AppointmentService {
  static listProviders() {
    return HttpClient.getInstance().request(ApiEndpoints.LIST_APPOINTMENT_ELIGIBLE_PROVIDERS);
  }

  static getProviderServices(providerId) {
    return HttpClient.getInstance().request(ApiEndpoints.GET_PROVIDER_SERVICES,{providerId});
  }

  static getAvailableSlots(participantId, serviceId, date, timeZone) {
    return HttpClient.getInstance().request(ApiEndpoints.GET_AVAILABLE_SLOTS,null,null,null,{participantId,serviceId,date, timeZone});
  }

  static requestAppointment(payload) {
    return HttpClient.getInstance().request(ApiEndpoints.REQUEST_APPOINTMENT,null,null,null,payload);
  }

  static getAllAppointments() {
    return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_APPOINTMENTS);
  }

  static getAppointmentsV2(type='current', size=30, refDate,timezone) {
    return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_APPOINTMENTS_V2, null, null,null,{type, size, refDate,timezone});
  }

    static requestChanges(appointmentId, payload) {
        return HttpClient.getInstance().request(ApiEndpoints.REQUEST_APPOINTMENT_CHANGES,{appointmentId},null,null,payload);
    }

    static confirmAppointment(confirmAppointmentByMember) {
        return HttpClient.getInstance().request(ApiEndpoints.CONFIRM_APPOINTMENT,null,null,null,confirmAppointmentByMember);
    }

    static cancelAppointment(appointmentId, reason) {
        return HttpClient.getInstance().request(ApiEndpoints.CANCEL_APPOINTMENT,{appointmentId},null,null, {reason});
    }

    static arriveForAppointment(appointmentId,Authorization){
        return HttpClient.getInstance().request(ApiEndpoints.ARRIVE_FOR_APPOINTMENT,{appointmentId},null,{Authorization});
    }

    static completeAppointment(appointmentId){
        return HttpClient.getInstance().request(ApiEndpoints.COMPLETE_APPOINTMENT,{appointmentId},null,null,null);
    }

    static getAllServiceTypes() {
      return HttpClient.getInstance().request(ApiEndpoints.GET_ALL_SERVICE_TYPES);
    }

    static getServicesByType(serviceType) {
      return HttpClient.getInstance().request(ApiEndpoints.GET_SERVICES_BY_TYPE,null,{serviceType});
    }

    static associateSessionPostPayment(appointmentId, payload) {
      return HttpClient.getInstance().request(ApiEndpoints.ASSOCIATE_POST_PAYMENT,{appointmentId},null,null,payload);
    }

  static getMasterSchedule(payload) {
    return HttpClient.getInstance().request(ApiEndpoints.GET_MASTER_SCHEDULE,null,null,null,payload);
  }

  static getProgressReportAppointments(queryParams) {
    return HttpClient.getInstance().request(ApiEndpoints.GET_PROGRESS_REPORT_APPOINTMENTS,null,queryParams,null,null);
  }
}
