import {ApiEndpoints} from '../constants/ApiEndpoints';
import {HttpClient} from "ch-mobile-shared";

export default class ScheduleService {

    static async getAllServices() {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_ALL_SERVICES,
            null,
            null,
            null,
            null,
        );
    }
}
