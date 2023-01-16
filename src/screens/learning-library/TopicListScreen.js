import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {TopicListComponent} from "../../components/learning-library/TopicList.component";
import {connectEducationalContent} from "../../redux";
import Analytics from '@segment/analytics-react-native';
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";

class TopicListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.forAssignment = navigation.getParam('forAssignment', null);
        this.connection = navigation.getParam('connection', null);
        this.category = navigation.getParam('category', null);
        this.getMetaForSingleArticle = navigation.getParam('getMetaForSingleArticle', null);
        this.state = {
            isLoading: true,
            searchQuery: '',
            topicItems: [],
            educationOrder:[]
        };
    }

    componentDidUpdate(prevProps,prevState,ss) {
        this.forAssignment = this.props.navigation.getParam('forAssignment', null);
        this.connection = this.props.navigation.getParam('connection', null);
    }

    componentWillUnmount() {
        if (this.screenBlurListener) {
            this.screenBlurListener.remove();
            this.screenBlurListener = null;
        }
    }

    async componentDidMount(): void {

        this.screenBlurListener = this.props.navigation.addListener(
            'willBlur',
            payload => {
                if(this.componentRef) {
                    this.componentRef.willBlur();
                }
            }
        );

        let topicItems = [];
        const entries = this.category.categoryTopics;
        if (entries) {
            topicItems = entries.filter(entry=> entry.fields).map(entry => {
                return {
                    topic: entry.fields.name,
                    topicDescription: entry.fields.description,
                    topicIcon: entry.fields.icon ? entry.fields.icon : '',
                    topicImage: entry.fields.coverImage ? entry.fields.coverImage : '',
                    educationOrder: entry.fields.educationOrder ? entry.fields.educationOrder : [],
                    totalArticles: entry.fields.educationOrder?entry.fields.educationOrder.filter(entry=> entry.fields).length:0,
                    topicSlug: entry.fields.slug,
                };
            });
        }

        Analytics.track(SEGMENT_EVENT.SECTION_OPENED, {
            userId: this.props.auth.meta.userId,
            sectionName: this.category.categoryName,
            openedAt:moment.utc(Date.now()).format()
        });

        this.setState({topicItems, isLoading: false});

    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    onTopicSelected = item => {
        if(this.forAssignment) {
            this.props.navigation.navigate(Screens.ASSIGNABLE_CONTENT_LIST, {
                topicName: item.topic,
                educationOrder:item.educationOrder,
            });
        } else {
            this.props.navigation.navigate(Screens.TOPIC_CONTENT_LIST_SCREEN, {
                topicName: item.topic,
                topicDescription: item.topicDescription,
                topicImage: item.topicImage,
                topicIcon: item.topicIcon,
                educationOrder:item.educationOrder,
                category: this.category,
                topicSlug: item.topicSlug,
                getMetaForSingleArticle: this.getMetaForSingleArticle
            });
        }
    };

    navigateToNext = (contentSlug)=>{
        let educationOrder = this.state.educationOrder;
        const educationMeta = this.getMetaForSingleArticle(contentSlug);
        const topic = (educationMeta && educationMeta.topic) || {
            name: '',
        };
        const category = (educationMeta && educationMeta.category) || {
            categoryName: ''
        };
        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug,
            educationOrder,
            topic, category
        });
    }

    openSelectedEducation = (item,contentSlug) => {
        this.setState({isLoading:true});
        let educationOrder = [];
        if(this.state.topicItems) {
            if(this.state.topicItems && this.state.topicItems.length>0) {
                this.state.topicItems.filter((topicItem) => {
                    if (topicItem.educationOrder && topicItem.educationOrder.length > 0) {
                        topicItem.educationOrder.filter((educationOrderItem) => {
                            if (educationOrderItem.sys.id === contentSlug) {
                                educationOrder = topicItem.educationOrder;
                            }
                        });
                    }
                });
            }
        }

        this.setState({educationOrder:educationOrder,isLoading:false} , ()=>{
            this.navigateToNext(contentSlug);
        })
    };

    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const filteredItems = this.state.topicItems.filter(item => {
            return (
                this.state.searchQuery.trim() === '' ||
                item.title
                    .toLowerCase()
                    .indexOf(this.state.searchQuery.trim().toLowerCase()) > -1
            );
        });

        return (
            <TopicListComponent
                ref={(ref)=>{
                    this.componentRef = ref;
                }}
                filteredItems={filteredItems}
                backClicked={this.backClicked}
                readArticles={this.props.profile.markAsCompleted}
                isLoading={this.state.isLoading}
                showReadInfo={true}
                onTopicSelected={this.onTopicSelected}
                openSelectedEducation={this.openSelectedEducation}
                bookmarked={this.props.profile.bookmarked}
                category={this.category}
                categoryName={this.category.categoryName}
            />
        )
    };
}

export default connectEducationalContent()(TopicListScreen);
