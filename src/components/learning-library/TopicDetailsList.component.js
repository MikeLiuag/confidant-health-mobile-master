import React, {Component} from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import {Button, Container} from 'native-base';
import {ContentfulClient} from 'ch-mobile-shared/src/lib';
import {ContentLoader} from 'ch-mobile-shared/src/components/ContentLoader';
import {EmptyContent} from 'ch-mobile-shared/src/components/EmptyContent';
import Loader from "../Loader";
import {ProgressBar} from 'react-native-paper';
import FAIcon from 'react-native-vector-icons/Feather';
import {InlineSearch} from "../inline-search";
import {addTestID, isIphoneX, AlertUtil, defaultPageSize, Colors , TextStyles} from "ch-mobile-shared";
const width = Dimensions.get("window").width;

export class TopicDetailsListComponent extends Component<props> {
    constructor(props) {
        super(props);
        this.state = {
            topic: this.props.topic,
            contentList: [],
            skip: 0,
            hasMore: true,
            isSearching: false,
            searchQuery: '',
            isLoadingMore: false,
            isLoading: true,
            iconColor: Colors.colors.whiteColor,
            showBack: true,
        };
    }


    getReadCount = () => {
        let markAsCompleted = this.props.markAsCompleted;
        let readArticles = 0
        this.state.contentList.forEach(content => {
            markAsCompleted.forEach(markContent => {
                if (content.entryId === markContent.slug) {
                    readArticles++;
                }
            })
        })
        return readArticles;

    }

    async componentWillMount() {
        (this.props.fromRecommendedContent || this.props.fromFavouriteContent) ? await this.getContentBySlug() : await this.getContentByTopic();

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.markAsCompleted && prevProps.markAsCompleted && this.props.fromRecommendedContent) {
            const currentCount = this.getRecommendedCount();
            if (prevState.recommendedCount !== currentCount) {
                if (currentCount > 0) {
                    this.getContentBySlug();
                }
            }
        }
    }

    getRecommendedCount = () => {
        let {markAsCompleted, content} = this.props;
        markAsCompleted = markAsCompleted.map(content => content.slug);
        let count = 0;
        content.forEach(content => {
            if (!markAsCompleted.includes(content.contentSlug)) {
                count++;
            }
        });
        return count;
    }


    getContentBySlug = async () => {
        this.setState({
            recommendedCount: this.props.fromRecommendedContent ? this.getRecommendedCount() : 0
        });
        try {
            let contentList = await Promise.all(this.props.content.map(async (content) => {
                let params = {
                    'content_type': 'educationalContent',
                    'sys.id': this.props.fromRecommendedContent ? content.contentSlug : content.slug,
                };
                const entries = await ContentfulClient.getEntries(params);
                if (entries && entries.total > 0) {
                    const entry = entries.items[0];
                    return {
                        title: entry.fields?.title,
                        description: entry.fields?.description,
                        entryId: entry.sys?.id,
                        contentDuration: entry.fields?.contentLengthduration,
                        contentAudio: entry.fields?.contentAudio
                            ? entry.fields.contentAudio.fields.file.url
                            : '',
                        bookmarked: false,
                        markedAsCompleted: false,
                        fields: entry.fields,
                        sys: {
                            id: entry.sys.id
                        }
                    }
                }
            }));
            contentList = contentList.filter(content => content != null);
            this.setState({
                ...this.state,
                contentList,
                skip: this.state.skip + contentList.length,
                hasMore: contentList.length > defaultPageSize,
                isLoadingMore: false,
                isLoading: false,
            });
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to get data from contentful');
            this.setState({...this.state, isLoadingMore: false, isLoading: false});
        }
    }

    getContentByTopic = async () => {
        try {
            const contentList = [];
            if (this.props.topic.educationOrder) {
                this.props.topic.educationOrder.forEach(eduOrder => {
                    if (eduOrder.fields) {
                        contentList.push({
                            title: eduOrder.fields.title,
                            description: eduOrder.fields.description,
                            entryId: eduOrder.sys.id,
                            contentDuration: eduOrder.fields.contentLengthduration,
                            contentAudio: eduOrder.fields.contentAudio
                                ? eduOrder.fields.contentAudio.fields.file.url
                                : '',
                            bookmarked: false,
                            markedAsCompleted: false,
                        });

                    }
                })
            }

            this.setState({
                ...this.state,
                contentList: [
                    ...this.state.contentList,
                    ...contentList
                ],
                skip: this.state.skip + contentList.length,
                hasMore: contentList.length > defaultPageSize,
                isLoadingMore: false,
                isLoading: false,
            });
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to get data from contentful.');
            this.setState({...this.state, isLoadingMore: false, isLoading: false});
        }
    };

    getPercentage = (read, total) => {
        if (total === 0) {
            return 0;
        } else {
            return read * 100 / total;
        }
    };


    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const progressValue = this.getPercentage(this.getReadCount(), this.state.contentList.length) / 100;
        return (
            <Container style={styles.container}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle='light-content'
                    translucent
                />
                <View style={styles.searchWrapper}>
                    <InlineSearch
                        options={{
                            screenTitle: '',
                            searchFieldPlaceholder: 'Search Learning Library',
                            bookmarked: this.props.bookmarked ? this.props.bookmarked : [],
                            markedAsCompleted: this.props.markAsCompleted ? this.props.markAsCompleted : [],
                            searchType: 'ByTopic',
                            educationOrder: (this.props.fromRecommendedContent || this.props.fromFavouriteContent) ? this.state.contentList : this.props.topic.educationOrder,
                            backClicked: this.props.backClicked,
                            iconColor: this.state.iconColor,
                            showBack: this.state.showBack,
                            openSelectedEducation: this.props.openSelectedEducation,
                        }}
                    />
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.contentWrapper}>
                    <View noShadow transparent style={styles.topicHeader}>
                        <View style={styles.imgBG}>
                            <Image
                                style={styles.greImage}
                                resizeMode={'cover'}
                                source={
                                    (this.props.fromRecommendedContent || this.props.fromFavouriteContent) ? require('../../assets/images/recommended-bg.png')
                                        :
                                        (this.state.topic.image
                                                ? {
                                                    uri: 'https:' + this.state.topic.image.fields.file.url,
                                                }
                                                : require('../../assets/images/general-topic-bg.png')
                                        )
                                }
                            />

                            <View style={{paddingLeft: 50, paddingRight: 50, zIndex: 40}}>
                                <Text style={styles.largeText}>
                                    {this.props.fromRecommendedContent ? "Recommended for you" : (
                                        this.props.fromFavouriteContent ? "Favourites Articles " : this.state.topic.name || "")}
                                </Text>
                                <Text style={styles.subHead} numberOfLines={4}>
                                    {this.props.fromRecommendedContent ? "These recommendations have been selected for you based on your conversations with Alfie and your providers"
                                        : (this.props.fromFavouriteContent ? "Here’s a list of your favorites..." : this.state.topic.description
                                            ? this.state.topic.description.content[0].content[0].value
                                            : '')}
                                </Text>


                                    <View style={styles.barWrapper}>
                                        <ProgressBar style={styles.progressBarr}
                                                     progress={progressValue} color={Colors.colors.mainBlue}
                                                     borderRadius={5}/>

                                        <View style={{
                                            marginTop: 8,
                                            marginBottom: 40,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }}>

                                            <Text
                                                style={styles.completedText}>Completed</Text>
                                            <Text style={styles.lightText}>
                                                <Text
                                                    style={styles.boldText}>{this.getReadCount()}{' '}
                                                    of {this.state.contentList.length} </Text>
                                            </Text>
                                        </View>
                                    </View>


                            </View>
                        </View>
                    </View>
                    {this.state.isLoading ? (<ContentLoader type="chat" numItems="12"/>) :
                        this.state.contentList && this.state.contentList.length !== 0 ? (
                            <FlatList
                                data={this.state.contentList}
                                style={styles.list}
                                renderItem={({item, index}) => {
                                    let isBookmarked = false;

                                    this.props.bookmarked ?
                                        this.props.bookmarked
                                            .forEach(eachContent => {
                                                if (item.entryId === eachContent['slug']) {
                                                    isBookmarked = true;
                                                }
                                            }) : null
                                    let isCompleted = false;

                                    this.props.markAsCompleted ?
                                        this.props.markAsCompleted
                                            .forEach(eachContent => {
                                                if (item.entryId === eachContent['slug']) {
                                                    isCompleted = true;
                                                }
                                            }) : null

                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.singleItem}
                                            {...addTestID('education-content-' + (index + 1))}
                                            onPress={() => {
                                                this.props.openSelectedEducation(item, item.entryId);
                                            }}>


                                            <View style={styles.textContainer}>
                                                <Text style={styles.itemTitle}>{item.title}</Text>

                                                <View style={styles.textDurationWrapper}>
                                                    {
                                                        item.contentAudio !== '' ?
                                                            <FAIcon name="headphones" size={15}
                                                                    color="#3fb2fe"/> :
                                                            <FAIcon name="calendar" size={15}
                                                                    color="#3fb2fe"/>

                                                    }
                                                    <Text style={styles.mainText}>
                                                        {item.contentDuration}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.iconContainer}>

                                                {isCompleted ?
                                                    <Button transparent style={styles.completedIcon} onPress={() => {
                                                        this.props.openSelectedEducation(item, item.entryId);
                                                    }}>
                                                        <Image
                                                            style={styles.bottomBackgroundBlue}
                                                            source={require('../../assets/images/markCompleted.png')}
                                                        />
                                                    </Button> :
                                                    <Button transparent style={styles.nextIcon} onPress={() => {
                                                        this.props.openSelectedEducation(item, item.entryId);
                                                    }}>
                                                        <Image
                                                            style={styles.bottomBackgroundBlue}
                                                            source={require('../../assets/images/Path.png')}

                                                        />
                                                    </Button>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        ) : (
                            <View style={{padding: 10, backgroundColor: '#fff', zIndex: -1}}>
                                <EmptyContent message="No Education Material Found"/>
                            </View>
                        )}
                </ScrollView>
            </Container>
        );
    }
}


const styles = StyleSheet.create({
    progressBarr: {
        height: 10,
        borderRadius: 5,
        marginBottom: 9
    },
    container: {
        padding: 0,
        marginTop: -5
    },
    contentWrapper: {
        zIndex: 50,
        // marginTop: isIphoneX()? MARGIN_X : 0
        marginTop: -130,
        width: '100%',
        paddingRight: 0,
        paddingLeft: 0
    },
    topicHeader: {
        backgroundColor: '#fff',
    },
    gredientBG: {
        paddingTop: 100
    },
    imgBG: {
        paddingTop: 100,
        zIndex: -1
    },
    textDurationWrapper: {
        flexDirection: 'row',
    },
    searchWrapper: {
        flexDirection: 'row',
        zIndex: 100,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: isIphoneX() ? 26 : 3
    },
    backBox: {
        flex: 0.5,
    },
    fieldBox: {
        flex: 2,
    },
    searchField: {
        color: '#FFF',
    },
    cancelBox: {
        flex: 0.5,
    },
    backBtn: {
        paddingLeft: 0,
    },
    backIcon: {
        color: '#FFF',
        fontSize: 35,
    },
    cancelBtn: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Regular',
    },
    searchBtn: {
        paddingRight: 0,
    },
    searchIcon: {
        color: '#FFF',
        fontSize: 22,
        transform: [{rotateZ: '90deg'}],
    },
    greImage: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    },
    topIcon: {
        marginTop: 16,
        alignSelf: 'center',
        marginBottom: 16,
        width: 60,
        height: 60,
    },
    largeText: {
       
        textAlign: 'center',
        color: Colors.colors.white,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,
        marginBottom: 16,
        marginTop: 77
    },
    subHead: {
        fontFamily: 'Roboto-Regular',
        color: '#FFF',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 40,
    },
    titleMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        fontWeight: '500',

    },
    readStatus: {
        color: '#3CB1FD',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        fontWeight: '500',
    },
    list: {
        backgroundColor: '#FFF',
        paddingBottom: 60,
    },
    singleItem: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#f5f5f5',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        padding: 24,
    },
    iconContainer: {
        paddingRight: 10,
        alignItems: 'center',
        maxWidth: 80
    },
    readIcon: {
        width: 50,
        height: 50,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
    },
    mainText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        letterSpacing: 0.28,
        color: '#999',
        width: 'auto',
        textAlign: 'center',
        // paddingTop:0,
        paddingLeft: 10
    },
    itemTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        marginBottom: 8,
        marginTop: 8,
        paddingRight:2,
        marginRight:20
    },
    subText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 18,
        color: '#646c73',
        width: '90%',
    },
    markWrapper: {
        paddingTop: 10,
    },
    nextButton: {},
    loadersty: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    barWrapper: {
        //paddingLeft: 10,
        //paddingRight: 10,
        //paddingBottom: 40,
    },
    completedText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontStyle: 'normal',
        lineHeight: 15,
    },
    boldText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 15,
    },
    nextIcon: {
        backgroundColor: "#EBF4FC",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },
    completedIcon: {
        backgroundColor: "#EBFCE4",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }

});

