import {HttpClient} from 'ch-mobile-shared';
import {ApiEndpoints} from '../constants/ApiEndpoints';
import {STRIPE_PUBLISHABLE_KEY} from '../constants/CommonConstants';

export default class BillingService {


    /**
     * The method sends HTTP requests to the Stripe API.
     * It's necessary to manually send the payment data
     * to Stripe because using Stripe Elements in React Native apps
     * isn't possible.
     *
     * @param creditCardData the credit card data
     * @return Promise with the Stripe data
     */
    static async getStripeToken(creditCardData) {
        const card = {
            'card[number]': creditCardData.values.number.replace(/ /g, ''),
            'card[exp_month]': creditCardData.values.expiry.split('/')[0],
            'card[exp_year]': creditCardData.values.expiry.split('/')[1],
            'card[cvc]': creditCardData.values.cvc,
            'card[name]': creditCardData.values.name,
        };

        return fetch('https://api.stripe.com/v1/tokens', {
            headers: {
                // Use the correct MIME type for your server
                Accept: 'application/json',
                // Use the correct Content Type to send data in request body
                'Content-Type': 'application/x-www-form-urlencoded',
                // Use the Stripe publishable key as Bearer
                Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`
            },
            // Use a proper HTTP method
            method: 'post',
            // Format the credit card data to a string of key-value pairs
            // divided by &
            body: Object.keys(card)
                .map(key => key + '=' + card[key])
                .join('&')
        }).then(response => response.json());
    };

    static async chargeForAppointment(appointmentId, cardTokenId) {
        return HttpClient.getInstance().request(ApiEndpoints.CHARGE_FOR_APPOINTMENT, null, null, null, {
            appointmentId,
            cardTokenId
        });
    }

    static async getCardsList() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_CARDS_LIST, null, null, null, null)
    }

    static async addCard(cardTokenId) {
        return HttpClient.getInstance().request(ApiEndpoints.ADD_CARD, null, null, null, {cardTokenId});
    }

    static async deleteCard(cardTokenId) {
        return HttpClient.getInstance().request(ApiEndpoints.DELETE_CARD, {cardIdToDelete: cardTokenId}, null, null, null);
    }

    static async payAppointmentWithCard(appointmentId, cardTokenId) {
        return HttpClient.getInstance().request(ApiEndpoints.APPOINTMENT_CHARGES, null, null, null, {
            'appointmentId': appointmentId,
            'cardTokenId': cardTokenId
        });
    }

    static async fetchWallet() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_WALLET);
    }

    static async getPaymentHistory(selectedTransactionCategory, fromDay, toDay, currentPage) {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_PAYMENT_HISTORY,
            null,
            selectedTransactionCategory === "" && fromDay === "" && toDay === "" ?
                {
                    category: selectedTransactionCategory,
                    pageNumber: currentPage,
                }
                : selectedTransactionCategory !== "" && selectedTransactionCategory !== null ?
                    {
                        category: selectedTransactionCategory,
                        pageNumber: currentPage,
                    }
                    :
                    {
                        from: fromDay,
                        to: toDay,
                        pageNumber: currentPage,
                    },
            null,
            null);
    }


    static async topupWallet(topupRequest) {
        return HttpClient.getInstance().request(ApiEndpoints.TOPUP_WALLET, null, null, null, topupRequest);
    }

    static async payFromWallet(appointmentId) {
        return HttpClient.getInstance().request(ApiEndpoints.PAY_FROM_WALLET, null, null, null, {'appointmentId': appointmentId});
    }

    static async deductGenericWalletPayment(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.PAY_GENERIC_FROM_WALLET, null, null, null, payload);
    }

    static async deductGenericCardPayment(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.PAY_GENERIC_VIA_CARD, null, null, null, payload);
    }

    static async subscribeForApp(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.APP_SUBSCRIPTION_PAYMENT, null, null, null, payload);
    }

    static async getSubscriptionStatus() {
        return HttpClient.getInstance().request(ApiEndpoints.APP_SUBSCRIPTION_STATUS);
    }

    static async getSubscription() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_SUBSCRIPTION);
    }

    static async cancelSubscription() {
        return HttpClient.getInstance().request(ApiEndpoints.CANCEL_SUBSCRIPTION);
    }

    static async payForAppointmentByCard(appointmentId, payload) {
        return HttpClient.getInstance().request(ApiEndpoints.PAY_FOR_APPOINTMENT_BY_CARD, {appointmentId}, null, null, payload);
    }

    static async updateSubscriptionStatus() {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_SUBSCRIPTION_STATUS);
    }

    static async getInsuranceList() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_INSURANCE_LIST);
    }

    static async createPatientInsuranceProfile(insuranceId) {
        return HttpClient.getInstance().request(ApiEndpoints.CREATE_PATIENT_INSURANCE_PROFILE, {insuranceId}, null, null, null);
    }

    static async getPatientInsuranceProfile() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_INSURANCE_PROFILE);
    }

    static async getSubscriptionPackages() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_SUBSCRIPTION_PACKAGE);
    }

    static async getPatientSubscriptionPackage() {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_SUBSCRIPTION_PACKAGES);
    }

    static async subscribePackage(payload) {
        return HttpClient.getInstance().request(ApiEndpoints.SUBSCRIBE_PACKAGE,null, null, null, payload);
    }

    static async updateSubscriptionPackage(status) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_PATIENT_SUBSCRIPTION_PACKAGE, {status}, null, null, null);
    }

    static async getSubscriptionsPackageHistory(orderBy, pageNumber, pageSize) {
        return HttpClient.getInstance().request(ApiEndpoints.GET_PATIENT_SUBSCRIPTIONS_PACKAGE_HISTORY, null, {orderBy, pageNumber, pageSize}, null, null);
    }

}
