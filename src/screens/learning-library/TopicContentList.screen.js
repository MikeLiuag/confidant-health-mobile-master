import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {TopicDetailsListComponent} from "../../components/learning-library/TopicDetailsList.component";
import {connectEducationalContent} from '../../redux';
import Analytics from '@segment/analytics-react-native';
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";

class TopicContentListScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.fromRecommendedContent = navigation.getParam('fromRecommendedContent', false),
        this.fromFavouriteContent = navigation.getParam('fromFavouriteContent', false),
        this.content = navigation.getParam('content', null),
        this.recommendedCategory = navigation.getParam('recommendedCategory', null),
        this.getMetaForSingleArticle = navigation.getParam('getMetaForSingleArticle', null),

        this.topic = {
            name: navigation.getParam('topicName', null),
            description: navigation.getParam('topicDescription', null),
            image: navigation.getParam('topicImage', null),
            icon: navigation.getParam('topicIcon', null),
            topicSlug: navigation.getParam('topicSlug', null),
            educationOrder: navigation.getParam('educationOrder', null),
        };
        this.category = navigation.getParam('category', null);

        this.state = {
            isLoading: true,
        };
    }

    componentDidMount(): void {

        Analytics.track(SEGMENT_EVENT.TOPIC_OPENED, {
            userId: this.props.auth.meta.userId,
            sectionName: this.recommendedCategory ? this.recommendedCategory?.categoryName : this.category?.categoryName,
            openedAt:moment.utc(Date.now()).format(),
            topicName: this.topic.name
        });

    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    openSelectedEducation = (item, contentSlug) => {
        if(this.fromRecommendedContent || this.fromFavouriteContent) {
            const article = this.content.find(article=> article.contentSlug === contentSlug || article.slug === contentSlug);
            this.category = {
                categorySlug: article.categorySlug,
            };
            this.topic = {
                topicSlug: article.topicSlug,
            }
        } else {
            const educationMeta = this.getMetaForSingleArticle(contentSlug);
            this.topic.name = (educationMeta && educationMeta.topic && educationMeta.topic.name) || '';
            this.category = (educationMeta && educationMeta.category) || {
                categoryName: ''
            };
        }

        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            educationOrder: (this.fromRecommendedContent || this.fromFavouriteContent) ? this.content :this.topic.educationOrder,
            fromRecommendedContent: this.fromRecommendedContent,
            fromFavouriteContent: this.fromFavouriteContent,
            category: this.category,
            topic: this.topic,
        });
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <TopicDetailsListComponent
                topic={this.topic}
                backClicked={this.backClicked}
                openSelectedEducation={this.openSelectedEducation}
                bookmarked={this.props.profile.bookmarked}
                markAsCompleted={this.props.profile.markAsCompleted}
                fromRecommendedContent={this.fromRecommendedContent}
                fromFavouriteContent={this.fromFavouriteContent}
                content = {this.content}

            />
        );
    }
}
export default connectEducationalContent()(TopicContentListScreen);
