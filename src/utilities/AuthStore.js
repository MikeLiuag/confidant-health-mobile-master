import KeyValueStorage from "react-native-key-value-storage"
import {AUTH_TOKEN_EXPIRATION_KEY, AUTH_TOKEN_KEY} from "ch-mobile-shared";
import {ApiEndpoints} from '../constants/ApiEndpoints';

class AuthStore {
    async getAuthToken() {
        try {
            return await KeyValueStorage.get(AUTH_TOKEN_KEY);
        } catch (e) {
            // error reading value
            return null;
        }
    }

    async getTokenExpiration() {
        try {
            return await KeyValueStorage.get(AUTH_TOKEN_EXPIRATION_KEY);
        } catch (e) {
            // error reading value
            return null;
        }
    }


    async setCalendarEvent(eventId){
        try{
            await KeyValueStorage.set(eventId, eventId);
        }catch (e) {
            console.warn(e);
        }
    }


    async removeCalendarEvent(eventId){
        await KeyValueStorage.remove(eventId);
    }

    async hasCalendarEvent(eventId) {
        try {
            return await KeyValueStorage.get(eventId);
        } catch (e) {
            // error reading value
            return null;
        }
    }

    async storeBranchParams (params) {
        try{
            await KeyValueStorage.set('branchLink', JSON.stringify(params));
        }catch (e) {
            console.warn(e);
        }
    }

    async getBranchParams () {
        try {
            let content = await KeyValueStorage.get('branchLink');
            return JSON.parse(content);
        } catch (e) {
            // error reading value
            return null;
        }
    }

    async removeBranchParams () {
        await KeyValueStorage.remove('branchLink');
    }



    async setAuthToken(token: string, expiration, tokenType = 'Bearer') {
        try {
            await KeyValueStorage.set(AUTH_TOKEN_KEY, tokenType + ' ' + token);
            if (expiration) {
                await KeyValueStorage.set(AUTH_TOKEN_EXPIRATION_KEY, expiration + "");
            }
        } catch (e) {
            // saving error
            console.log(e);
        }
    }

    async setTokenExpiration(expiration) {
        await KeyValueStorage.set(AUTH_TOKEN_EXPIRATION_KEY, expiration + "");
    }

    async setSessionDetails(sessionDetails) {
        await KeyValueStorage.set("currentSession", JSON.stringify(sessionDetails));
    }

    async deleteTempSession(){
        await KeyValueStorage.remove("currentSession");
    }

    async hasActiveTelesession() {
        try {
            return await KeyValueStorage.get("currentSession");
        } catch (e) {
            // error reading value
            return null;
        }
    }

    async setIncomingSessionNotification(notificationData) {
        await KeyValueStorage.set("incomingSession", JSON.stringify(notificationData));
    }

    async deleteIncomingSessionNotification(){
        await KeyValueStorage.remove("incomingSession");
    }

    async hasIncomingNotification() {
        try {
            return await KeyValueStorage.get("incomingSession");
        } catch (e) {
            // error reading value
            return null;
        }
    }
    async deleteAuthToken() {
        try {
            await KeyValueStorage.remove(AUTH_TOKEN_KEY);
            await KeyValueStorage.remove(AUTH_TOKEN_EXPIRATION_KEY);
        } catch (e) {
            // removing error
            console.log('Cant clear auth token');
            return false;
        }
        return true;
    }

    isAuthenticationEndpoint(endpoint: string) {
        return endpoint === ApiEndpoints.MAGIC_LOGIN;
    }
}

const authStore = new AuthStore();
export default authStore;
