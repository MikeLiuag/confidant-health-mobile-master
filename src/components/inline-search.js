import React, {Component} from 'react';
import {StyleSheet, Text, View, Animated, Easing, Dimensions, ScrollView, FlatList, TouchableOpacity,
    Image, StatusBar, NativeModules, Platform, ActivityIndicator} from 'react-native';
import {Button, Icon, Input, Title} from 'native-base';
import {ContentfulClient} from 'ch-mobile-shared/src/lib';
import {ContentLoader} from 'ch-mobile-shared/src/components/ContentLoader';

import {addTestID,Colors, TextStyles, isIphoneX, AlertUtil, defaultPageSize,isCloseToBottom} from "ch-mobile-shared";
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FAIcon from "react-native-vector-icons/Feather";

const {StatusBarManager} = NativeModules;
let statusHeight = 0;

export class InlineSearch extends Component<Props> {
    constructor(props) {
        super(props);
        const screenWidth = Math.round(Dimensions.get('window').width);
        const screenHeight = Dimensions.get('window').height;

        this.state = {
            itemsList: [],
            isSearching: false,
            searchQuery: '',
            skip: 0,
            hasMore: true,
            isLoading: false,
            isLoadingMore: null,
            screenWidth: screenWidth - 50,
            screenHeight: screenHeight,
            x: new Animated.Value(0),
        };
    }

    startSearch = () => {
        Animated.spring(this.state.x, {
            toValue: -this.state.screenWidth + 16,
            speed: 40,
            bounciness: 0,
            restDisplacementThreshold: 1,
            restSpeedThreshold: 1,
            easing: Easing.linear,
        }).start();

        this.setState({
            isSearching: true,
        });
    };

    componentDidMount() {
        if (Platform.OS === 'ios') {
            StatusBarManager.getHeight((response) => {
                statusHeight = response.height
            });
        }
    }

    cancelSearch = () => {
        Animated.spring(this.state.x, {
            toValue: 0,
            speed: 40,
            bounciness: 0,
            restDisplacementThreshold: 1,
            restSpeedThreshold: 1,
            easing: Easing.linear,
        }).start();

        this.setState({
            searchQuery: '',
            isSearching: false,
            itemsList: [],
        });
    };

    slide = () => {
        Animated.spring(this.state.x, {
            toValue: -this.state.screenWidth,
            speed: 40,
            bounciness: 0,
            restDisplacementThreshold: 1,
            restSpeedThreshold: 1,
            easing: Easing.linear,
        }).start();
    };

    filterInternal = (educationItems, searchQuery)=>{
        const filtered = educationItems.filter(entry=>{
            let matched = false;
            if(entry.fields) {
                if (entry.fields.title) {
                    matched = entry.fields.title.toLowerCase().includes(searchQuery.toLowerCase());
                    if (matched) {
                        return matched;
                    }
                }
                if (entry.fields.description) {
                    matched = entry.fields.description.toLowerCase().includes(searchQuery.toLowerCase());
                    if (matched) {
                        return matched;
                    }
                }
            }
        });
        console.log(filtered);
        return filtered;
    };

    doSearch = async (searchQuery, loadMore) => {
        try {
            if (loadMore) {
                // this.setState({isLoadingMore: true});
            } else {
                this.setState({isLoading: true});
            }

            let query = {
                content_type: 'educationalContent',
                query: searchQuery,
                skip: loadMore ? this.state.skip : 0,
                limit: defaultPageSize,
            };

            const itemsList = [];
            /** If options.searchType is ByTopic then add an extra condition to the query otherwise search directly */
            if (
                this.props.options.searchType === 'ByTopic' && this.props.options.educationOrder
            ) {
                console.log(this.props.options.educationOrder)
                this.filterInternal(this.props.options.educationOrder, searchQuery)
                    .forEach(entry => {
                        itemsList.push({
                            title: entry.fields.title,
                            description: entry.fields.description,
                            slug: entry.sys.id,
                            contentDuration: entry.fields.contentLengthduration,
                            contentAudio: entry.fields.contentAudio
                                ? entry.fields.contentAudio.fields.file.url
                                : '',
                            bookmarked: false,
                            markedAsCompleted: false,
                        });
                    });
                this.updateIfBookmarked(itemsList);
                this.updateIfCompleted(itemsList);

                this.setState({
                    itemsList: loadMore
                        ? [...this.state.itemsList, ...itemsList]
                        : [...itemsList],
                    skip: loadMore
                        ? this.state.skip + itemsList.length
                        : itemsList.length,
                    hasMore: false,
                    isLoadingMore: false,
                    isLoading: false,
                });
                return;
            }

            if (
                this.props.options.searchType === 'byCategory' && this.props.options.category
            ) {
                const educationOrder = [];
                this.props.options.category.categoryTopics.forEach(topic=>{
                    if(topic.fields && topic.fields.educationOrder){
                        topic.fields.educationOrder.forEach(education=>{
                            educationOrder.push(education);
                        })
                    }
                });
                this.filterInternal(educationOrder, searchQuery)
                    .forEach(entry => {
                        itemsList.push({
                            title: entry.fields.title,
                            description: entry.fields.description,
                            slug: entry.sys.id,
                            contentDuration: entry.fields.contentLengthduration,
                            contentAudio: entry.fields.contentAudio
                                ? entry.fields.contentAudio.fields.file.url
                                : '',
                            bookmarked: false,
                            markedAsCompleted: false,
                        });
                    });
                this.updateIfBookmarked(itemsList);
                this.updateIfCompleted(itemsList);

                this.setState({
                    itemsList: loadMore
                        ? [...this.state.itemsList, ...itemsList]
                        : [...itemsList],
                    skip: loadMore
                        ? this.state.skip + itemsList.length
                        : itemsList.length,
                    hasMore: false,
                    isLoadingMore: false,
                    isLoading: false,
                });
                return;
            }

            const entries = await ContentfulClient.getEntries(query);
            console.log('Load more ? : ' + JSON.stringify(loadMore));
            console.log('Query : ' + JSON.stringify(query));
            console.log('Results : ' + entries.items.length);

            if (
                entries &&
                entries.items &&
                entries.items.length > 0 &&
                searchQuery !== ''
            ) {
                entries.items.forEach(entry => {

                    itemsList.push({
                        title: entry.fields.title,
                        description: entry.fields.description,
                        slug: entry.sys.id,
                        contentDuration: entry.fields.contentLengthduration,
                        contentAudio: entry.fields.contentAudio
                            ? entry.fields.contentAudio.fields.file.url
                            : '',
                        bookmarked: false,
                        markedAsCompleted: false,
                    });
                });

                /** Below two methods expect list of bookmarks and list of markedAsCompleted in the options */
                this.updateIfBookmarked(itemsList);
                this.updateIfCompleted(itemsList);

                this.setState({
                    itemsList: loadMore
                        ? [...this.state.itemsList, ...itemsList]
                        : [...itemsList],
                    skip: loadMore
                        ? this.state.skip + itemsList.length
                        : itemsList.length,
                    hasMore: itemsList.length < defaultPageSize ? false : true,
                    isLoadingMore: false,
                    isLoading: false,
                });
            } else {
                this.setState({
                    itemsList: loadMore ? this.state.itemsList : [],
                    hasMore: false,
                    isLoadingMore: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to access Contentful at the moment');
            this.setState({isLoadingMore: false, isLoading: false});
        }
    };

    updateIfBookmarked = contentList => {
        if (!this.props.options.bookmarked) return;

        const bookmarked = this.props.options.bookmarked;

        contentList.forEach(contentItem => {
            contentItem.bookmarked =
                bookmarked.indexOf(contentItem.slug) > -1 ? true : false;
        });
    };

    updateIfCompleted = contentList => {
        if (!this.props.options.markedAsCompleted) return;
        const completed = this.props.options.markedAsCompleted;
        contentList.forEach(contentItem => {
            contentItem.markedAsCompleted = completed.indexOf(contentItem.slug) > -1;
        });
    };

    renderItem = item => {
        let isBookmarked = false;

        this.props.options.bookmarked.forEach(eachContent => {
            if (item.slug === eachContent['slug']) {
                isBookmarked = true;
            }
        });
        let isCompleted = false;
        this.props.options.markedAsCompleted.forEach(eachContent => {
            if (item.slug === eachContent['slug']) {
                isCompleted = true;
            }
        });
        return (

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.singleItem}
                {...addTestID('education-content-' + (item.slug))}
                onPress={() => {
                    this.props.options.openSelectedEducation(item, item.slug);
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
                        <Button transparent style={styles.completedIcon}>
                            <Image
                                style={styles.bottomBackgroundBlue}
                                source={require('../assets/images/markCompleted.png')}
                            />
                        </Button> :
                        <Button transparent style={styles.nextIcon}>
                            <Image
                                style={styles.bottomBackgroundBlue}
                                source={require('../assets/images/Path.png')}
                            />
                        </Button>
                    }
                </View>
                {/*{isBookmarked ?
                                            <View style={styles.markWrapper}>
                                                <Button transparent style={styles.nextButton}>
                                                    <AwesomeIcon
                                                        name='bookmark'
                                                        size={20}
                                                        color="red"
                                                    />
                                                </Button>
                                            </View>
                                            : null}*/}
            </TouchableOpacity>


            /*<TouchableOpacity
                {...addTestID('open-selected-education')}
                activeOpacity={0.8}
                style={styles.singleItem}
                onPress={() => {
                    this.props.options.openSelectedEducation(item, item.slug);
                }}>
                <View style={styles.iconContainer}>
                    <Image
                        style={styles.readIcon}
                        resizeMode={'contain'}
                        source={
                            item.contentAudio !== ''
                                ? require('../assets/images/read-listen-icon.png')
                                : require('../assets/images/reading-icon.png')
                        }
                    />
                    {isCompleted ? (
                        <View style={styles.completedIcon}>
                            <AwesomeIcon name="check" size={12} color="#FFF"/>
                        </View>
                    ) : null}
                    <Text style={styles.timeText}>{item.contentDuration}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.subText} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
                <View style={styles.markWrapper}>
                    <Button transparent style={styles.nextButton}>
                        <AwesomeIcon
                            name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                            size={20}
                            color="red"
                        />
                    </Button>
                </View>
            </TouchableOpacity>*/
        );
    };

    render() {
        let searchResults = null;
        if (this.state.isLoadingMore) {
            searchResults = <ContentLoader type="chat" numItems="6"/>;
        } else if (
            this.state.searchQuery !== '' &&
            this.state.itemsList.length === 0
        ) {
            searchResults = (
                <Text style={styles.noResult}>No Search Results Found</Text>
            );
        } else {
            searchResults = (
                <ScrollView
                    style={styles.suggestionList}
                    onScroll={({nativeEvent}) => {
                        if (
                            isCloseToBottom(nativeEvent) &&
                            this.state.hasMore &&
                            this.state.isLoadingMore !== true
                        ) {
                            this.doSearch(this.state.searchQuery, true);
                        }
                    }}>
                    <FlatList
                        data={this.state.itemsList}
                        style={styles.list}
                        renderItem={({item}) => this.renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                    />


                    {this.state.isLoadingMore !== null && this.state.searchQuery !== '' ? (
                        <View style={styles.loadMoreView}>
                            <Text style={styles.loadMoreText}>
                                {this.state.hasMore && this.state.itemsList.length !== 0 ? 'Load More' : null}
                            </Text>
                            <ActivityIndicator
                                style={styles.loadIcon}
                                animating={this.state.isLoadingMore}
                                size="small"
                                color={'#969FA8'}
                            />
                        </View>
                    ) : null}
                </ScrollView>
            );
        }
        return (
            <View
                style={
                    this.state.isSearching
                        ? [styles.slideSearch1, {backgroundColor: '#fff'}]
                        : styles.slideSearch1
                }>
                {
                    this.state.isSearching && (
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle='dark-content'
                            translucent
                        />
                    )
                }
                <View
                    style={
                        this.state.isSearching
                            ? [styles.slideSearch, {backgroundColor: '#fff'}]
                            : styles.slideSearch
                    }>
                    <View style={styles.leftBox}>
                        {this.state.isSearching ? (
                            <Button transparent style={{width: 45}}></Button>
                        ) : (
                            this.props.options.showBack ?
                                <Button
                                    {...addTestID('back-btn')}
                                    transparent
                                    style={styles.backBtn}
                                    onPress={() => {
                                        this.props.options.backClicked();
                                    }}>
                                    <Icon
                                        {...addTestID('back-icon')}
                                        name="chevron-thin-left"
                                        type={'Entypo'}
                                        style={[
                                            styles.backIcon,
                                            {color: this.props.options.iconColor},
                                        ]}
                                    />
                                </Button> :
                                <Button transparent style={{width: 45}}></Button>
                        )}
                    </View>
                    <View style={styles.centerBox}>
                        {this.state.isSearching ? (
                            <Input
                                autoFocus={true}
                                placeholder={this.props.options.searchFieldPlaceholder}
                                value={this.state.searchQuery}
                                onChangeText={async text => {
                                    this.setState({searchQuery: text});
                                    await this.doSearch(text, false);
                                }}
                                style={styles.searchField}
                            />
                        ) : (
                            <Title style={styles.headerTitle}>
                                {this.props.options.screenTitle}
                            </Title>
                        )}
                    </View>

                    <View style={styles.rightBox}>
                        {this.state.isSearching ? (
                            <Button
                                transparent
                                style={[styles.searchBtn, {marginRight: -45}]}
                                onPress={this.cancelSearch}>
                                <Text style={styles.cancelBtn}>Cancel</Text>
                            </Button>
                        ) : null}

                        <Animated.View
                            style={[
                                {width: 45, height: 50},
                                {
                                    transform: [
                                        {
                                            translateX: this.state.x,
                                        },
                                    ],
                                },
                            ]}>
                            <Button
                                transparent
                                style={styles.searchBtn}
                                onPress={this.startSearch}>
                                <Icon
                                    type={'AntDesign'}
                                    name="search1"
                                    style={
                                        this.state.isSearching
                                            ? styles.searchIcon
                                            : [
                                                styles.searchIcon,
                                                {color: this.props.options.iconColor},
                                            ]
                                    }
                                />
                            </Button>
                        </Animated.View>
                    </View>
                </View>

                {this.state.isSearching ? (
                    <View
                        style={this.state.itemsList.length > 0 ? {...styles.searchResults, height: this.state.screenHeight, backgroundColor: 'rgba(0,0,0,0.3)'} : styles.searchResults}>
                        {searchResults}
                    </View>
                ) : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    slideSearch1: {
        width: '100%',
        height: 'auto',
        marginTop: isIphoneX() ? -22 : -20
    },
    slideSearch: {
        marginTop: isIphoneX()? 30 : 28,
        paddingTop: isIphoneX()? statusHeight + 10 : statusHeight + 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: isIphoneX()? 70 : 68,
        width: '100%',
        paddingLeft: 16,
        paddingRight: 16
    },
    searchResults: {
        width: '100%',
        position: Platform.OS === 'ios'? 'absolute' : 'relative',
        zIndex: 101,
        top: Platform.OS === 'ios'? 100 : 0,
        backgroundColor: 'rgba(255,255,255,1)',
        marginTop: Platform.OS === 'ios'? isIphoneX()? 0 : -10 : 0
    },
    suggestionList: {
        maxHeight: 450,
        paddingBottom: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 20
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        borderBottomStartRadius: 24,
        borderBottomEndRadius: 24
    },
    leftBox: {},
    centerBox: {
        flex: 2
    },
    rightBox: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row'
    },
    wrapper: {
        backgroundColor: '#fafbfd',
    },
    backBtn: {
        paddingLeft: 6,
        paddingRight: 0
    },
    backIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30,
        marginLeft: 0
    },
    cancelBtn: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    searchBtn: {
        paddingRight: 0
    },
    searchIcon: {
        width: 25,
        marginRight: 0,
        color: Colors.colors.primaryIcon,
        fontSize: 26,
        marginTop: 8,
        // transform: [{rotateZ: '90deg'}]
    },
    headerTitle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        color: '#25345c'
    },
    searchField: {
        width: '100%',
    },
    singleItem: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#f5f5f5',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        padding: 24
    },
    iconContainer: {
        paddingRight: 10,
        alignItems: 'center'
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
        paddingLeft: 10
    },
    itemTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.28,
        lineHeight: 14,
        marginBottom: 8
    },
    timeText: {
        color: '#969fa8',
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        lineHeight: 12,
        textAlign: 'center',
        fontWeight: '600'
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
    noResult: {
        color: '#aaa',
        fontSize: 15,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        paddingBottom: 20,
    },
    loadMoreView: {
        marginBottom: 15,
        marginTop: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loadMoreText: {
        color: '#969FA8',
    },
    loadIcon: {
        marginLeft: 5,
    },
    textDurationWrapper: {
        flexDirection: 'row',
    },
    completedIcon: {
        backgroundColor: "#EBFCE4",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextIcon: {
        backgroundColor: "#EBF4FC",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },

});
