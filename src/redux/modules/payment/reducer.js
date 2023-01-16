import {
    FETCH_CARDS_LIST,
    CARDS_LIST_FETCH_FAILED,
    CARDS_LIST_FETCHED,
    DELETE_CARD,
    DELETE_CARD_SUCCESS,
    DELETE_CARD_FAILED,
    FETCH_WALLET,
    WALLET_FETCH_SUCCESSFUL,
    WALLET_FETCH_FAILED,
    WALLET_TOPUP_REQUESTED,
    WALLET_TOPUP_FAILED,
} from './actions';

export const DEFAULT = {
    isLoading: false,
    cardsList: [],
    error: null,
    errorMsg: null,
    successMsg: null,
    wallet: {
        balance: 0.0,
        transactionHistory: [],
        isLoading: false
    }
};

export default function paymentReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case FETCH_CARDS_LIST: {
            return {
                ...state,
                isLoading: true
            };
        }
        case CARDS_LIST_FETCHED : {
            return {
                ...state,
                isLoading: false,
                cardsList: payload
            }
        }
        case FETCH_WALLET: {
            return {
                ...state,
                wallet: {
                    balance: state.wallet.balance,
                    transactionHistory: state.wallet.transactionHistory,
                    isLoading: true
                }
            }
        }
        case WALLET_FETCH_SUCCESSFUL: {
            return {
                ...state,
                wallet: {
                    balance: payload.balance,
                    transactionHistory: payload.transactionHistory,
                    isLoading: false
                }
            }
        }
        case WALLET_TOPUP_REQUESTED: {
            return {
                ...state,
                wallet: {
                    ...state.wallet,
                    isLoading: true
                }
            }
        }
        case WALLET_TOPUP_FAILED: {
            return {
                ...state,
                wallet: {
                    ...state.wallet,
                    isLoading: false
                }
            }
        }
        case WALLET_FETCH_FAILED: {
            return {
                ...state,
                wallet: {
                    balance: state.wallet.balance,
                    transactionHistory: state.wallet.transactionHistory,
                    isLoading: false
                }
            }
        }

        case CARDS_LIST_FETCH_FAILED : {
            return {
                ...state,
                isLoading: false,
                cardsList: [],
                errorMsg : action.errorMsg
            }
        }

        case DELETE_CARD : {
            return {
                ...state,
                isLoading: true
            }
        }

        case DELETE_CARD_SUCCESS: {
            const {cardId} = payload;

            let {cardsList} = state;
            cardsList = cardsList.filter(card=> card.cardId !== cardId);
            return {
                ...state,
                isLoading: false,
                cardsList
            }
        }

        case DELETE_CARD_FAILED : {
            return {
                ...state,
                isLoading: false,
                errorMsg : action.errorMsg
            }
        }

        default: {
            return state;
        }
    }
}
