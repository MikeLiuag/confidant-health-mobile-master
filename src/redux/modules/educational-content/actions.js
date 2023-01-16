//@flow

import { createAction } from "redux-actions";
export const EDUCATIONAL_BOOKMARK_CONTENT = 'educational/EDUCATIONAL_BOOKMARK_CONTENT';
export const FETCH_ASSIGNED_CONTENT = 'educational/FETCH_ASSIGNED_CONTENT';
export const SELF_ASSIGN = 'educational/SELF_ASSIGN';
export const CONTENT_ASSIGNED = 'educational/CONTENT_ASSIGNED';
export const ASSIGNED_CONTENT_FETCHED = 'educational/ASSIGNED_CONTENT_FETCHED';
export const EDUCATIONAL_BOOKMARK_CONTENT_FAILED = 'educational/BOOKMARK_CONTENT_FAILED';
export const EDUCATIONAL_CONTENT_BOOKMARKED = 'educational/CONTENT_BOOKMARKED';
export const EDUCATIONAL_MARK_AS_COMPLETED_CONTENT = 'educational/EDUCATIONAL_MARK_AS_COMPLETED_CONTENT';
export const EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED = 'educational/EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED';
export const EDUCATIONAL_CONTENT_COMPLETED = 'educational/EDUCATIONAL_COMPLETED_CONTENT';

export const educationalActionCreators = {
    bookmarkContent: createAction(EDUCATIONAL_BOOKMARK_CONTENT),
    markAsCompletedContent:createAction(EDUCATIONAL_MARK_AS_COMPLETED_CONTENT),
    selfAssign: createAction(SELF_ASSIGN),

};
