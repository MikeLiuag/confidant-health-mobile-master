import {all, call, fork, put, take, select} from 'redux-saga/effects';

import {
    ASSIGNED_CONTENT_FETCHED, CONTENT_ASSIGNED,
    EDUCATIONAL_BOOKMARK_CONTENT,
    EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
    EDUCATIONAL_CONTENT_BOOKMARKED,
    EDUCATIONAL_CONTENT_COMPLETED,
    EDUCATIONAL_MARK_AS_COMPLETED_CONTENT,
    EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED, FETCH_ASSIGNED_CONTENT, SELF_ASSIGN,
} from './actions';

import ProfileService from '../../../services/Profile.service';
import {AlertUtil, ContentfulClient} from 'ch-mobile-shared';

let articles = [];
let categoryItems = [];
let totalCount = 0;
let fetchCount = 0;
function* bookmarkHandler() {
    while (true) {
        const {payload} = yield take(EDUCATIONAL_BOOKMARK_CONTENT);
        const {slug,shouldMark} = payload;
        const response = yield call(ProfileService.bookMarkEducationalContent, slug, shouldMark);

        if (response.errors) {
            yield put({
                type: EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
                errorMsg: response.errors[0].endUserMessage,
            });
        } else {
            yield put({
                type: EDUCATIONAL_CONTENT_BOOKMARKED,
                payload: {
                    markInfo: {
                        slug
                    },
                    shouldMark,

                },
            });
        }
    }

}
function* convertToCategory(entries) {
    const tempCategoryItems = entries.items.map(entry => {
        return {
            categoryName: entry.fields.name,
            categoryImage: entry.fields.displayImage ? entry.fields.displayImage.fields.file.url : "",
            categoryTopics: entry.fields.topics,
            categorySlug: entry.fields.slug,
        };
    });
    if (tempCategoryItems === null || tempCategoryItems  === undefined) {
        categoryItems=tempCategoryItems;
    } else {
        const tempItem = categoryItems.concat(tempCategoryItems)
        categoryItems=tempItem;
    }
};
function* getArticlesMap() {
    articles = [];
    try {
        let finalQuery = {
            content_type: "category",
            skip: 0,
            include: 2,
            limit: 10,
        };
        let entries = yield call(ContentfulClient.getEntries,finalQuery);
        if (entries) {
            convertToCategory(entries);
            totalCount = entries?.total;
            fetchCount = fetchCount + entries?.items?.length;
            while (fetchCount <= totalCount) {
                finalQuery.skip = finalQuery.limit;
                finalQuery.limit = finalQuery.limit + 10;
                entries = ContentfulClient.getEntries(finalQuery);
                if (entries) {
                    convertToCategory(entries);
                    totalCount = entries?.total;
                    fetchCount = fetchCount + entries?.items?.length;
                }
            }
        }
        categoryItems.forEach(category=>{
            const {categorySlug, categoryName} = category;
            category.categoryTopics.forEach(topic=>{
                if(topic.fields && topic.fields.educationOrder) {
                    const {slug: topicSlug, name} = topic.fields;
                    const topicEntryId = topic.sys.id
                    topic.fields.educationOrder.forEach(article=>{
                        if(article.fields) {
                            articles.push({
                                entryId: article.sys.id, topic: {topicSlug, name, topicEntryId}, category: {categorySlug, categoryName}
                            })
                        }

                    })
                }

            })
        });
    } catch (e) {
        articles =  null;
    }
};

function* markAsCompletedHandler() {
    while (true) {
        const {payload} = yield take(EDUCATIONAL_MARK_AS_COMPLETED_CONTENT);
        const {slug} = payload;
        let topicEntryId = null;
        const completedArticle = articles.find(article=>article.entryId===slug);
        if(completedArticle) {
            topicEntryId = completedArticle.topic.topicEntryId
        }
        const response = yield call(ProfileService.markAsCompletedEducationalContent, slug, topicEntryId);

        if (response.errors) {
            yield put({
                type: EDUCATIONAL_MARK_AS_COMPLETED_CONTENT_FAILED,
                errorMsg: response.errors[0].endUserMessage,
            });
        } else {
            yield put({
                type: EDUCATIONAL_CONTENT_COMPLETED,
                payload: {
                    markInfo: {
                        slug
                    }
                },
            });
            if(topicEntryId) {
                let query = {
                    'content_type': 'topics',
                    'sys.id': topicEntryId
                };
                const res = yield call(ContentfulClient.getEntries,query);
                if (res.items.length > 0) {
                    const topic = res.items[0];
                    const articleIds = topic.fields.educationOrder.map(articleEntry=>articleEntry.sys.id);
                    const completedArticles = yield select(state=>state.profile.markAsCompleted);
                    const completedIds = completedArticles.map(article=>article.slug);
                    const remainingArticles = articleIds.filter(entryId=>!completedIds.includes(entryId))
                    if(remainingArticles.length===0) {
                        yield call(ProfileService.topicCompleted, topicEntryId)
                    }
                }
            }
        }
        if(articles===null) {
            yield call(getArticlesMap)
        }
    }

}

function* assignedContentFetcher() {
    while (true) {
        yield take(FETCH_ASSIGNED_CONTENT);
        console.log('Gonna fetch assigned content');
        const assignedContent = yield call(ProfileService.getContentAssignedToMe);
        console.log('Got Response');
        if (assignedContent.errors) {
            console.warn(assignedContent.errors[0].endUserMessage);
        } else {
            assignedContent.assignedContent = yield call(mergeTitles,assignedContent.assignedContent);
            yield put({
                type: ASSIGNED_CONTENT_FETCHED,
                payload: assignedContent,
            });
        }
    }
}

function* mergeTitles(assignedContent) {
    console.log('Merging Titles');
    return yield all(assignedContent.map((content) => {
        return call(mergeInternal, content);
    }));
}

function* mergeInternal(content) {
    let params = {
        'content_type': 'educationalContent',
        'sys.id': content.contentSlug,
    };
    const entries = yield call(ContentfulClient.getEntries,params);
    if (entries && entries.total > 0) {
        content.title = entries.items[0].fields.title;
    }
    return content;
}

function* contentAssignHandler() {
    while (true) {
        const {payload} = yield take(SELF_ASSIGN);
        const userId = yield select(state => state.auth.meta.userId);
        const response = yield call(ProfileService.shareContentWithMember, {
            connectionId: userId,
            contentSlug: payload.entryId,
        });
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            payload.callback(false, payload.entryId);
        } else {
            AlertUtil.showSuccessMessage('Content assigned successfully');
            payload.callback(true, payload.entryId);
            yield put({
                type: CONTENT_ASSIGNED,
                payload: {
                    contentSlug: payload.entryId,
                    assigneeName: 'Self',
                    timeDifference: '1 sec',
                },
            });

        }
    }
}

export default function* educationalSaga() {
    yield all([
        fork(bookmarkHandler),
        fork(contentAssignHandler),
        fork(markAsCompletedHandler),
        fork(assignedContentFetcher)
    ]);

}
