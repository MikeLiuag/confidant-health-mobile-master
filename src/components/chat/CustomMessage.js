import {Button} from 'native-base';
import AwesomeIcon from 'react-native-vector-icons/SimpleLineIcons';
import CustomChatView from './CustomChatView';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, ViewPropTypes} from 'react-native';
import {Avatar, Day, Message, SystemMessage,} from 'react-native-gifted-chat';
import LinearGradient from 'react-native-linear-gradient';
import {Screens} from '../../constants/Screens';
import moment from 'moment';
import {connectAuth} from '../../redux';
import {addTestID, Colors, TextStyles} from "ch-mobile-shared";
import {CUSTOME_BUBBLES_MESSAGES} from "../../constants/CommonConstants";
import {AlertUtil} from "ch-mobile-shared/src/utilities";
import Hyperlink from "react-native-hyperlink";

var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
                if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
        return t;
    };

export function isSameDay(currentMessage, diffMessage) {
    if (!diffMessage.createdAt) {
        return false;
    }
    const currentCreatedAt = moment(currentMessage.createdAt);
    const diffCreatedAt = moment(diffMessage.createdAt);
    if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
        return false;
    }
    return currentCreatedAt.isSame(diffCreatedAt, 'day');
}

export function isSameUser(currentMessage, user) {
    return currentMessage.user._id === user._id;
}

class CustomMessage extends React.Component {
    constructor(props) {
        super(props);
        this.hlinkRef = null;
        this.state = {
            selectedRating: null,
        };
    }

    shouldComponentUpdate(nextProps) {
        const next = nextProps.currentMessage;
        const current = this.props.currentMessage;
        const {nextMessage} = this.props;
        const nextPropsMessage = nextProps.nextMessage;
        return (
            next.sent !== current.sent ||
            next.received !== current.received ||
            next.pending !== current.pending ||
            next.createdAt !== current.createdAt ||
            next.text !== current.text ||
            next.image !== current.image ||
            next.video !== current.video ||
            next.audio !== current.audio ||
            nextMessage !== nextPropsMessage
        );
    }

    renderDay() {
        if (this.props.currentMessage && this.props.currentMessage.createdAt) {
            const _a = this.props,
                {containerStyle} = _a,
                props = __rest(_a, ['containerStyle']);
            if (this.props.renderDay) {
                return this.props.renderDay(props);
            }
            return <Day {...props} />;
        }
        return null;
    }

    showProvidersList = () => {
        this.props.navigation.navigate(Screens.PROVIDER_LIST_SCREEN, {
            userId: this.props.auth.meta.userId,
            nickName: this.props.auth.meta.nickname,
            organizationId: this.props.organizationId,
            organizationName: this.props.organizationName,
        });
    };

    renderText = (textToBeRender , textStyle)=>{
        return(
            <Hyperlink
                ref={(hlink) => {
                    this.hlinkRef = hlink;
                }}
                onPress={(url) => {
                    try {
                        this.hlinkRef.handleLink(url);
                    } catch (e) {
                        AlertUtil.showErrorMessage('Unable to open this link');
                    }
                }}
                linkStyle={{textDecorationLine: 'underline'}}
            >
                <Text
                    {...addTestID('Full-Screen-View-Text')}
                    style={textStyle}
                >
                    {textToBeRender}
                </Text>
            </Hyperlink>
        )
    }

    renderInternalLink = (linkTitle, onPress)=> {
        return (<Text
            style={{...chatStyles.botText, color: Colors.colors.primaryText, ...TextStyles.mediaTexts.manropeBold,}}
            onPress={onPress}
        >
            {linkTitle}
        </Text>)
    };

    renderBubble(sameUser) {
        const {nextMessage} = this.props;
        let textToShow = this.props.currentMessage.text;
        const currentMessage = this.props.currentMessage;
        const contentType =
            currentMessage.type &&
            currentMessage.attachments &&
            currentMessage.attachments.length &&
            currentMessage.attachments[0].contentType;
        if(contentType === 'telehealth-services'){
            textToShow = CUSTOME_BUBBLES_MESSAGES.CLINICAL_SERVICES;
        }else if(contentType === 'provider-prompt'){
            textToShow = CUSTOME_BUBBLES_MESSAGES.CLINICAL_TEAM;
        }else if(contentType === 'filtered-providers'){
            textToShow = CUSTOME_BUBBLES_MESSAGES.AVAILABLE_COACHES;
        }
        const _a = this.props,
            {containerStyle} = _a,
            props = __rest(_a, ['containerStyle']);
        if (this.props.renderBubble) {
            return this.props.renderBubble(props);
        }

        const isTextPressable = contentType === 'provider-prompt' || contentType==='education';
        if(contentType==='education') {
            textToShow = currentMessage.attachments[0].content.contentfulData.title;
        }

        if (sameUser) {
            return (
                <View style={chatStyles.userContainer}>
                    <LinearGradient
                        start={{x: 1, y: 1}}
                        end={{x: 1, y: 0}}
                        colors={[ Colors.colors.mainBlue20, Colors.colors.mainBlue20]}
                        style={chatStyles.bubbleBG}>
                        {this.renderText(textToShow + ' ',chatStyles.userText)}
                    </LinearGradient>
                    <Text style={chatStyles.userTime}>
                        {moment(this.props.currentMessage.createdAt).format('LT')}
                    </Text>
                </View>
            );
        } else {
            return (
                <View style={chatStyles.botContainer}>
                    <View style={chatStyles.botBubbleBG}>
                        {
                            isTextPressable && !nextMessage.text && nextMessage.type !== 'typing' ?this.renderInternalLink(textToShow, ()=>{
                                this.props.chatResumed();
                            }) : this.renderText(textToShow,chatStyles.botText)
                        }
                    </View>
                    <Text style={chatStyles.botTime}>
                        {moment(this.props.currentMessage.createdAt).format('LT')}
                    </Text>
                </View>
            );
        }
    }

    renderSystemMessage() {
        const _a = this.props,
            {containerStyle} = _a,
            props = __rest(_a, ['containerStyle']);
        if (this.props.renderSystemMessage) {
            return this.props.renderSystemMessage(props);
        }
        return <SystemMessage {...props} />;
    }

    renderAvatar() {
        const {user, currentMessage, showUserAvatar} = this.props;
        if (
            user &&
            user._id &&
            currentMessage &&
            user._id === currentMessage.user._id &&
            !showUserAvatar
        ) {
            return null;
        }
        if (currentMessage && currentMessage.user.avatar === null) {
            return null;
        }
        const _a = this.props,
            {containerStyle} = _a,
            props = __rest(_a, ['containerStyle']);
        // console.log(props.currentMessage.user.avatar);
        return <Avatar {...props} />;
    }

    launchEducationalContent(contentSlug) {
        /*TODO : add category and topic for educational content to render it properly*/
        this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
            contentSlug:contentSlug,
            category:'',
            topic:''

        });
    }

    getEducationalContent(currentMessage) {
        console.log('EDUCATION CONTENT');
        console.log(currentMessage)
        let lastMessage = false;
        if (currentMessage && currentMessage.attachments && currentMessage.attachments.length && this.props.chat.chatMessages && this.props.chat.chatMessages.length>0 && this.props.chat.chatMessages[0].attachments ) {
            lastMessage = currentMessage.attachments[0].contentType === this.props.chat.chatMessages[0].attachments[0].contentType;
        }

        return (
            <View>

                <View style={[chatStyles.educationWrapper, {marginBottom: 20}]}>
                    <Text style={chatStyles.typeText}>
                        {currentMessage.attachments[0].content.contentfulData.title
                            ? 'EDUCATIONAL CONTENT'
                            : 'CONTENT UNAVAILABLE'}
                    </Text>
                    <Text style={chatStyles.educationTitle}>
                        {currentMessage.attachments[0].content.contentfulData.title}
                    </Text>
                    <Text style={chatStyles.read}>
                        {
                            currentMessage.attachments[0].content.contentfulData
                                .contentLengthduration
                        }
                    </Text>
                    {currentMessage.attachments[0].content.contentfulData.title ? (
                        <Button
                            {...addTestID('Launch-Educational-Content')}
                            transparent
                            style={chatStyles.nextBtn}
                            onPress={() => {
                                this.launchEducationalContent(
                                    currentMessage.attachments[0].content.educationContentSlug
                                );
                            }}>
                            <AwesomeIcon name="arrow-right-circle" size={30} color="#25345C"/>
                        </Button>
                    ) : null}
                </View>

                <View style={{...chatStyles.botContainer, marginLeft: 50, marginBottom: lastMessage ? 40 : 20}}>
                    <View style={chatStyles.botBubbleBG}>
                        <Text style={chatStyles.botText}>
                            Click the Educational Content above and let me know when you’re done reading it.
                        </Text>
                        <Text style={chatStyles.botTime}>
                            {moment(this.props.currentMessage.createdAt).format('LT')}
                        </Text>
                    </View>
                </View>
            </View>

        );
    }


    renderRatingButton = value => {
        return (
            <Button
                key={'rating-value-' + value}
                transparent
                style={
                    this.state.selectedRating === value
                        ? chatStyles.ratingBtnActive
                        : chatStyles.ratingBtn
                }
                onPress={() => {
                    if (!this.state.selectedRating) {
                        this.setState({selectedRating: value});
                        this.props.onSend([{text: '' + value, type: 'message'}]);
                    }
                }}>
                <Text
                    style={
                        this.state.selectedRating === value
                            ? chatStyles.ratingBtnTextActive
                            : chatStyles.ratingBtnText
                    }>
                    {value}
                </Text>
            </Button>
        );
    };

    getRatingScaleView(currentMessage) {
        if (!currentMessage.ratingScale) {
            return null;
        }
        const evenIndexedValues = currentMessage.ratingScale.values.filter(
            (value, index) => index % 2 === 0,
        );
        const oddIndexedValues = currentMessage.ratingScale.values.filter(
            (value, index) => index % 2 !== 0,
        );
        return (
            <View style={chatStyles.ratingWrapper}>
                <View style={chatStyles.ratingRow}>
                    {oddIndexedValues.map(this.renderRatingButton)}
                </View>
                <View style={chatStyles.ratingRow}>
                    {evenIndexedValues.map(this.renderRatingButton)}
                </View>
                <View style={[chatStyles.ratingRow, {justifyContent: 'space-between'}]}>
                    <Text style={chatStyles.likelyText}>
                        {currentMessage.ratingScale.lowLabel}
                    </Text>
                    <Text style={{...chatStyles.likelyText, textAlign: 'right'}}>
                        {currentMessage.ratingScale.highLabel}
                    </Text>
                </View>
            </View>
        );
    }

    renderQuickReplies = quickReplies => {
        return (
            <View style={styles.optionContainer}>
                <View>
                    {quickReplies.values.map((choice, key) => (
                        <Button
                            {...addTestID('Answer-Quick-Reply')}
                            transparent
                            onPress={() => {
                                this.props.answerQuickReply({value: choice.value, msgToRender: choice.title});
                            }}
                            key={key}
                            style={styles.singleSelectBtn}>
                            <LinearGradient
                                start={{x: 0, y: 1}}
                                end={{x: 1, y: 0}}
                                colors={['#4FACFE', '#34b6fe', '#00C8FE']}
                                style={styles.buttonBG}>
                                <Text style={styles.buttonText}>{choice.title}</Text>
                            </LinearGradient>
                        </Button>
                    ))}
                </View>
            </View>
        );
    };

    render() {
        const {
            currentMessage,
            nextMessage,
            position,
            user,
            containerStyle,
        } = this.props;
        if (currentMessage && currentMessage.type !== 'typing') {
            const quickReplies = currentMessage.dataSharePromptChoices;
            const sameUser = isSameUser(currentMessage, user);
            const contentType =
                currentMessage.type &&
                currentMessage.attachments &&
                currentMessage.attachments.length &&
                currentMessage.attachments[0].contentType;
            const educationalContent =
                contentType === 'education'
                    ? this.getEducationalContent(currentMessage)
                    : null;
            // const ratingScale =
            //     contentType === 'rating-scale'
            //         ? this.getRatingScaleView(currentMessage)
            //         : null;
            return (
                <View>
                    {this.renderDay()}
                    {currentMessage.system ? (
                        this.renderSystemMessage()
                    ) : (
                        <View>
                            <View
                                style={[
                                    styles[position].container,
                                    {marginBottom: sameUser ? 2 : 3},
                                    !this.props.inverted && {marginBottom: 2},
                                    containerStyle && containerStyle[position],
                                ]}>
                                {this.props.position === 'left' ? this.renderAvatar() : null}
                                {this.renderBubble(sameUser)}
                                {this.props.position === 'right' ? this.renderAvatar() : null}
                            </View>
                            <View>
                                {/*{educationalContent ? educationalContent : null}*/}
                                {/*{ratingScale}*/}
                                {this.props.chat.chatPaused || nextMessage.text || nextMessage.type === 'typing' ? null : <CustomChatView
                                    message={currentMessage}
                                    overlayVisible={this.props.overlayVisible}
                                    onSend={this.props.onSend}
                                    navigateToNextScreen={this.props.navigateToNextScreen}
                                    contactId={this.props.organizationId}
                                />}
                                
                            </View>
                            {quickReplies &&
                            quickReplies.values.length > 0 &&
                            this.renderQuickReplies(quickReplies)}
                        </View>
                    )}
                </View>
            );
        }
        return null;
    }
}

const styles = {
    left: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            marginLeft: 8,
            marginRight: 0,
        },
    }),
    right: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            marginLeft: 0,
            marginRight: 8,
        },
    }),
    optionContainer: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
        padding: 10,
    },
    singleSelectBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 50,
        marginBottom: 8,
        alignSelf: 'flex-end',
    },
    buttonBG: {
        borderRadius: 2,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        minWidth: 130,
        maxWidth: '65%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
        paddingLeft: 20,
    },
};

const chatStyles = StyleSheet.create({
    ratingWrapper: {
        display: 'flex',
        flexDirection: 'column',
        padding: 15,
        paddingTop: 0
    },
    ratingTitle: {
        fontSize: 14,
        color: '#30344D',
        marginBottom: 20,
        textAlign: 'center',
        // paddingLeft: 44,
        // paddingRight: 10
    },
    ratingRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    ratingBtn: {
        borderRadius: 4,
        backgroundColor: '#FFF',
        width: 40,
        height: 40,
        marginLeft: 5,
        marginRight: 5,
        borderWidth: 2,
        borderColor: '#b3bec9',
        marginBottom: 10,
        justifyContent: 'center',
    },
    ratingBtnActive: {
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        width: 40,
        height: 40,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 10,
        justifyContent: 'center',
    },
    ratingBtnText: {
        alignSelf: 'center',
        color: '#757682',
        fontSize: 14,
    },
    ratingBtnTextActive: {
        alignSelf: 'center',
        color: '#FFF',
        fontSize: 18,
    },
    likelyText: {
        textTransform: 'uppercase',
        fontSize: 11,
        color: '#757682',
        width: 150
    },
    userContainer: {
        maxWidth: '70%',
        marginBottom: 15,
    },
    bubbleBG: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8
    },
    userText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast
    },
    userTime: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
        fontSize: 11,
        opacity: 1
    },
    botContainer: {
        maxWidth: '70%',
        marginBottom: 15,
    },
    botBubbleBG: {
        borderRadius: 12,
        flex: 1,
        padding: 16,
        backgroundColor: Colors.colors.highContrastBG,
        marginBottom: 8
    },
    botText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast
    },
    botTime: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
        fontSize: 11,
        opacity: 1
    },
    educationWrapper: {
        borderRadius: 8,
        borderColor: 'rgba(63, 177, 254, 0.2)',
        borderWidth: 1,
        flex: 1,
        padding: 13,
        backgroundColor: '#fff',
        marginLeft: 50,
        maxWidth: '80%'
    },
    typeText: {
        color: '#3cb1fd',
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        marginBottom: 10,
    },
    educationTitle: {
        color: '#25345c',
        fontSize: 20,
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        marginBottom: 15,
    },
    read: {
        color: '#000',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.6,
    },
    nextBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
        marginRight: 5,
    },
    providerWrapper: {
        borderRadius: 9,
        borderColor: 'rgba(63, 177, 254, 0.2)',
        borderWidth: 1,
        flex: 1,
        backgroundColor: '#fff',
        marginLeft: 50,
        maxWidth: '80%',
        //marginBottom: 60,
    },
    providerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    proInfo: {
        alignSelf: 'center',
        padding: 13,
    },
    imgWrapper: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30
    },
    proImg: {
        width: 44,
        height: 44,
        borderWidth: 2,
        borderColor: '#4FACFE',
        borderRadius: 22,
        alignSelf: 'center',
        marginRight: -10
    },
    plusIco: {
        width: 44,
        height: 44,
    },
    proDes: {
        color: '#8D92A3',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        fontWeight: '500',
        alignSelf: 'center',
        maxWidth: '80%',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30
    },
    viewContainer: {
        padding: 7,
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB',
        width: '100%',
    },
    viewBtn: {
        alignSelf: 'center',
    },
    viewText: {
        color: '#39B4FE',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        fontWeight: '700',
    },
});

Message.defaultProps = {
    renderAvatar: undefined,
    renderBubble: null,
    renderDay: null,
    renderSystemMessage: null,
    position: 'left',
    currentMessage: {},
    nextMessage: {},
    previousMessage: {},
    user: {},
    containerStyle: {},
    showUserAvatar: false,
    inverted: true,
};
Message.propTypes = {
    renderAvatar: PropTypes.func,
    showUserAvatar: PropTypes.bool,
    renderBubble: PropTypes.func,
    renderDay: PropTypes.func,
    renderSystemMessage: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    user: PropTypes.object,
    inverted: PropTypes.bool,
    containerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
};

export default connectAuth()(CustomMessage);
