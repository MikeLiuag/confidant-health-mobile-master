import React, {Component} from 'react';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from "native-base";
import {
    Animated,
    AppState,
    Dimensions,
    Easing,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AntIcon from 'react-native-vector-icons/AntDesign';
import AntIcons from 'react-native-vector-icons/AntDesign';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import LottieView from 'lottie-react-native';
import completedAnim from "./../../assets/animations/content-completed";
import Overlay from "react-native-modal-overlay";
import LinearGradient from "react-native-linear-gradient";
import Loader from './../Loader';
import Ionicon from "react-native-vector-icons/Ionicons";
import GradientButton from "../GradientButton";
import {
    addTestID,
    Colors,
    CommonStyles,
    DEFAULT_IMAGE,
    getHeaderHeight,
    isIphone12,
    isIphoneX,
    S3_BUCKET_LINK,
    TextStyles,
    toRoman
} from 'ch-mobile-shared';
import Modal from "react-native-modalbox";

import {LearningLibraryPlayer} from 'ch-mobile-shared/src/components/common';
import {ContentfulClient} from 'ch-mobile-shared/src/lib';
import {EmptyContent} from 'ch-mobile-shared/src/components/EmptyContent';
import FeatherIcons from "react-native-vector-icons/Feather";
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import ProfileService from '../../services/Profile.service';

const HEADER_SIZE = getHeaderHeight();
let {width, height} = Dimensions.get('window');

export class EducationalPieceComponent extends Component<props> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            index: 1,
            height: -1,
            width: -1,
            items: [],
            showAnimation: false,
            isMarkCompleted: false,
            overlayVisible: false,
            fontAdjustment: true,
            socialOptions: false,
            copiedLink: false,
            clipboardContent: null,
            appState: AppState.currentState,
            fontSizeOffset: 0,
            entryId: this.props.entryId,
            activeArticleIndex: 0,
            x: new Animated.Value(isIphoneX() ? 120 : 90),
            slideAudio: false,
            FAV_AND_SHARE_OPTIONS: [
                {
                    title: 'Share article',
                    icon: "upload",
                    iconBgColor: Colors.colors.mainBlue10,
                    iconColor: Colors.colors.mainBlue,
                },
                {
                    title: 'Add to favorites',
                    icon: 'hearto',
                    iconBgColor: Colors.colors.mainPink10,
                    iconColor: Colors.colors.mainPink,
                }, {
                    title: 'Mark as complete',
                    icon: 'check',
                    iconBgColor: Colors.colors.successBG,
                    iconColor: Colors.colors.successIcon,
                },
            ]
        }

        this.mediaPlayers = [];
        this.contentPlayer = null;
        this.contentPlayerModal = null;
    }

    getActiveArticleIndex = () => {
        const entryId = this.state.entryId;
        const educationOrder = this.props.educationOrder;
        let index = this.state.activeArticleIndex;
        if (!this.props.educationOrder) {
            this.setState({activeArticleIndex: 0});
            return;
        }
        if (this.props.fromRecommendedContent) {
            index = educationOrder.findIndex((item) => item.contentSlug === entryId);

        } else if (this.props.fromFavouriteContent) {
            index = educationOrder.findIndex((item) => item.slug === entryId);

        } else {
            index = educationOrder.findIndex((item) => item.sys.id === entryId);
        }
        if (index > -1) {
            this.setState({activeArticleIndex: index});
        }
    }
    getArticle = (next) => {
        if (!this.props.educationOrder) {

            this.setState({activeArticleIndex: 0}, () => {
                this.getArticleContent();
            });
            return;
        }
        const articlesLength = this.props.educationOrder.length;
        let index = this.state.activeArticleIndex;
        let entryId = '';
        if (index > -1) {
            if (next) {
                if (index === articlesLength - 1) {
                    index = 0;
                } else {
                    index = index + 1;
                }
                const nextArticle = this.props.educationOrder[index];
                entryId = this.props.fromRecommendedContent ? nextArticle.contentSlug : nextArticle.sys.id;
            } else {

                if (index === 0) {
                    index = articlesLength - 1;
                } else {
                    index = index - 1;
                }
                const previousArticle = this.props.educationOrder[index];
                entryId = this.props.fromRecommendedContent ? previousArticle.contentSlug : previousArticle.sys.id;
            }

            if (next && !this.state.isMarkCompleted) {
                this.closeEducationalContentAnim(this.state.data.fields.title, entryId);
            }

            this.setState({entryId: entryId, activeArticleIndex: index}, () => {
                this.getArticleContent();
            });
        }

    }
    getArticleContent = async () => {
        this.setState({isLoading: true});
        let query = {
            'content_type': 'educationalContent',
            'sys.id': this.state.entryId
        };
        const res = await ContentfulClient.getEntries(query);
        let eduContent;
        if (res.items.length > 0) {
            eduContent = res.items[0];
            if (eduContent && eduContent.fields) {
                this.setState({data: eduContent});
                ProfileService.educationViewed(this.state.entryId).then(() => {
                    console.log('Education Opened event sent to backend');
                });
                this.renderContent(eduContent);
            } else {
                this.setState({error: true, isLoading: false});
            }
        } else {
            this.setState({error: true, isLoading: false});
        }
    }
    componentWillMount = async () => {
        this.getActiveArticleIndex();
        this.getArticleContent();
    };
    measureLayout = ({nativeEvent}) => {
        const height = nativeEvent.layout.height;
        const width = nativeEvent.layout.width;
        this.setState({width, height});
    };
    addMediaPlayer = (player) => {
        this.mediaPlayers.push(player);
    };
    checkMarkedEducationContent = () => {
        let isMarkCompleted = false;
        if (this.props.completedArticles) {
            this.props.completedArticles.forEach(eachContent => {
                if (this.state.entryId === eachContent['slug']) {
                    isMarkCompleted = true;
                }
            })
        }
        this.setState({isMarkCompleted});
    };

    getVideoView = (content, i, viewKey) => {
        return (
            <View key={viewKey}>
                <View style={styles.videowrapper}>
                    <Text
                        style={styles.audioTitle}>{content[i].data.target.fields.title}</Text>
                    <LearningLibraryPlayer
                        {...addTestID('video')}
                        thumbnail={require('../../assets/images/play.png')}
                        endThumbnail={require('../../assets/images/play.png')}
                        endWithThumbnail
                        video={{uri: 'https:' + content[i].data.target.fields.file.url}}
                        ref={this.addMediaPlayer}
                        disableControlsAutoHide
                        pauseOnPress
                        onPlayPress={this.pauseContentAudio}
                        onStart={this.pauseContentAudio}
                        resizeMode='contain'
                        style={styles.backgroundAudio}
                        customStyles={audioStyles}
                    />

                </View>
            </View>
        )
    };

    getOrderedList = (totalContent, section, i, nestedLevel) => {
        totalContent.content.forEach((content, order) => {
            for (let j = 0; j < content.content.length; j++) {
                if (content.content[j].nodeType === 'paragraph') {
                    section.push(this.getParagraphView(content.content, section, j, this.getNumericBullet(order + 1, nestedLevel % 3) + '. ', nestedLevel));
                }
                if (content.content[j].nodeType === 'ordered-list') {
                    section.push(this.getOrderedList(content.content[j], section, j, nestedLevel + 1));
                }
                if (content.content[j].nodeType === 'unordered-list') {
                    section.push(this.getUnOrderedList(content.content[j], section, j, nestedLevel + 1));
                }
            }
        });
    };

    getBulletCharacter = (nestedLevel) => {
        if (nestedLevel === 0) {
            return '● ';
        }
        if (nestedLevel === 1) {
            return '○ ';
        }
        if (nestedLevel === 2) {
            return '◾ ';
        }
    };

    getNumericBullet = (order, nestedLevel) => {
        if (nestedLevel === 0) {
            return order;
        }
        if (nestedLevel === 1) {
            return String.fromCharCode((order % 26) + 64);
        }
        if (nestedLevel === 2) {
            return toRoman(order);
        }
    }

    getUnOrderedList = (totalContent, section, i, nestedLevel) => {
        totalContent.content.forEach((content, order) => {
            for (let j = 0; j < content.content.length; j++) {
                if (content.content[j].nodeType === 'paragraph') {
                    section.push(this.getParagraphView(content.content, section, j, this.getBulletCharacter(nestedLevel % 3), nestedLevel));
                }
                if (content.content[j].nodeType === 'ordered-list') {
                    section.push(this.getOrderedList(content.content[j], section, j, nestedLevel + 1));
                }
                if (content.content[j].nodeType === 'unordered-list') {
                    section.push(this.getUnOrderedList(content.content[j], section, j, nestedLevel + 1));
                }
            }
        });
    };

    getParagraphView = (content, section, i, order, nestedLevel) => {
        const paragraph = [];
        const totalContent = content[i];
        totalContent.content.forEach((content) => {

            if (content.nodeType === 'hyperlink') {
                paragraph.push(
                    <Text key={i + '' + section.length + '' + paragraph.length}
                          style={{...styles.linkText, fontSize: 20 + this.state.fontSizeOffset}}
                          onPress={() => Linking.canOpenURL(content.data.uri).then(supported => {
                              if (supported) {
                                  Linking.openURL(content.data.uri);
                              } else {
                                  console.log('Don\'t know how to open URI: ' + content.data.uri);
                              }
                          })}>
                        {
                            content.content[0].value}
                    </Text>
                );
            } else if (content.marks) {
                let marksLength = content.marks.length;
                let isBold = false;
                let isItalic = false;
                if (marksLength > 0) {
                    const aggregateStyle = {
                        color: '#646c73',
                        fontSize: 20 + this.state.fontSizeOffset,
                        lineHeight: 30 + this.state.fontSizeOffset,
                        marginTop: 10,
                        fontWeight: '300',
                        fontFamily: 'Roboto-Regular',
                        marginBottom: 10,
                    };
                    for (let j = 0; j < marksLength; j++) {


                        //For Underlined Text
                        if (content.marks[j].type === 'underline') {
                            aggregateStyle['textDecorationLine'] = 'underline';
                        }
                        //For Italic Text
                        if (content.marks[j].type === 'italic') {
                            isItalic = true;
                            aggregateStyle['fontFamily'] = 'Roboto-Italic';
                            aggregateStyle['fontStyle'] = 'italic';
                        }
                        //For Bold Text
                        if (content.marks[j].type === 'bold') {
                            isBold = true;
                            aggregateStyle['fontFamily'] = 'Roboto-Bold';
                            aggregateStyle['fontWeight'] = '600';
                        }

                    }
                    if (isItalic && isBold) {
                        aggregateStyle['fontFamily'] = 'Roboto-BoldItalic';
                    }
                    paragraph.push(
                        <Text key={i + '' + section.length + '' + paragraph.length}
                              style={aggregateStyle}>{content.value}</Text>
                    );

                } else {
                    //For Simple Text
                    paragraph.push(
                        <Text key={i + '' + section.length + '' + paragraph.length}
                              style={{
                                  ...desText,
                                  fontSize: 20 + this.state.fontSizeOffset,
                                  lineHeight: 30 + this.state.fontSizeOffset
                              }}>{content.value}</Text>
                    );
                }
            } else {
                //For Simple Text
                paragraph.push(
                    <Text key={i + '' + section.length + '' + paragraph.length}
                          style={{
                              ...desText,
                              fontSize: 20 + this.state.fontSizeOffset,
                              lineHeight: 30 + this.state.fontSizeOffset
                          }}>{content.value}</Text>
                );
            }
        });
        const gap = nestedLevel ? nestedLevel * 12 : 0;
        let gapOrder = (order !== undefined && nestedLevel !== undefined) ? order + ' ' : null;
        return (<View style={{marginLeft: gap}} key={i + '' + section.length}>
            <Text style={{
                ...desText,
                fontSize: 20 + this.state.fontSizeOffset,
                lineHeight: 30 + this.state.fontSizeOffset
            }}>
                {gapOrder}{paragraph}
            </Text>
        </View>);
    };

    renderContent(data): void {
        if (this.props.initiateSegmentCall) {
            this.props.initiateSegmentCall(data.fields.title);
        }
        this.checkMarkedEducationContent();
        const {content} = data.fields.content;
        let assets = false;
        let contentType = '';
        let contentLength = content.length;
        let items = [];
        let section = [];
        for (let i = 0; i < contentLength; i++) {
            assets = false;
            if (content[i].nodeType === 'embedded-asset-block' && content[i].data.target
                && content[i].data.target.fields && content[i].data.target.fields.file) {
                assets = true;
                contentLength = contentLength - 1;
            }
            if (assets) {
                contentType = content[i].data.target.fields.file.contentType;
            }
            if (assets && !contentType.includes('image') && content[i].data.target.fields) {
                section.push(this.getVideoView(content, i, i + '' + section.length));
            }
            if (assets && contentType.includes('image')) {
                section.push(<View key={i + '' + section.length}>
                    <Image style={styles.sliderImage}
                           source={{uri: 'https:' + content[i].data.target.fields.file.url}}/>
                </View>);
            }
            if (!assets) {
                if (content[i].nodeType === 'heading-1') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading1}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'heading-2') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading2}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'heading-3') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading3}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'heading-4') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading4}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'heading-5') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading5}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'heading-6') {
                    if (content[i].content[0]) {
                        section.push(<View key={i + '' + section.length}>
                            <Text style={styles.heading6}>{content[i].content[0].value}</Text>
                        </View>);
                    }
                }
                if (content[i].nodeType === 'ordered-list') {
                    section.push(this.getOrderedList(content[i], section, i, 0));
                }
                if (content[i].nodeType === 'unordered-list') {
                    section.push(this.getUnOrderedList(content[i], section, i, 0));
                }
                if (content[i].nodeType === 'blockquote') {

                }
                if (content[i].nodeType === 'paragraph') {
                    section.push(this.getParagraphView(content, section, i));
                }
                if (content[i].nodeType === 'hr') {
                    items.push(section);
                    section = [];
                }
            }
        }
        items.push(section);
        section = [];
        if (this.state.slideAudio) {
            this.slideDown();
        }
        this.setState({items, isLoading: false});
        AppState.addEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    };

    onClose = () => {
        this.setState({overlayVisible: false});
    };

    showOverlay = (isSharing) => {
        this.setState({
            overlayVisible: true,
            socialOptions: isSharing,
            fontAdjustment: !isSharing,
            copiedLink: false
        });
    };

    writeToClipboard = async () => {
        this.setState({copiedLink: true});
        await Clipboard.setString("Provider Link will write to clipboard");
    };

    getContentAudioUri = () => {
        const {data} = this.state;
        if (data.fields.contentAudio && data.fields.contentAudio.fields && !data.fields.contentAudio.fields.file.url.includes('video')) {
            return 'https:' + data.fields.contentAudio.fields.file.url;
        } else return null;

    };

    pauseAllMedia = () => {
        this.mediaPlayers.forEach(player => {
            setTimeout(() => {
                if (player) {
                    player.pause();
                }
            }, 0)
        });
    };

    pauseContentAudio = () => {
        if (this.contentPlayer) {
            this.contentPlayer.pause();
        }
    };

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    adjustFont = (increasing) => {
        let {fontSizeOffset} = this.state;
        let fontChanged = false;
        if (increasing) {
            if (fontSizeOffset < 20) {
                fontSizeOffset++;
                fontChanged = true;
            }

        } else {
            if (fontSizeOffset > -8) {
                fontSizeOffset--;
                fontChanged = true;
            }
        }
        if (fontChanged) {
            this.setState({fontSizeOffset});
            this.renderContent(this.state.data);
        }
    };

    playerModalClose = () => {
        this.refs?.modalPlayer?.close();
    };

    shareToSocialNetworks = (channel) => {
        const content = {
            id: this.state.data.sys.id,
            slug: this.state.data.fields.slug,
            title: this.state.data.fields.title
        }

        this.props.shareToSocialNetworks(channel, content);
    };

    slideUp = () => {
        Animated.timing(this.state.x, {
            toValue: 450,
            duration: 600,
            easing: Easing.linear,
        }).start();

        this.setState({
            slideAudio: true
        })
    };
    slideDown = () => {
        Animated.timing(this.state.x, {
            toValue: isIphoneX() ? 120 : 90,
            duration: 600,
            easing: Easing.linear,
        }).start();

        this.setState({
            slideAudio: false
        });
    };

    onCloseModal = () => {
        this.refs?.modalContact?.close()
    }

    render() {
        if (this.props.isLoading || this.state.isLoading) {
            return (
                <Loader/>
            );
        } else if (this.state.error) {
            return (
                <Container>
                    <Header noShadow style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left>
                            <Button
                                {...addTestID('back')}
                                transparent
                                onPress={this.props.goBack}>
                                <EntypoIcons name="chevron-thin-left" size={30} color={Colors.colors.primaryIcon}/>
                            </Button>
                        </Left>
                        <Body/>
                        <Right/>
                    </Header>

                    <EmptyContent message="No Education Content Found"/>
                </Container>
            );
        } else {
            const {data} = this.state;
            let isBookmarked = false;
            this.props.bookmarkedArticles.forEach(eachContent => {
                if (this.state.entryId === eachContent['slug']) {
                    isBookmarked = true;
                }
            });
            return (
                <Container style={styles.container}>
                    {
                        !this.props.insideChatbot && (
                            <Header transparent noShadow={false} style={styles.header}>
                                <StatusBar
                                    backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                                    translucent
                                    barStyle={'dark-content'}
                                />
                                <Left style={styles.headLeft}>
                                    <Button
                                        {...addTestID('back-btn')}
                                        transparent style={{marginRight: 15}} onPress={this.props.goBack}>
                                        <EntypoIcons name="chevron-thin-left" size={30} color={Colors.colors.primaryIcon}/>
                                    </Button>
                                </Left>
                                <Body/>
                                <Right>
                                    <Button
                                        {...addTestID('show-more')}
                                        transparent
                                        style={{alignItems: 'flex-end'}}
                                        onPress={() => {
                                            this.refs?.modalContact?.open()
                                        }}>
                                        <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>
                                    </Button>
                                </Right>
                            </Header>
                        )
                    }

                    <Overlay
                        containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fabWrapper}
                        animationDuration={100}
                        visible={this.state.overlayVisible} onClose={this.onClose} closeOnTouchOutside>

                        <View style={{width: '100%'}}>
                            <View style={styles.actionHead}>
                                {
                                    this.state.socialOptions ?
                                        <Text style={styles.actionTitle}>Share Article</Text> :
                                        <Text style={styles.actionTitle}>Font Size</Text>
                                }
                                <Button transparent
                                        onPress={() => {
                                            this.onClose();
                                        }}
                                >
                                    <Ionicon name='md-close' size={30}
                                             color="#4FACFE"/>
                                </Button>
                            </View>
                            <View style={styles.actionBody}>
                                {
                                    this.state.socialOptions ?
                                        <View style={styles.socialBox}>
                                            {
                                                this.state.copiedLink ?
                                                    <View style={styles.linkBox}>
                                                        <AwesomeIcon name="link" size={23} color="#77c70b"/>
                                                        <Text style={styles.linkText}>Link has been copied to
                                                            clipboard</Text>
                                                    </View> :
                                                    <View style={styles.iconList}>
                                                        <Button
                                                            {...addTestID('facebook-square')}
                                                            transparent
                                                            style={[styles.socialBtn, {marginTop: 5, height: 53}]}>
                                                            <AwesomeIcon name="facebook-square" size={60}
                                                                         color="#485a96"/>
                                                        </Button>
                                                        <Button
                                                            {...addTestID('twitter-square')}
                                                            transparent
                                                            style={[styles.socialBtn, {marginTop: 5, height: 53}]}>
                                                            <AwesomeIcon name="twitter-square" size={60}
                                                                         color="#50abf1"/>
                                                        </Button>
                                                        <Button
                                                            {...addTestID('social-btn')}
                                                            transparent style={styles.socialBtn}>
                                                            <LinearGradient
                                                                start={{x: 0, y: 0}}
                                                                end={{x: 1, y: 1}}
                                                                colors={["#61fd7d", "#2bb826", "#2bb826"]}
                                                                style={styles.greBtn}
                                                            >
                                                                <AwesomeIcon name="whatsapp" size={38} color="#FFF"/>
                                                            </LinearGradient>
                                                        </Button>
                                                        <Button
                                                            {...addTestID('write-to-clipboard')}
                                                            transparent style={styles.socialBtn}
                                                            onPress={this.writeToClipboard}>
                                                            <LinearGradient
                                                                start={{x: 0, y: 0}}
                                                                end={{x: 1, y: 1}}
                                                                colors={["#1ed0de", "#6078ea", "#6078ea"]}
                                                                style={styles.greBtn}
                                                            >
                                                                <AwesomeIcon name="link" size={23} color="#FFF"/>
                                                            </LinearGradient>
                                                        </Button>
                                                        {this.props.isProviderApp && (
                                                            <Button
                                                                {...addTestID('share-content-btn')}
                                                                transparent style={styles.socialBtn}
                                                                onPress={() => {
                                                                    this.props.navigateToShareContent(this.state.data)
                                                                }}>
                                                                <LinearGradient
                                                                    start={{x: 0, y: 0}}
                                                                    end={{x: 1, y: 1}}
                                                                    colors={["#e03c3c", "#e03c3c", "#d0021b"]}
                                                                    style={styles.greBtn}
                                                                >
                                                                    <AwesomeIcon name="share" size={23} color="#FFF"/>
                                                                </LinearGradient>
                                                            </Button>
                                                        )}

                                                    </View>
                                            }
                                        </View> : <View style={styles.fontBox}>

                                            <View style={styles.adjustmentIconList}>
                                                <Button transparent onPress={() => {
                                                    this.adjustFont(false);
                                                }}
                                                        style={styles.minusBtn}>
                                                    <AntIcon name="minus" size={30} color="#3fb2fe"/>
                                                </Button>
                                                <Text style={styles.fontTitle}>Change Font Size</Text>
                                                <Button transparent onPress={() => {
                                                    this.adjustFont(true);
                                                }}
                                                        style={styles.plusBtn}>
                                                    <AntIcon name="plus" size={30} color="#3fb2fe"/>
                                                </Button>
                                            </View>
                                        </View>}
                            </View>
                        </View>
                    </Overlay>
                    <Content
                        showsVerticalScrollIndicator={false}>

                        <View>
                            {
                                data.fields.titleImage &&
                                <Image
                                    style={styles.greImage}
                                    resizeMode={'cover'}
                                    source={{uri: 'https:' + data.fields.titleImage.fields.file.url,}}/>
                            }

                        </View>
                        <View style={styles.headingDurationWrapper}>
                            {data.fields.title ? <Text style={styles.titleText}>{data.fields.title}</Text> : null}
                            <Text
                                style={styles.contentDurationText}>{data.fields.contentLengthduration ? data.fields.contentLengthduration : null}
                                {' '}read time</Text>
                        </View>
                        <View style={styles.singleItem}>
                            <View style={styles.avatarContainer}>
                                <Image style={styles.avatarImage}
                                       source={{uri: data.fields.authorImage ? 'https:' + data.fields.authorImage.fields.file.url : S3_BUCKET_LINK + DEFAULT_IMAGE}}/>
                            </View>
                            <View style={styles.authorInfo}>
                                <Text
                                    style={styles.authorname}>{data.fields.authorName ? data.fields.authorName : null}</Text>
                                <Text style={styles.authorOrganization}
                                      numberOfLines={1}>{data.fields.authorOrganization ? data.fields.authorOrganization : null}</Text>
                            </View>

                        </View>

                        <View style={styles.shareFavWrapper}>
                            <Button transparent style={styles.shareFavInner} onPress={() => {
                                this.props.bookmarkContent(isBookmarked, this.state.entryId, data.fields.title);
                            }}>
                                <AntIcon style={styles.filterIcon} name={isBookmarked ? 'heart' : "hearto"} size={24}
                                         color="#DF127D"/>
                                <Text style={styles.shareFavText}>Add to favorites</Text>
                            </Button>
                            <Button transparent style={styles.shareFavInner} onPress={() => {
                                this.shareToSocialNetworks('facebook');
                            }}>
                                <AntIcon style={styles.filterIcon} name="upload" size={24} color="#DF127D"/>
                                <Text style={styles.shareFavText}>Share article</Text>
                            </Button>
                        </View>


                        {this.state.items.length > 0 ?
                            this.state.items.map((item, key) => {
                                return (
                                    <View key={key} style={styles.slide}>
                                        {item}
                                    </View>);
                            })
                            : null
                        }


                        {!this.props.isProviderApp && data.fields.branchLink && (
                            <TouchableOpacity
                                style={styles.joinCTAWrapper}
                                onPress={() => Linking.openURL(data.fields.branchLink)}
                            >
                                <Image
                                    resizeMode={'cover'}
                                    source={
                                        data.fields.branchLinkImage
                                            ? {
                                                uri: 'https:' + data.fields.branchLinkImage.fields.file.url,
                                            }
                                            : require('../../assets/images/group-CTA-default.png')
                                    }
                                    style={styles.joinCTABG}
                                />
                            </TouchableOpacity>
                        )}
                        {!this.props.isProviderApp && (
                            !this.state.isMarkCompleted ?
                                !this.props.insideChatbot && (
                                    <View
                                        {...addTestID('Mark-as-complete')}
                                        style={styles.paginationContainer}>
                                        <GradientButton
                                            testId="mark-as-complete"
                                            onPress={() => {
                                                this.closeEducationalContentAnim(data.fields.title, null)
                                            }}
                                            text="Mark As Complete"
                                        />
                                    </View>
                                )

                                :
                                <View
                                    {...addTestID('Mark-as-complete')}
                                    style={styles.paginationContainer}>
                                    <Button transparent
                                            style={styles.greenMarkBtn}>
                                        <AntIcon name="checkcircle" size={22} color="#77c70b"/>
                                        <Text style={styles.greenMarkText}>Marked As Complete</Text>

                                    </Button>
                                </View>
                        )}

                        {
                            this.props.educationOrder && this.props.educationOrder.length > 1 && (
                                <View style={styles.nextPreWrap}>
                                    <TouchableOpacity
                                        {...addTestID('previous-article')}
                                        style={styles.nextPreBox} onPress={() => this.getArticle(false)}>
                                        <AntIcon
                                            style={styles.nextPreIco}
                                            name="stepbackward" size={28} color="#3fb2fe"/>
                                        <Text style={styles.nextPreText}>Previous Article</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        {...addTestID('next-article')}
                                        style={styles.nextPreBox} onPress={() => this.getArticle(true)}>
                                        <AntIcon
                                            style={styles.nextPreIco}
                                            name="stepforward" size={28} color="#3fb2fe"/>
                                        <Text style={styles.nextPreText}>Next Article</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }


                    </Content>
                    {
                        this.getContentAudioUri() && (
                            <Animated.View
                                style={{
                                    // backgroundColor: 'transparent',
                                    ...CommonStyles.styles.stickyShadow,
                                    borderWidth: 0.5,
                                    marginTop: -10,
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    // overflow: 'hidden',
                                    height: this.state.x
                                }}>

                                <LinearGradient
                                    start={{x: 0, y: 0}}
                                    end={{x: 0, y: 1}}
                                    colors={this.state.slideAudio ? ['#6078ea', '#34b6fe', '#1ed0de'] : ['#fff', '#fff', '#fff']}
                                    style={this.state.slideAudio ? styles.audioGradientBox : {padding: 0}}
                                >
                                    {
                                        this.state.slideAudio && (
                                            <View>
                                                <View style={styles.arrowWrap}>
                                                    <Button
                                                        transparent
                                                        onPress={() => {
                                                            this.slideDown();
                                                        }}
                                                    >
                                                        <AwesomeIcon
                                                            style={styles.arrowIcon}
                                                            name="angle-down" size={35} color="#FFF"/>
                                                    </Button>
                                                </View>
                                                <View style={styles.palyerText}>
                                                    <Text style={styles.playerMainText}
                                                          numberOfLines={3}>{data.fields.title}</Text>
                                                    <Text
                                                        style={styles.playerSubText}>{this.state.activeArticleIndex + 1}
                                                        of {(this.props.educationOrder && this.props.educationOrder.length > 0) ? this.props.educationOrder.length : 1}</Text>
                                                </View>
                                            </View>
                                        )
                                    }

                                    <View style={this.state.slideAudio ? styles.largePlayer : styles.stickyPlayer}>
                                        <View style={this.state.slideAudio ? null : styles.vWrapper}>
                                            <LearningLibraryPlayer
                                                video={{uri: this.getContentAudioUri()}}
                                                //video={{uri: "http://www.hochmuth.com/mp3/Haydn_Cello_Concerto_D-1.mp3"}} //static audio link
                                                disableControlsAutoHide
                                                onPlayPress={this.pauseAllMedia}
                                                onStart={this.pauseAllMedia}
                                                ref={(player) => {
                                                    this.contentPlayerModal = player;
                                                }}
                                                pauseOnPress
                                                disableFullscreen={true}
                                                resizeMode='contain'
                                                style={this.state.slideAudio ? styles.fullPlayer : styles.skPlayer}
                                                customStyles={this.state.slideAudio ? fullGraPlayer : gradientPlayer}
                                                isFullPlayer={this.state.slideAudio}
                                                isGradientP={!this.state.slideAudio}
                                                getArticle={this.getArticle}
                                            />
                                        </View>

                                        {/* {
                                            !this.state.slideAudio && (
                                                <View style={styles.vButton}>
                                                    <Button
                                                        transparent
                                                        onPress={() => {
                                                            this.slideUp();
                                                        }}
                                                    >
                                                        <AwesomeIcon
                                                            name="angle-up" size={35} color="#3fb2fe"/>
                                                    </Button>
                                                </View>
                                            )
                                        } */}
                                    </View>

                                </LinearGradient>

                            </Animated.View>
                        )
                    }

                    {this.state.showAnimation ?
                        <View style={styles.animWrapper}>
                            <LottieView
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                style={styles.mainImage}
                                source={completedAnim} autoPlay/>
                        </View> : null
                    }

                    <Modal
                        backdropPressToClose={true}
                        backdropColor={Colors.colors.overlayBg}
                        backdropOpacity={1}
                        onClosed={this.helpDrawerClose}
                        style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '40%'}}
                        entry={"bottom"}
                        position={"bottom"} ref={"modalContact"} swipeArea={100}>
                        <View style={{...CommonStyles.styles.commonSwipeBar}}
                              {...addTestID('swipeBar')}
                        />
                        <View style={styles.modalInnerMain}>
                            <ScrollView
                                scrollIndicatorInsets={{right: 1}}
                                style={styles.wrapper}>
                                <View style={styles.checkBoxSectionMain}>
                                    <View style={{marginBottom: 8}}>
                                        <TransactionSingleActionItem
                                            title={'Share article'}
                                            iconBackground={Colors.colors.mainBlue10}
                                            styles={styles.gButton}
                                            onPress={() => {
                                                this.onCloseModal();
                                                this.shareToSocialNetworks('facebook')
                                            }}
                                            renderIcon={(size, color) =>
                                                <AntIcons size={22} color={Colors.colors.mainBlue} name="upload"/>
                                            }
                                        />
                                    </View>

                                    <View style={{marginBottom: 8}}>
                                        <TransactionSingleActionItem
                                            title={'Add to favorites'}
                                            iconBackground={Colors.colors.mainPink10}
                                            styles={styles.gButton}
                                            onPress={() => {
                                                this.props.bookmarkContent(isBookmarked, this.state.entryId, this.state.data.fields.title)
                                            }}
                                            renderIcon={(size, color) =>
                                                <AntIcons size={22} color={Colors.colors.mainPink}
                                                          name={isBookmarked ? "heart" : "hearto"}/>
                                            }
                                        />
                                    </View>

                                    {!this.state.isMarkCompleted && (
                                        <View style={{marginBottom: 8}}>
                                            <TransactionSingleActionItem
                                                title={'Mark as complete'}
                                                iconBackground={Colors.colors.successBG}
                                                styles={styles.gButton}
                                                onPress={() => {
                                                    this.onCloseModal();
                                                    this.closeEducationalContentAnim(data.fields.title, null)
                                                }}
                                                renderIcon={(size, color) =>
                                                    <AntIcons size={22} color={Colors.colors.successIcon} name="check"/>
                                                }
                                            />
                                        </View>
                                    )}
                                </View>

                            </ScrollView>
                        </View>
                    </Modal>
                </Container>

            );
        }
    }

    closeEducationalContentAnim = async (entryTitle, nextEntryId) => {
        this.setState({showAnimation: true});
        this.props.markContentAsComplete(this.state.entryId, entryTitle);
        setTimeout(() => {
            this.props.captureFeedback(this.state.entryId, nextEntryId);
            this.checkMarkedEducationContent();
            this.setState({showAnimation: false});

        }, 2000);
    };
}

const commonText = {
    fontFamily: 'Roboto-Regular',
    color: '#30344D',
};
const desText = {
    fontFamily: 'Roboto-Regular',
    color: '#646c73',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: 10,
    marginBottom: 10,
};
const styles = StyleSheet.create({
    singleCard: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 65,
        padding: 17
    },
    iconWrapper: {},
    modalInnerMain: {
        // padding: 24,
    },
    joinCTAWrapper: {
        padding: 24,
        paddingTop: 0,
        height: 465,
        alignItems: 'center',
        position: 'relative',
        // marginBottom: 50,
        marginTop: -100
    },
    joinCTABG: {
        position: 'absolute',
        width: '100%',
        height: 465
    },
    joinContent: {
        marginTop: 220,
        padding: 24
    },
    joinMainText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 30,
        letterSpacing: 0.5,
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        opacity: 0.9,
        marginBottom: 24
    },
    joinSubText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 18,
        letterSpacing: 0.5,
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 24,
        opacity: 0.6
    },
    joinCTABtn: {
        height: 48,
        borderRadius: 4,
        overflow: 'hidden'
    },
    CTABtnInner: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    joinCTABtnText: {
        color: '#1B6697',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 0.7
    },
    nextPreWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 24,
        paddingLeft: 24,
        marginBottom: 40
    },
    nextPreBox: {
        backgroundColor: '#fafbff',
        padding: 24,
        alignItems: 'center',
        width: 155
    },
    nextPreIco: {
        marginBottom: 21
    },
    nextPreText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 14,
        letterSpacing: 0.47,
        textAlign: 'center'
    },
    modal: {
        // justifyContent: 'center',
        //alignItems: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingLeft: 0,
        paddingRight: 0,
        height: 500,
        overflow: 'hidden'
    },
    audioGradientBox: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        padding: 40,
        flex: 1,
        backgroundColor: 'transparent'
    },
    arrowWrap: {
        alignSelf: 'center',
        marginBottom: 20
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 25,
        marginBottom: 15,
        justifyContent: 'center',
        width: 80,
        marginTop: 0
    },
    arrowIcon: {
        opacity: 0.5,
        marginTop: -10
    },
    palyerText: {
        marginBottom: 20
    },
    playerMainText: {
        color: '#FFF',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        // paddingLeft: 10,
        // paddingRight: 10,
        textAlign: 'center',
        marginBottom: 24
    },
    playerSubText: {
        color: '#FFF',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.5,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        opacity: 0.75,
        marginBottom: 40
    },
    largePlayer: {
        // borderTopLeftRadius: 16, borderTopRightRadius: 16,
        // overflow: 'hidden',
        // backgroundColor: 'transparent'
    },
    actionHead: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: HEADER_SIZE + (isIphoneX() ? (isIphone12() ? 0 : 24) : 0),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingLeft: 20,
        paddingRight: 24,
        paddingBottom: 5
    },
    actionTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        letterSpacing: 0.3,
        flex: 2,
        paddingBottom: 10,
        textAlign: 'center'
    },
    actionBody: {
        padding: 24
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
        zIndex: -1
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        alignSelf: 'center',
        position: 'absolute',
        // top: Platform.OS === 'ios'? isIphoneX()? 112 : 80 : 55,
        top: 0,
        left: 0,
        right: 0,
        borderColor: 'rgba(37,52,92,0.1)',
        borderTopWidth: 0.5,
        elevation: 1,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 0.5,
        shadowColor: 'rgba(37,52,92,0.1)',
        zIndex: 0
    },
    singleItem: {
        flex: 1,
        flexDirection: 'row',
        borderBottomColor: '#EEE',
        borderBottomWidth: 0.5,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 24
    },
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden'
    },
    authorInfo: {
        flex: 1,
        backgroundColor: '#fff',
        paddingLeft: 16,
        justifyContent: 'center'
    },
    authorname: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 14,
        color: '#25345c',
        letterSpacing: 0,
        marginBottom: 4
    },
    authorOrganization: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.3,
        color: '#969fa8',
    },
    contentDurationText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 12,
        color: '#969fa8',
        letterSpacing: 0.75,
        lineHeight: 21,
        paddingLeft: 24
    },
    defaultImage: {
        display: 'flex',
        flexDirection: "column"
    },
    contentDurationWrapper: {
        marginLeft: 15,
        justifyContent: 'center'
    },
    greImage: {
        width: '100%',
        height: 320,
    },
    fabTitle: {
        color: '#25345c',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.5,
        textAlign: 'center',
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        marginBottom: 23,
    },
    socialBox: {},
    socialTitle: {
        color: '#646c73',
        fontSize: 13,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 16
    },
    iconList: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    fontBox: {},
    adjustmentIconList: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    fontTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 11,
        letterSpacing: 1,
        lineHeight: 21,
        textAlign: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        textTransform: 'uppercase'
    },
    minusBtn: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        overflow: 'hidden',
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center'
    },
    plusBtn: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        overflow: 'hidden',
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headingDurationWrapper: {
        borderBottomColor: '#EEE',
        borderBottomWidth: 0.5,
        paddingBottom: 24,
    },
    shareFavWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#EEE',
        borderBottomWidth: 0.5,
        // paddingBottom: 16,
        paddingLeft: 46,
        // paddingRight: 16,
    },
    shareOverlay: {
        height: 338,
        // padding: 24,
        paddingTop: 8,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
        left: 0,
        right: 0,
        top: 0,
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    shareFavText: {
        paddingLeft: 10,
        color: Colors.colors.mainPink80,
    },
    shareFavInner: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingTop: 24,
        // paddingBottom: 24,
        paddingRight: 38

    },
    greBtn: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    socialBtn: {
        width: 50,
        height: 50,
        borderRadius: 8,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: 'hidden',
        margin: 8
    },
    connectivityBtns: {
        paddingLeft: 24,
        paddingRight: 24
    },
    linkBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    container: {
        flex: 1
    },
    titleText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        padding: 24,
        paddingBottom: 4,
        justifyContent: 'center'
    },
    header: {
        ...CommonStyles.styles.stickyShadow,
        borderWidth: 0.5,
        elevation: 0,
        height: HEADER_SIZE,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20
    },
    headLeft: {
        flexDirection: 'row'
    },
    headRight: {},
    headIcon: {
        marginLeft: 5
    },
    crossRound: {
        borderWidth: 1,
        borderColor: '#25345C',
        borderRadius: 20,
        width: 35,
        height: 35,
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 7,
        overflow: 'hidden',
        marginRight: 15,
    },
    contentStyle: {
        marginBottom: 10
    },
    mainText: {
        ...commonText,
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 15
    },
    heading1: {
        ...commonText,
        fontFamily: 'Roboto-Bold',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 15
    },
    heading2: {
        ...commonText,
        fontSize: 24,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        marginBottom: 15
    },
    heading3: {
        ...commonText,
        fontSize: 18,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        marginBottom: 15
    },
    heading4: {
        ...commonText,
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        marginBottom: 15
    },
    heading5: {
        ...commonText,
        fontSize: 14,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        marginBottom: 15
    },
    heading6: {
        ...commonText,
        fontSize: 11,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        marginBottom: 15
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    source: {
        width: 30,
        height: 30,
        fontSize: 12,
        color: '#25345C',
        borderColor: '#25345C',
        borderWidth: 1,
        borderRadius: 15,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 30
    },
    pagination: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        color: '#25345c',
        lineHeight: 24,
        width: 100,
        textAlign: 'center',
        letterSpacing: 0.3
    },
    overlayHText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        color: '#25345c',
        lineHeight: 24,
        textAlign: 'center',
        letterSpacing: 0.3
    },
    swiperWrapper: {
        paddingTop: 10,
        width: '90%',
        minHeight: height * 3,
        height: '100%',
        alignSelf: 'center',
        // flexDirection: 'column'
    },
    sliderImage: {
        marginTop: 40,
        resizeMode: 'contain',
        width: '100%',
        height: 300
    },
    slide: {
        flex: 1,
        // height: height
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingTop: 10,

    },
    description: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '300',
        lineHeight: 30,
        fontSize: 20,
        paddingLeft: 24,
        paddingRight: 24,
        color: "#646c73"
    },
    boldText: {
        ...desText,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600'
    },
    italicText: {
        ...desText,
        fontFamily: 'Roboto-Italic',
        fontStyle: 'italic'
    },
    underlineText: {
        ...desText,
        textDecorationLine: 'underline',
    },
    linkText: {
        ...desText,
        textDecorationLine: 'underline',
        fontStyle: 'italic',
        color: '#4FACFE'
    },
    videowrapper: {
        paddingTop: 10,
        height: 400,
        width: '100%',
        marginBottom: 30
    },
    // videoTitle: {
    //     ...commonText,
    //     fontSize: 24,
    //     fontWeight: '300'
    // },
    // backgroundVideo: {
    //     marginTop: 10,
    //     width: '100%',
    //     height: 400,
    //     backgroundColor: '#E0E0E0'
    // },
    backgroundAudio: {
        marginTop: 10,
        width: '100%',
        height: 340,
        backgroundColor: '#E0E0E0',
    },
    audioTitle: {
        ...commonText,
        fontSize: 24,
        fontWeight: '600'
    },
    // completeBtn: {
    //     fontFamily: 'Roboto-Regular',
    //     color: '#4FACFE',
    //     fontSize: 15
    // },
    animWrapper: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    mainImage: {
        alignSelf: 'center',
        width: 400
    },
    stickyPlayer: {
        backgroundColor: '#fafbff',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: isIphoneX() ? 120 : 90,
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
    },
    playerBG: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 90,
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24
    },
    skPlayer: {
        height: 90,
        backgroundColor: 'transparent',
        // width: '100%',
        // flex: 2
    },
    vWrapper: {
        flex: 2
    },
    vButton: {
        justifyContent: 'center',
        height: 90
    },
    markAsCompletedText: {
        color: '#3fb2fe',
        textTransform: Platform.OS === 'ios' ? 'uppercase' : 'capitalize'
    },
    greenMarkBtn: {
        backgroundColor: 'rgba(119,199,11, 0.05)',
        borderRadius: 4,
        width: '100%',
        justifyContent: 'center'
    },
    greenMarkText: {
        color: '#77c70b',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        lineHeight: 19.5,
        fontSize: 13,
        letterSpacing: 0.7,
        textAlign: 'center',
        paddingLeft: 30

    },
    audioText: {
        color: '#515D7D',
        fontFamily: 'Roboto-Bold',
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 18,
        fontSize: 15,
        letterSpacing: 0.5,
        paddingRight: 135,
        paddingTop: 35,
        paddingBottom: 35,

    },
});
const audioStyles = {
    preloadingPlaceholder: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center'
    },
    thumbnail: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center'
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 84,
        height: 84,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    playArrow: {
        color: 'white',
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: '#25345C'
    },
    controls: {
        backgroundColor: '#25345C',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center'
    },
    playControl: {
        color: 'white',
        padding: 8
    },
    extraControl: {
        color: 'white',
        padding: 8
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 5
    },
    seekBarProgress: {
        height: 5,
        backgroundColor: '#4FACFE',
        borderRadius: 5
    },
    seekBarKnob: {
        backgroundColor: '#4FACFE'
    },
    seekBarBackground: {
        backgroundColor: '#22242A',
        height: 5,
        borderRadius: 5,
        marginRight: 10
    },
    overlayButton: {
        flex: 1
    }
};
const fullGraPlayer = {
    preloadingPlaceholder: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        // marginLeft: 24
        alignItems: 'flex-start'
    },
    playButton: {
        backgroundColor: 'transparent',
        width: 65,
        height: 65,
        alignSelf: 'center'
    },
    thumbnail: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    controls: {
        backgroundColor: 'transparent',
        height: 200,
        marginTop: -200,
        flexDirection: 'column',
        alignItems: 'center',
    },
    seekBarProgress: {
        height: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        opacity: 0.75
    },
    seekBarKnob: {
        backgroundColor: '#FFF'
    },
    seekBarBackground: {
        backgroundColor: '#515d7d',
        height: 3,
        borderRadius: 4,
        opacity: 0.1,
        marginRight: 10
    }

};
const gradientPlayer = {
    preloadingPlaceholder: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        // marginLeft: 24
        alignItems: 'flex-start'
    },
    thumbnail: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    playButton: {
        backgroundColor: 'red',
        width: 40,
        height: 40,
        borderRadius: 32,
        overflow: 'hidden',
    },
    playArrow: {
        color: 'white'
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: 'transparent'
    },
    controls: {
        backgroundColor: 'transparent',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center'
    },
    playControl: {
        color: 'white',
        padding: 0,
        marginRight: 16,
        // paddingLeft: 0,
        width: 40,
        height: 40,
        borderRadius: 30,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    extraControl: {
        color: '#3fb2fe',
        padding: 0
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 8
    },
    seekBarProgress: {
        height: 5,
        backgroundColor: '#34b6fe',
        borderRadius: 5,
        opacity: 0.5
    },
    seekBarKnob: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ebebeb'
    },
    seekBarBackground: {
        backgroundColor: '#515d7d',
        height: 3,
        borderRadius: 4,
        opacity: 0.1,
        marginRight: 10
    },
    overlayButton: {
        flex: 1
    },
};
