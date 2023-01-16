//@Flow

import {
    ASSIGNED_CONTENT_FETCHED, CONTENT_ASSIGNED,
    EDUCATIONAL_BOOKMARK_CONTENT,
    EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
    EDUCATIONAL_CONTENT_BOOKMARKED,
    EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED,
} from './actions';
import {USER_LOGOUT} from "../auth/actions";

export const DEFAULT = {
    isLoading: false,
    markerError: null,
    assignedContent: []
};

export default function educationalReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case EDUCATIONAL_BOOKMARK_CONTENT: {
            return {
                ...state,
                isLoading: false
            };
        }
        case EDUCATIONAL_BOOKMARK_CONTENT_FAILED: {
            return {
                ...state,
                isLoading: false,
                markerError: action.errorMsg
            };
        }
        case EDUCATIONAL_CONTENT_BOOKMARKED: {
            return {
                ...state,
                isLoading: false
            };
        }

        case ASSIGNED_CONTENT_FETCHED: {
            return {
                ...state,
                assignedContent: payload
            }
        }

        case CONTENT_ASSIGNED: {
            const {assignedContent} = state;
            if(assignedContent.assignedContent && assignedContent.assignedContent.length>0) {
                assignedContent.assignedContent.push(payload);
                assignedContent.totalCount = parseInt(assignedContent.totalCount) + 1;
            } else {
                assignedContent.assignedContent = [payload];
                assignedContent.totalCount = 1;
            }
            return {
                ...state,
                assignedContent
            }

        }

        case EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED: {
            return {
                ...state,
                markerError: action.errorMsg
            };
        }
        case USER_LOGOUT: {
            return DEFAULT;
        }
        default: {
            return state;
        }
    }
}
