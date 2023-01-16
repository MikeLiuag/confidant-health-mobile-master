import React, {Component} from "react";
import {FlatList, StatusBar, StyleSheet, TouchableOpacity, Image, ScrollView} from "react-native";
import {Content, Container, Text, View, Button} from 'native-base';
import Loader from "../Loader";
import {InlineSearch} from "../inline-search";
import {addTestID, isIphoneX, isIphone12, Colors, CommonStyles} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";

export class SectionListComponent extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            iconColor: Colors.colors.primaryIcon,
            showBack: false,
        };

    }

    getTotalArticlesLength = (categoryTopics) => {
        let articlesLength = 0;
        categoryTopics.forEach(categoryTopic => {
            if (categoryTopic?.fields?.educationOrder) {
                articlesLength = articlesLength + categoryTopic.fields.educationOrder.length;
            }
        });
        return articlesLength;
    }

    render(): React.ReactNode {
        if (this.props.isLoading) {
            return <Loader/>
        }
        let assignedContentCount = this.props.isMemberApp ? this.props?.assignedContent?.assignedContent?.filter(item => item.title)?.length : 0;
        let bookmarkedContentCount = this.props.isMemberApp ? this.props?.bookmarked?.length : 0;
        return (
            <Container>
                <StatusBar
                    backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                    translucent
                    barStyle={'dark-content'}
                />
                <View style={{
                    paddingTop:  isIphone12() ? 10 : (isIphoneX()? 22 : 0 ), zIndex: 100,
                    ...CommonStyles.styles.headerShadow
                    // borderBottomWidth: 0.5, borderBottomColor: '#DDD'
                }}>
                    <InlineSearch
                        ref={(ref) => {
                            this.searchRef = ref;
                        }}
                        options={{
                            screenTitle: 'Learning Library',
                            searchFieldPlaceholder: 'Search Learning Library',
                            bookmarked: this.props.bookmarked ? this.props.bookmarked : [],
                            markedAsCompleted: this.props.readArticles ? this.props.readArticles : [],
                            searchType: 'Default',
                            iconColor: this.state.iconColor,
                            backClicked: this.props.backClicked,
                            openSelectedEducation: this.props.openSelectedEducation,
                            showBack: this.state.showBack,
                        }}
                    />
                </View>
                <Content showsVerticalScrollIndicator={false} style={styles.contentBG} contentContainerStyle={{paddingBottom: 30}}>
                    <View>
                        <ScrollView showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.recAndFavMain}
                                    horizontal
                                    ref={(ref) => {
                                        this.scrollView = ref;
                                    }}>

                            {this.props.isMemberApp && this.props?.forAssignment === false && (

                                <TouchableOpacity {...addTestID('navigate-to-assigned-content')}
                                                  onPress={() => {
                                                      this.props.navigateToBlockDetail(true)
                                                  }}>
                                    <LinearGradient
                                        start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
                                        colors={['#614385', '#516395']}
                                        style={styles.recAndFav}>
                                        <LinearGradient
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 1}}
                                            colors={['#FFDE00', '#FD5900']}
                                            style={styles.recAndFavMainIcon}>
                                            <Image
                                                style={styles.sectionBG}
                                                resizeMode="cover"
                                                source={require('../../assets/images/star-vector.png')}
                                            />
                                        </LinearGradient>
                                        <Text style={styles.recAndFavText}>Recommended</Text>
                                        <Text style={styles.recAndFavTextInfo}>{assignedContentCount} articles</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            {this.props.isMemberApp && this.props?.forAssignment === false && (
                                <TouchableOpacity
                                    {...addTestID('navigate-to-favourites-content')}
                                    onPress={() => {
                                        if (bookmarkedContentCount > 0) {
                                            this.props.navigateToBlockDetail(false)
                                        }
                                    }}>
                                    <LinearGradient
                                        start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
                                        colors={['#753A88', '#CC2B5E']}
                                        style={styles.recAndFav}>
                                        <LinearGradient
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 1}}
                                            colors={['#FD3A84', '#FFA68D']}
                                            style={styles.recAndFavMainIcon}>
                                            <Image
                                                style={styles.sectionBG}
                                                resizeMode="cover"
                                                source={require('../../assets/images/heart-vector.png')}
                                            />
                                        </LinearGradient>
                                        <Text style={styles.recAndFavText}>Favorites</Text>
                                        <Text
                                            style={styles.recAndFavTextInfo}>{bookmarkedContentCount} article{bookmarkedContentCount > 1 ? 's' : ''}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={this.props.categoryItems}
                        style={styles.sectionList}
                        renderItem={({item, index}) => {
                            const articlesLength = this.getTotalArticlesLength(item.categoryTopics);
                            return (
                                <TouchableOpacity
                                    src{...addTestID('category-section-' + (index + 1))}
                                    onPress={() => {
                                        this.props.navigateToTopicList(item)
                                    }}
                                >
                                    <View style={styles.singleSection}>
                                        <View style={styles.sectionContent}>
                                            <View style={styles.textSection}>
                                                <Text style={styles.sectionTitle}>{item.categoryName}</Text>
                                                <Text
                                                    style={styles.sectionArticleInfo}>{item?.categoryTopics?.length} topics
                                                    , {articlesLength} articles</Text>
                                            </View>
                                            <Button onPress={() => {
                                                this.props.navigateToTopicList(item)
                                            }} transparent style={styles.sectionIcon}>
                                                <Image
                                                    style={styles.bottomBackgroundBlue}
                                                    source={require('../../assets/images/Path.png')}
                                                />
                                            </Button>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />
                </Content>
            </Container>
        )
    };
}

const styles = StyleSheet.create({
    contentBG: {
        backgroundColor: '#F7F9FF',
        paddingVertical: 24
    },
    sectionList: {
        paddingHorizontal: 24
    },
    singleSection: {
        marginBottom: 16,
        position: 'relative',
        height: 118,
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: Colors.colors.whiteColor,
    },
    sectionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24
    },
    sectionTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 21,
        letterSpacing: 0.7,
        color: '#111C24'
    },
    sectionArticleInfo: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.25,
        color: '#637888'
    },
    sectionIcon: {
        backgroundColor: "#EBF4FC",
        width: 56,
        height: 56,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },
    textSection: {
        flex: 1
    },
    recAndFav: {
        width: 280,
        height: 195,
        borderRadius: 12,
        backgroundColor: "red",
        marginRight: 8,
        paddingLeft: 24,

    },
    recAndFavMainIcon: {
        width: 56,
        height: 56,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 24

    },
    sectionBG: {
        width: 34,
        height: 32,
    },
    recAndFavText: {
        // fontFamily: 'Roboto-Bold',
        fontWeight: 'bold',
        fontSize: 24,
        lineHeight: 22,
        letterSpacing: 0.5,
        color: '#FFFFFF',
        paddingTop: 2
    },
    recAndFavTextInfo: {
        // fontFamily: 'Roboto-Bold',
        fontWeight: 'bold',
        fontSize: 13,
        lineHeight: 22,
        letterSpacing: 0.5,
        color: 'white'
    },
    recAndFavMain: {
        paddingBottom: 32,
        paddingHorizontal: 24
    }
});
