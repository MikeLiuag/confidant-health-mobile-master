import React, {Component} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View,} from 'react-native';
import {Button, Container, Form, Textarea,} from 'native-base';
import GradientButton from '../../components/GradientButton';
import {addTestID, isIphoneX} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';

export default class PublicFeedbackScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const publicFeedback = navigation.getParam("publicFeedback", null);

        this.state = {
            publicFocus: false,
            publicFeedback: publicFeedback,
            keyboardOpen: false
        };

        this.form = {
            publicField: '',
            submitBtn: ''
        };
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    }

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
    }

    navigateToCheckFeedbackScreen = () => {
        this.props.navigation.replace(Screens.SEND_FEEDBACK_SCREEN, {
            ...this.props.navigation.state.params,
            publicFeedback: this.state.publicFeedback
        });
    };

    navigateToAlfieQuestionScreen = () => {
        this.props.navigation.replace(Screens.ALFIE_QUESTION_SCREEN);
    };

    skipFeedback = () => {
        this.navigateToAlfieQuestionScreen();
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <Container>
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <ScrollView style={styles.wrapper}>
                        <View style={styles.progressBar}>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleSelectedProgress}/>
                            <View style={styles.singleHalfProgress}>
                                <View style={styles.quarterInner}/>
                            </View>
                            <View style={styles.singleProgress}/>
                        </View>
                        <Text style={styles.title}>Add Public Feedback</Text>
                        <Form>
                            <View style={styles.textareaWrapper}>
                                <Textarea
                                    {...addTestID('Enter-public-comment')}
                                    style={styles.textBox}
                                    value={this.state.publicFeedback}
                                    placeholderTextColor='#b3bec9'
                                    onChangeText={publicFeedback => {
                                        if (this.state.publicFeedback === '' || this.state.publicFeedback === null) {
                                            publicFeedback = publicFeedback.trim();
                                        }
                                        this.setState({publicFeedback});
                                    }}
                                    getRef={field => {
                                        this.state.publicField = field;
                                    }}
                                    multiline={true}
                                    onFocus={() => {
                                        this.setState({publicFocus: true});
                                    }}
                                    rowSpan={3}
                                    placeholder="Enter your public comment. It will appear on the provider’s profile."/>
                            </View>
                        </Form>
                    </ScrollView>
                    <View
                        style={this.state.keyboardOpen ? {
                            ...styles.btnStyle,
                            paddingLeft: 0,
                            paddingRight: 0,
                            paddingBottom: 0
                        } : styles.btnStyle}
                    >

                        {!this.state.publicFeedback && (
                            <Button
                                onPress={() => {
                                    this.skipFeedback();
                                }}
                                transparent style={styles.skipBtn}>
                                <Text style={styles.skipText}>Skip For Now</Text>
                            </Button>
                        )}
                        <GradientButton
                            //testId = "add-public-feedback"
                            disabled={!this.state.publicFeedback}
                            onPress={() => {
                                this.navigateToCheckFeedbackScreen();
                            }}
                            ref={btn => {
                                this.form.submitBtn = btn;
                            }}
                            text="Add Public Feedback"
                        />
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    };
}

const styles = StyleSheet.create({
    wrapper: {
        paddingLeft: 40,
        paddingRight: 24,
        paddingTop: isIphoneX() ? 44 : 24,
    },
    skipBtn: {
        alignSelf: 'center',
        marginTop: 10,
    },
    skipText: {
        color: '#3FB2FE',
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 22.5,
    },
    title: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        color: '#25345c',
        marginBottom: 40,
        textAlign: 'center'
    },
    textareaWrapper: {
        marginBottom: 20,
    },
    textareaLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.47,
        color: '#25345c',
        fontWeight: '500',
        marginBottom: 5,
    },
    textBox: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 5,
        paddingBottom: 5,
        height: 'auto',
        paddingLeft: 0,
        maxHeight: 160,
        // borderWidth:1,
        // borderColor:'#EBEBEB',
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 60,
        marginBottom: 40
    },
    singleProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4
    },
    singleSelectedProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#3fb2fe',
        marginLeft: 4,
        marginRight: 4
    },
    singleHalfProgress: {
        width: 24,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#ebebeb',
        marginLeft: 4,
        marginRight: 4,
        overflow: 'hidden'
    },
    halfInner: {
        backgroundColor: '#3fb2fe',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 12
    },
    quarterInner: {
        backgroundColor: '#3fb2fe',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 18
    },
});
