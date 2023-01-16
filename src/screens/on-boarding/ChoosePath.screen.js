import React, {Component} from 'react';
import {
    StatusBar,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    TextStyles,
    CommonStyles,
    BackButton,
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import { createStyles, maxWidth } from 'react-native-media-queries';
const windowHeight = Dimensions.get('window').height;

export default class ChoosePathScreen extends React.PureComponent<Props>{
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen =  (needAppointment = false, talkToMatchMaker = false, exploreAppByOwn = false, skip = false) => {

        const shortOnBoardingDetails = {
            needAppointment, exploreAppByOwn, talkToMatchMaker, skip
        }
        if(needAppointment || talkToMatchMaker) {
            this.props.navigation.navigate(Screens.SCHEDULE_SCREEN, {
                ...this.props.navigation.state.params,
                shortOnBoardingDetails
            })
        } else  {
            this.props.navigation.navigate(Screens.SELECT_STATE_SCREEN, {
                ...this.props.navigation.state.params,
                shortOnBoardingDetails
            })
        }
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <View style={styles.backButtonWrapper}>
                    <BackButton
                        onPress={this.backClicked}
                    />
                </View>
                <Content showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
                    <View style={styles.textBox}>
                        <Image
                            style={styles.signInIcon}
                            source={require('../../assets/images/new-select-goals-icon2.png')} />
                        <Text style={styles.privacyMainText}>How would you like to get started?</Text>
                    </View>
                    <View style={{paddingHorizontal: 24, marginBottom: 8}}>
                        <TouchableOpacity style={styles.BoxWrapper} onPress={()=>{
                            this.navigateToNextScreen(true)}}>
                            <View style={styles.boxTop}>
                                <Image
                                    style={styles.boxTopIcon}
                                    source={require('../../assets/images/schedule.png')} />
                                <Text style={styles.boxTopText}>Book an{'\n'}appointment</Text>
                            </View>
                            <View>
                                <Text style={styles.boxBottomText}>Pick a convenient time to meet with a therapist, prescriber, or coach.</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.BoxWrapper}
                                          onPress={()=>{
                                              this.navigateToNextScreen(false, true )
                            }}>
                            <View style={styles.boxTop}>
                                <Image
                                    style={styles.boxTopIcon}
                                    source={require('../../assets/images/therapy.png')} />
                                <Text style={styles.boxTopText}>Talk to a real{'\n'}person</Text>
                            </View>
                            <View>
                                <Text style={styles.boxBottomText}>Got questions? Our friendly team is happy to help get them answered.</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.BoxWrapper}
                                          onPress={()=>{ this.navigateToNextScreen(false, false, true)}}>
                            <View style={styles.boxTop}>
                                <Image
                                    {...addTestID('lock-icon-png')}
                                    style={styles.boxTopIcon}
                                    source={require('../../assets/images/care_navigation.png')} />
                                <Text style={styles.boxTopText}>Explore the app{'\n'}on my own</Text>
                            </View>
                            <View>
                                <Text style={styles.boxBottomText}>Check out ReVAMP, our articles, healthbots, support groups, and more.</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.greBtn}>
                        <Text style={{ ...CommonStyles.styles.blueLinkText }}
                              onPress={()=>this.navigateToNextScreen(false, false, false, true)}>
                            I’m not sure what to do
                        </Text>
                    </View>
                </Content>
            </Container>
        );
    }
}

const mainStyles = {
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
        flex: 1
    },
    signInIcon: {
        marginTop: 8,
        marginBottom: 40,
        width: 120,
        height: 120
    },
    privacyMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    greBtn: {
        marginBottom: 40
    },
    BoxWrapper:{
        padding: 24,
        marginBottom: 16,
        borderRadius: 12,
        ...CommonStyles.styles.shadowBox,
    },
    boxTop:{
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    boxTopIcon:{
        width: 56,
        height: 56,
        marginRight: 24,
    },
    boxTopText:{
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.highContrast,
    },
    boxBottomText:{
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
};

export const styles = createStyles(
    mainStyles,
    maxWidth(320, {
        signInIcon: {
            marginBottom: 30,
            width: 80,
            height: 80
        }
    }),
);
