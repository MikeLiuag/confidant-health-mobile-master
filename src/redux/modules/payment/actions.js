
import { createAction } from "redux-actions";
export const FETCH_CARDS_LIST = 'payment/FETCH_CARDS_LIST';
export const CARDS_LIST_FETCHED = 'payment/CARDS_LIST_FETCHED';
export const CARDS_LIST_FETCH_FAILED = 'payment/CARDS_LIST_FETCH_FAILED';
export const DELETE_CARD = 'payment/DELETE_CARD';
export const DELETE_CARD_SUCCESS = 'payment/DELETE_CARD_SUCCESS';
export const DELETE_CARD_FAILED = 'payment/DELETE_CARD_FAILED';
export const FETCH_WALLET = 'wallet/FETCH';
export const FETCH_WALLET_SILENT = 'wallet/FETCH_SILENT';
export const WALLET_FETCH_SUCCESSFUL = 'wallet/FETCH_SUCCESSFUL';
export const WALLET_FETCH_FAILED = 'wallet/FETCH_FAILED';
export const WALLET_TOPUP_REQUESTED = 'wallet/TOPUP_REQUESTED';
export const WALLET_TOPUP_SUCCESSFULL = 'wallet/TOPUP_SUCCESSFUL';
export const WALLET_TOPUP_FAILED = 'wallet/TOPUP_FAILED';

export const paymentActionCreators = {
    fetchCardsList: createAction(FETCH_CARDS_LIST),
    deleteCard: createAction(DELETE_CARD),
    fetchWallet: createAction(FETCH_WALLET),
    topupWallet: createAction(WALLET_TOPUP_REQUESTED),
    fetchWalletSilently: createAction(FETCH_WALLET_SILENT)
};
