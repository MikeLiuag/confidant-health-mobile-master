import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from '../constants/ApiEndpoints';
import KeyValueStorage from "react-native-key-value-storage"
import {NICK_NAME, USER_ID} from "../constants/CommonConstants";
import Authstore from './../utilities/AuthStore.js'

export default class AuthService {
    static AuthHeader = {
        Authorization: null
    };

    static loginViaMagicLink(credentials) {
        return HttpClient.getInstance().request(ApiEndpoints.MAGIC_LOGIN, null, null, null, credentials);
    }

    static refreshAuthToken() {
        return HttpClient.getInstance().request(ApiEndpoints.REFRESH_AUTH_TOKEN, null, null, null, null);
    }

    static suicidalCriteria(){
        return HttpClient.getInstance().request(ApiEndpoints.SUICIDAL_CRITERIA , null , null , null , null);
    }

    static async registerPlayerId(playerId) {
        return HttpClient.getInstance().request(ApiEndpoints.REGISTER_PLAYERID, {playerId}, null, null, null);
    }

    static async removePlayerId(playerId, authToken) {
        console.log('Explicit Auth Token ' + authToken);
        return HttpClient.getInstance().request(ApiEndpoints.REMOVE_PLAYERID, {playerId}, null, null, null, false, authToken);
    }

    static async logout() {
        await KeyValueStorage.remove(USER_ID);
        await KeyValueStorage.remove(NICK_NAME);
        return await Authstore.deleteAuthToken();
    }

    static async getPatientOnBoardingGoals() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_ON_BOARDING_GOALS);
    }

}
