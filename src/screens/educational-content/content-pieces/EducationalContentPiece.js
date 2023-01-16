import React, {Component} from 'react';
import {connectEducationalContent} from '../../../redux';
import {EducationalPieceComponent} from "../../../components/learning-library/EducationalPiece.component";
import Analytics from '@segment/analytics-react-native';
import DeepLinksService from '../../../services/DeepLinksService';
import {SEGMENT_EVENT} from '../../../constants/CommonConstants';
import moment from 'moment';

class EducationalContentPiece extends Component<props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.contentSlug = navigation.getParam('contentSlug', null);
        this.category = navigation.getParam('category', null);
        this.topic = navigation.getParam('topic', null);
        this.educationOrder = navigation.getParam('educationOrder', null);
        this.fromRecommendedContent = navigation.getParam('fromRecommendedContent', false);
        this.fromFavouriteContent = navigation.getParam('fromFavouriteContent', false);
    }

    bookmarkContent = async (isBookmarked, entryId, entryTitle) => {
        const markInfo = {
            slug: entryId,
            shouldMark: !isBookmarked,
        };
        if (!isBookmarked) {
            //only send segment event if bookmark value is false
            await Analytics.track(SEGMENT_EVENT.EDUCATION_BOOKMARKED, {
                educationName: entryTitle,
                userId: this.props.auth.meta.userId,
                sectionName: this.category.categoryName,
                topicName: this.topic.name,
                bookmarkedAt: moment.utc(Date.now()).format(),
            });
        }
        this.props.bookmarkContent(markInfo);
    };

    shareEducationalContentToSocialNetworks = async (channel, content) => {
        const category = this.category;
        const topic = this.topic;
        content = {...content, category, topic};

        await Analytics.track(SEGMENT_EVENT.APP_SHARED, {
            userId: this.props.auth.meta.userId,
            screenName: 'EducationalContentPiece',
        });

        await DeepLinksService.shareEducationalContentPiece(channel, content);
    };

    sendEducationEventToSegment = data => {
        Analytics.track(SEGMENT_EVENT.EDUCATION_OPENED, {
            userId: this.props.auth.meta.userId,
            sectionName: this.category.categoryName,
            topicName: this.topic.name,
            openedAt: moment.utc(Date.now()).format(),
            educationName: data,
        });
    };

    render() {

        return (
            <EducationalPieceComponent
                entryId={this.contentSlug}
                educationOrder={this.educationOrder}
                isLoading={this.props.educational.isLoading}
                completedArticles={this.props.profile.markAsCompleted}
                bookmarkedArticles={this.props.profile.bookmarked}
                bookmarkContent={this.bookmarkContent}
                captureFeedback={this.captureFeedback}
                isProviderApp={false}
                markContentAsComplete={this.markContentAsComplete}
                fromRecommendedContent={this.fromRecommendedContent}
                fromFavouriteContent={this.fromFavouriteContent}
                shareToSocialNetworks={this.shareEducationalContentToSocialNetworks}
                navigation={this.props.navigation}
                goBack={() => {
                    this.props.navigation.goBack();
                }}
                initiateSegmentCall={this.sendEducationEventToSegment}
            />
        );
    }

    markContentAsComplete = (entryId, entryTitle) => {
        Analytics.track(SEGMENT_EVENT.EDUCATION_MARKED_AS_READ, {
            educationName: entryTitle,
            userId: this.props.auth.meta.userId,
            sectionName: this.category.categoryName,
            topicName: this.topic.name,
            markedReadAt: moment.utc(Date.now()).format(),
        })
        this.props.markAsCompletedContent({slug: entryId});
    };

    captureFeedback = (entryId, nextEntryId) => {
        // this.props.navigation.replace(Screens.EDUCATIONAL_CONTENT_PIECE, {
        //   entryId,
        //   nextEntryId : nextEntryId,
        //   ...this.props.navigation.state.params,
        //   contentSlug: nextEntryId
        // });
    };
}

export default connectEducationalContent()(EducationalContentPiece);
