import React, {Component} from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {addTestID, isIphoneX} from 'ch-mobile-shared';
import FAIcon from 'react-native-vector-icons/Feather';
import {Button} from 'native-base';
import {ContentfulClient} from 'ch-mobile-shared/src/lib';
import Loader from "./Loader";

export class LiveEducationCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            article: {},
            isLoading: true
        };
    }

    componentDidMount() {
        this.getArticleContent()
    }

    getArticleContent = async () => {
        this.setState({isLoading: true});
        let query = {
            'content_type': 'educationalContent',
            'sys.id': this.props.entryId
        };
        const res = await ContentfulClient.getEntries(query);
        let eduContent;
        if (res.items.length > 0) {
            eduContent = res.items[0];
            if (eduContent && eduContent.fields) {
                this.setState({article: eduContent, isLoading: false});
            } else {
                this.setState({error: true, isLoading: false});
            }
        } else {
            this.setState({error: true, isLoading: false});
        }
    }

    render() {

        if(this.state.isLoading){
            return <Loader/>
        }
        const {article} = this.state;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.singleItem}
                onPress={() => {
                    this.props.openArticle(this.props.entryId);
                }}>
                {
                    this.state.isLoading ? (
                        <View>
                            <ActivityIndicator size={'large'}/>
                        </View>

                    ): (
                       <>
                           <View style={styles.textContainer}>
                               {article?.fields?.title!==undefined && (<Text style={styles.itemTitle}>{article.fields.title}</Text>)}

                               <View style={styles.textDurationWrapper}>
                                   {
                                       article?.fields?.contentAudio!==undefined && article.fields.contentAudio !== '' ?
                                           <FAIcon name="headphones" size={15}
                                                   color="#3fb2fe"/> :
                                           <FAIcon name="calendar" size={15}
                                                   color="#3fb2fe"/>

                                   }
                                   {article?.fields?.contentLengthduration !==undefined && (<Text style={styles.mainText}>
                                       {article.fields.contentLengthduration}
                                   </Text>)}
                               </View>
                           </View>
                           <View style={styles.iconContainer}>

                               {this.props.isCompleted ?
                                   <Button transparent style={styles.completedIcon} onPress={() => {
                                       this.props.openSelectedEducation(item, item.entryId);
                                   }}>
                                       <Image
                                           style={styles.bottomBackgroundBlue}
                                           source={require('../assets/images/markCompleted.png')}
                                       />
                                   </Button> :
                                   <Button transparent style={styles.nextIcon} onPress={() => {
                                       this.props.openArticle(this.props.entryId);
                                   }}>
                                       <Image
                                           style={styles.bottomBackgroundBlue}
                                           source={require('../assets/images/Path.png')}

                                       />
                                   </Button>
                               }
                           </View>
                       </>
                    )
                }



            </TouchableOpacity>
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
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        color: '#FFF',
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
        backgroundColor: 'white',
        borderColor: '#f5f5f5',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        padding: 24,
        marginBottom: 10,
        justifyContent:'center'
    },
    iconContainer: {
        paddingRight: 4,
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
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.28,
        lineHeight: 14,
        marginBottom: 8,
        marginTop: 8,
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

