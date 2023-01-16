import React, { Component } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { Button, Container, Content, Form } from "native-base";
import {
    BackButton,
    Colors,
    CommonStyles,
    CommonTextArea,
    isIphoneX,
    PrimaryButton,
    ProgressBars,
    Public_TextArea_Label,
    TextStyles,
} from "ch-mobile-shared";
import { Screens } from "../../constants/Screens";

export default class PrivateFeedbackScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const publicFeedback = navigation.getParam("publicFeedback", null);
        const privateFeedback = navigation.getParam("privateFeedback", null);
        this.appointment = navigation.getParam('appointment', null);
        this.delayedFeedback = navigation.getParam("delayedFeedback", false);
        this.state = {
            publicFocus: false,
            publicFeedback: publicFeedback,
            privateFocus: false,
            privateFeedback: privateFeedback,
            keyboardOpen: false
        };

        this.form = {
            publicField: '',
            privateField: '',
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
            publicFeedback: this.state.publicFeedback,
            privateFeedback: this.state.privateFeedback
        });
    };

    skipFeedback = () => {
        if (this.delayedFeedback) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.replace(Screens.SESSION_REWARD_SCREEN, {
                appointment: this.appointment
            });
        }
    };

    onChangePublicText = (publicFeedback) => {
        {
            if (this.state.publicFeedback === '' || this.state.publicFeedback === null) {
                publicFeedback = publicFeedback.trim();
            }
            this.setState({publicFeedback});
        }
    }

    onChangePrivateText = (privateFeedback) => {
        if (this.state.privateFeedback === '' || this.state.privateFeedback === null) {
            privateFeedback = privateFeedback.trim();
        }
        this.setState({privateFeedback});
    }

    publicGetRef = (field) => {
        this.state.publicField = field;
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);

        return (
          <KeyboardAvoidingView
            style={{ flex: 1, bottom: 0}}
            // behavior={Platform.OS === 'ios' ? 'padding' : null}
          >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <Container>
                      <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                      />
                      <Content
                        showsVerticalScrollIndicator={false}
                        style={styles.wrapper}>

                          <View style={styles.backBtnView}>
                              <BackButton
                                onPress={this.backClicked}
                              />
                          </View>
                          <ProgressBars
                            index={1}
                            totalBars={4}
                          />
                          <Text style={styles.title}>Share your Feedback</Text>
                          <Text style={styles.subText}>
                              Add your public feedback, this will be displayed on your provider's profile.
                          </Text>

                          <Form>
                              <View style={{ marginBottom: 40 }}>
                                  <View style={styles.headWrapper}>
                                      <Text style={styles.boldText}>Public feedback</Text>
                                      <Text style={styles.greyText}>Optional</Text>
                                  </View>
                                  <View style={styles.textareaWrapper}>
                                      <CommonTextArea
                                        testID={'Enter-public-comment'}
                                        value={this.state.publicFeedback}
                                        autoFocus={true}
                                        multiline={true}
                                        borderColor={Colors.colors.borderColor}
                                        placeholderText={Public_TextArea_Label}
                                        onChangeText={this.onChangePublicText}
                                        getRef={this.publicGetRef}
                                      />
                                  </View>
                              </View>
                          </Form>
                          <View
                            style={styles.addFeedbackBtnStyle}
                          >
                              <PrimaryButton
                                disabled={!this.state.publicFeedback}
                                style={styles.skipBtn}
                                onPress={() => {
                                    this.navigateToCheckFeedbackScreen();
                                }}
                                ref={btn => {
                                    this.form.submitBtn = btn;
                                }}
                                text="Add Feedback"
                                arrowIcon={true}
                              />

                          </View>
                      </Content>
                      <View
                        style={styles.btnStyle}
                      >
                          {!this.state.publicFeedback && (
                            <Button
                              onPress={() => {
                                  this.skipFeedback();
                              }}
                              transparent style={styles.skipBtn}>
                                <Text style={{...CommonStyles.styles.blueLinkText}}>Skip For Now</Text>
                            </Button>
                          )}
                      </View>
                  </Container>
              </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );
    };
}

// Content.propTypes = {
//     disableKBDismissScroll: PropTypes.bool,
//     keyboardShouldPersistTaps: PropTypes.string,
//     padder: PropTypes.bool,
//     style: PropTypes.oneOfType([
//         PropTypes.object,
//         PropTypes.number,
//         PropTypes.array
//     ])
// };
const styles = StyleSheet.create({
    wrapper: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: isIphoneX() ? 24 : 0
    },
    addFeedbackBtnStyle:{
        // marginTop: 10,
    },
    skipBtn: {
        alignSelf: 'center',
        height: 50
    },
    backBtnView: {
        position: 'absolute',
        left: 0,
        top: 36
    },
    title: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 8
    },
    subText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        textAlign: 'center',
        marginBottom: 30
    },
    headWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    boldText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast
    },
    greyText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    textareaWrapper: {
        // marginBottom: 6
    },
    btnStyle: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34: 24,
    }
});

