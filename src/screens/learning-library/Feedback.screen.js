import React, {Component} from 'react';
import {Button, Container, Text, View} from 'native-base';
import {StatusBar, StyleSheet} from 'react-native';
import {connectAuth} from '../../redux';
import IoniIcon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import {addTestID, AlertUtil, isIphoneX} from "ch-mobile-shared";
import ProfileService from "../../services/Profile.service";
import Analytics from '@segment/analytics-react-native';
import {Screens} from "../../constants/Screens";

class FeedbackScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.entryId = navigation.getParam('entryId', null);
        this.state = {
            feedbackDisabled: false
        }
    }

    captureFeedback = async (isHelpful)=>{
        this.setState({
            feedbackDisabled: true
        });
        const {nextEntryId} = this.props.navigation.state.params;
        if(nextEntryId){
            this.props.navigation.replace(Screens.EDUCATIONAL_CONTENT_PIECE, {
                ...this.props.navigation.state.params,
                contentSlug : nextEntryId,
                entryId : nextEntryId,
            })
        }else {
            this.props.navigation.goBack();
        }
        const response = await ProfileService.captureEducationFeedback(this.entryId, isHelpful);
        if(!response.errors) {
            AlertUtil.showSuccessMessage('Your feedback has been submitted');
        }
    };

    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <LinearGradient
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#6078ea", "#34b6fe", "#00C8FE"]}
                    style={styles.feedbackBG}
                >
                    <View>
                        <Text style={styles.feedbackTitle}>Did you find this helpful?</Text>
                        <View style={styles.thumbup}
                              {...addTestID('like')}
                        >
                            <Button
                                transparent
                                disabled={this.state.feedbackDisabled}
                                style={styles.thumbBtn}
                                onPress={() => {
                                    this.captureFeedback(true);
                                }}
                            >
                                <IoniIcon name="md-thumbs-up" size={65} color="#FFF"/>
                            </Button>
                        </View>
                        <View style={styles.thumbdown}
                              {...addTestID('dislike')}
                        >
                            <Button
                                transparent
                                style={styles.thumbBtn}
                                onPress={() => {
                                    this.captureFeedback(false);
                                }}
                            >
                                <IoniIcon name="md-thumbs-down" size={65} color="#FFF"/>
                            </Button>
                        </View>
                    </View>
                </LinearGradient>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    feedbackBG: {
        flex: 1,
        justifyContent: 'center'
    },
    feedbackTitle: {
        color: '#FFF',
        fontSize: 24,
        fontFamily: 'Roboto-Regular',
        lineHeight: 36,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: isIphoneX() ? 60 : 50
    },
    thumbup: {
        width: 160,
        height: 160,
        borderRadius: 90,
        shadowColor: 'rgba(0,0,0, 0.15)',
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowRadius: 90,
        shadowOpacity: 0.5,
        elevation: 0,
        backgroundColor: 'rgba(255,255,255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 40
    },
    thumbdown: {
        width: 160,
        height: 160,
        borderRadius: 90,
        shadowColor: 'rgba(0,0,0, 0.15)',
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowRadius: 90,
        shadowOpacity: 0.5,
        elevation: 0,
        backgroundColor: 'rgba(255,255,255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10
    },
    thumbBtn: {
        flex: 1,
        backgroundColor: 'transparent'
    }
});
export default connectAuth()(FeedbackScreen);
