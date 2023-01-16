import {all, call, fork, put, take, select} from 'redux-saga/effects';

import {
    FETCH_CARDS_LIST,
    CARDS_LIST_FETCHED,
    CARDS_LIST_FETCH_FAILED,
    DELETE_CARD,
    DELETE_CARD_FAILED,
    DELETE_CARD_SUCCESS,
    FETCH_WALLET,
    WALLET_FETCH_FAILED,
    WALLET_FETCH_SUCCESSFUL, WALLET_TOPUP_REQUESTED, WALLET_TOPUP_FAILED, WALLET_TOPUP_SUCCESSFULL, FETCH_WALLET_SILENT,
} from './actions';

import BillingService from '../../../services/Billing.service';
import {AlertUtil} from 'ch-mobile-shared';


function* fetchCardsList() {
    while (true) {

        yield take(FETCH_CARDS_LIST);
        try {
            console.log('Gonna fetch stripe credit cards list');
            const cardsData = yield call(BillingService.getCardsList);
            console.log('Got Response for cards list');
            if (cardsData.errors) {
                console.warn(cardsData.errors[0].endUserMessage);
                yield put({
                    type: CARDS_LIST_FETCH_FAILED,
                    errorMsg: cardsData.errors[0].endUserMessage,
                });
            } else {
                yield put({
                    type: CARDS_LIST_FETCHED,
                    payload: cardsData,
                });
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Request failed. Please check your internet connection');
            yield put({
                type: CARDS_LIST_FETCH_FAILED,
                errorMsg: 'Request failed with something unknown',
            });
        }

    }
}


function* deleteCard() {
    while (true) {
        let {payload} = yield take(DELETE_CARD);
        const response = yield call(BillingService.deleteCard, payload.payload);
        if (response.errors) {
            console.warn(response.errors[0].endUserMessage);
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            yield put({
                type: DELETE_CARD_FAILED,
                errorMsg: response.message,
            });
        } else {
            AlertUtil.showSuccessMessage(  "Card deleted successfully");
            yield put({
                type: DELETE_CARD_SUCCESS,
                payload: {
                    cardId: payload.payload,
                },
            });
        }
    }
}


function* fetchWallet() {
    while (true) {
        yield take([FETCH_WALLET, FETCH_WALLET_SILENT]);
        const walletDetails = yield call(BillingService.fetchWallet);
        if (walletDetails.errors) {
            AlertUtil.showErrorMessage(walletDetails.errors[0].endUserMessage);
            yield put({
                type: WALLET_FETCH_FAILED,
            });
        } else {
            yield put({
                type: WALLET_FETCH_SUCCESSFUL,
                payload: walletDetails,
            });
        }
    }
}

function* walletTopup() {
    while (true) {
        let {payload} = yield take(WALLET_TOPUP_REQUESTED);
        const topupResponse = yield call(BillingService.topupWallet, payload.request);
        if(topupResponse.errors) {
            AlertUtil.showErrorMessage(topupResponse.errors[0].endUserMessage);
            yield put({
                type: WALLET_TOPUP_FAILED,
            });
        } else {
            yield put({
                type: FETCH_WALLET
            });
            AlertUtil.showSuccessMessage("$"+payload.request.amount + " added to wallet successfully");
            yield put({
                type: WALLET_TOPUP_SUCCESSFULL
            });
            if(payload.callback) {
                payload.callback(topupResponse);
            }

        }
    }
}
export default function* paymentSaga() {
    yield all([
        fork(fetchCardsList),
        fork(deleteCard),
        fork(fetchWallet),
        fork(walletTopup),

    ]);
}
