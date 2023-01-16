import React, {Component} from "react";
import {
    FlatList,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    View,
    ScrollView
} from "react-native";
import {Container, Content} from "native-base";
import {ContentLoader} from 'ch-mobile-shared/src/components/ContentLoader';
import {ProgressBar} from 'react-native-paper';
import {InlineSearch} from "../inline-search";
import {PROGRESSBAR_COLOR_ARRAY} from '../../constants/CommonConstants'
import {addTestID, Colors, CommonStyles, getHeaderHeight, isIphoneX, isIphone12, TextStyles} from "ch-mobile-shared";

const HEADER_SIZE = getHeaderHeight();

export class TopicListComponent extends Component<props> {


    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            iconColor: Colors.colors.primaryIcon,
            showBack: true,
        };

        this.searchRef = null;
    }

    willBlur = () => {
        if (this.searchRef) {
            this.searchRef.cancelSearch();
        }
    };

    getReadArticlesCount = (item) => {
        let count = 0;
        const readArticlesSlug = this.props.readArticles.map(entry => entry.slug);
        item.educationOrder.forEach(eduOrder => {
            const index = readArticlesSlug.indexOf(eduOrder.sys.id);
            if (index > -1) {
                count++;
            }
        })

        return count;
    };

    getPercentage = (read, total) => {
        if (total === 0) {
            return 0;
        } else {
            return read * 100 / total;
        }
    };

    getPercentageText = (read, total) => {
        return parseInt(this.getPercentage(read, total)) + '%';
    };

    render() {
        let width = Dimensions.get('window').width

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                    translucent
                    barStyle={'dark-content'}
                />
                <View
                    style={{
                        paddingTop: isIphone12() ? 10 : (isIphoneX()? 22 : 0 ), zIndex: 100,
                        ...CommonStyles.styles.headerShadow, paddingLeft: 0
                    }}>
                    <InlineSearch
                        ref={(ref) => {
                            this.searchRef = ref;
                        }}
                        options={{
                            screenTitle: this.props.categoryName,
                            searchFieldPlaceholder: 'Search Learning Library',
                            bookmarked: this.props.bookmarked ? this.props.bookmarked : [],
                            markedAsCompleted: this.props.readArticles ? this.props.readArticles : [],
                            searchType: 'byCategory',
                            category: this.props.category,
                            iconColor: this.state.iconColor,
                            backClicked: this.props.backClicked,
                            openSelectedEducation: this.props.openSelectedEducation,
                            showBack: this.state.showBack,
                        }}
                    />
                </View>


                <View style={{flex: 1, backgroundColor: 'transparent'}}>
                    <View>
                        <Image  style={{height: width, width: width, position: 'absolute', top: 0, left: 0}}
                               source={require('../../assets/images/signin-bg.png')}
                        />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
                        <View>
                            {this.props.isLoading ? (
                                <ContentLoader type="chat" numItems="12"/>
                            ) : (
                                this.props.filteredItems && this.props.filteredItems.length !== 0 ?
                                    <FlatList
                                        data={this.props.filteredItems}
                                        style={styles.list}
                                        renderItem={({item, index}) => {
                                            const readArticles = this.props.readArticles !== 0 ? this.getReadArticlesCount(item) : 0;
                                            const progressValue = this.getPercentage(readArticles, item.totalArticles) / 100;
                                            return (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={styles.singleItem}
                                                    {...addTestID('topic-item-' + (index + 1))}
                                                    onPress={() => {
                                                        this.props.onTopicSelected(item)
                                                    }}
                                                >
                                                    <View style={styles.gredientBox}>
                                                        <View
                                                            style={styles.greBG}

                                                        >
                                                            <Image
                                                                style={styles.greImage}
                                                                resizeMode={'cover'}
                                                                source={
                                                                    item.topicIcon && item.topicImage && item.topicImage!=='' && item.topicImage.fields ?
                                                                        {
                                                                            uri:
                                                                            'https:' +
                                                                            item.topicImage.fields.file.url
                                                                        } :
                                                                        require("../../assets/images/inHome-MAT-assess.png")
                                                                }/>
                                                        </View>
                                                    </View>
                                                    <View style={styles.textBox}>
                                                        <Text style={styles.titleText}
                                                              numberOfLines={2}>{item.topic}</Text>
                                                        {item.totalArticles !== undefined && this.props.showReadInfo && (
                                                            <View style={styles.barWrapper}>
                                                                <ProgressBar style={styles.progressBarr}
                                                                             progress={progressValue}
                                                                             color={PROGRESSBAR_COLOR_ARRAY[index % PROGRESSBAR_COLOR_ARRAY.length]}
                                                                             borderRadius={5}/>

                                                                <View style={{
                                                                    marginTop: 5,
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <Text style={styles.lightText}>
                                                                        {readArticles} of {item.totalArticles} articles
                                                                        read
                                                                    </Text>
                                                                    <Text
                                                                        style={{
                                                                            ...styles.completedText,
                                                                            color: PROGRESSBAR_COLOR_ARRAY[index % PROGRESSBAR_COLOR_ARRAY.length]
                                                                        }}>{this.getPercentageText(readArticles, item.totalArticles)}</Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                        {item.totalArticles !== undefined && !this.props.showReadInfo && (
                                                            <View style={styles.barWrapper}>
                                                                <View style={{
                                                                    marginTop: 5,
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <Text
                                                                        style={styles.completedText}>{item.totalArticles}
                                                                        total articles</Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }}
                                        keyExtractor={(item, index) => index.toString()}
                                    /> :
                                    <EmptyContent message="No Education Topics Found"/>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </Container>
        )
    };
}

const styles = StyleSheet.create({
    libraryHeader: {
        backgroundColor: "#fff",
        marginBottom: 0,
        borderBottomColor: "#DCDCDC",
        borderBottomWidth: 1,
        elevation: 0,
        height: HEADER_SIZE,
    },
    headerText: {
        color: "#30344D",
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        marginBottom: 8,
        alignSelf: 'center'
    },
    searchField: {
        fontFamily: "Titillium-Web-Light",
        color: "#B3BEC9",
        fontSize: 14,
        fontWeight: "100",
        marginTop: 16,
        marginBottom: 10,
        marginLeft: 8,
        marginRight: 8,
        paddingLeft: 15,
        borderRadius: 4,
        borderColor: "#B7D2E5",
        backgroundColor: "#FFF"
    },
    searchIcon: {
        width: 18,
        height: 18,
        marginRight: 15
    },
    titleBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 16,
        height: 59,
        alignItems: 'center'
    },
    titleMain: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.81,
        lineHeight: 21,
        paddingLeft: 10
    },
    readStatus: {
        color: '#3CB1FD',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        fontWeight: '500'
    },
    list: {
        borderColor: "#B7D2E5",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24
    },
    singleItem: {
        // flex: 1,
        // flexDirection: "row",
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#f5f5f5',
        marginBottom: 16,
        shadowColor: "#f5f5f5",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 1,
        padding: 24
    },
    gredientBox: {
        borderRadius: 5
    },
    greBG: {
        // width: 120,
        height: 172,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    greImage: {
        width: '100%',
        height: 172,
        borderRadius: 8
    },
    textBox: {
        justifyContent: 'center',
        flex: 1
    },
    titleText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeBold,
        paddingTop: 24,
        paddingBottom: 16,
    },
    barWrapper: {
        // paddingLeft: 16,
        // paddingRight: 16
    },
    completedText: {
        color: '#3fb2fe',
        fontSize: 12,
        fontFamily: 'Roboto-Bold'
    },
    boldText: {
        color: '#646c73',
        fontFamily: 'Roboto-Bold',
        fontSize: 12
    },
    lightText: {
        color: '#637888',
        fontFamily: 'Roboto-Regular',
        fontSize: 13
    },
    progressBarr: {
        // width: 50,
        height: 10,
        borderRadius: 5,
        marginBottom: 9
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "#4FACFE",
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        paddingTop: 2
    },
    avatarImage: {
        width: 25,
        height: 25,
    },
    stateGrey: {
        backgroundColor: "#EAEDF3",
        width: 14,
        height: 14,
        borderRadius: 10,
        position: "absolute",
        left: 55,
        top: 10,
        borderColor: "#fff",
        borderWidth: 1
    },
    contact: {
        // height: 60,
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 10
    },
    contactUsername: {
        fontWeight: "500",
        fontFamily: "Roboto-Regular",
        fontSize: 14,
        color: "#25345C"
    },
    subText: {
        fontFamily: "OpenSans-Regular",
        fontSize: 12,
        color: "#25345C"
    },
    statusWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: "flex-end",
        paddingTop: 10
    },
    contentStatus: {
        fontWeight: "500",
        fontFamily: "Roboto-Regular",
        fontSize: 12,
        color: "#25345C"
    },
    nextButton: {
        width: 13,
        height: 20,
        marginLeft: 35,
        paddingLeft: 0,
        paddingTop: 0,
        marginTop: 5
    },
    launchIcon: {
        width: 12,
        height: 12,
        resizeMode: "contain"
    },
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
    mainBGImage: {
        width: '100%',
        position: 'absolute',
        top: -100
    }
});

