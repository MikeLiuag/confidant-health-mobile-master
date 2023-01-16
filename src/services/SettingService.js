import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from "../constants/ApiEndpoints";

export default class SettingService {

    static getNotificationSettings(){
        return HttpClient.getInstance().request(ApiEndpoints.GET_NOTIFICATION_SETTINGS);
    }

    static updateNotificationSettings(notificationSettings) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_NOTIFICATION_SETTINGS, null, null, null, notificationSettings);
    }
}
