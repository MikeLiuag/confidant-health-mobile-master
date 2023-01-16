import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image
} from 'react-native';
import {Text} from 'native-base';
import GradientButton from './GradientButton';
import {addTestID, getAvatar, isIphoneX} from 'ch-mobile-shared';
import {
    DEFAULT_IMAGE,
    GET_CONNECTED_TO,
    HERE_YOUR_INFORMATION,
    S3_BUCKET_LINK,
    YOU_ARE_ON_TAKING_A_GREAT_STEP,
    GROUP_CTA_POPUP_TITLE, CONTENT_TYPE
} from "../constants/CommonConstants";
import Overlay from 'react-native-modal-overlay';
import LinearGradient from "react-native-linear-gradient";

const OVERLAY_TITLES = {
    'profile-element': YOU_ARE_ON_TAKING_A_GREAT_STEP,
    'education-content': HERE_YOUR_INFORMATION,
    'group-recommendation': GROUP_CTA_POPUP_TITLE,
    'recommend-provider-profile': GET_CONNECTED_TO
}

export default class BranchOverlay extends Component<Props> {
    constructor(props) {
        super(props);
    }

    render(): React.ReactNode  {

        const branchOverlyTitle = OVERLAY_TITLES[this.props.branchLink];
        const btnText = this.props.branchLink === CONTENT_TYPE.GROUP_RECOMMENDATION ? "Join Group " : "Continue" ;
        const {modalVisible, branchCloseOverlay, branchOverlySubTitle, branchOverlyDescription,
            branchOverlyImage, handleOnContinueButton, branchLink} = this.props

        return(
            <Overlay
                containerStyle={styles.overlayBG}
                childrenWrapperStyle={styles.pendingWrapper}
                visible={modalVisible}
                onClose={branchCloseOverlay}
            >
                <View style={{width: '100%'}}>
                    <Text style={styles.pendingTitle}>{branchOverlyTitle}</Text>
                    <Text style={styles.pendingSubTitle}>{branchOverlySubTitle}</Text>
                    <Text style={styles.pendingDes} numberOfLines={4}>{branchOverlyDescription}</Text>
                    {branchLink === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE ?
                        <View style={styles.proImagWrapper}>
                            <Image
                                style={styles.starImg}
                                resizeMode="contain"
                                source={require('../assets/images/stars.png')}/>
                            <LinearGradient
                                start={{x: 0, y: 1}}
                                end={{x: 1, y: 0}}
                                colors={["#e73500", "#ff7f05", "#fbeb4b"]}
                                style={styles.greRing}
                            >
                                <Image
                                    {...addTestID('Alfie-body-png')}
                                    style={styles.providerImg}
                                    resizeMode="cover"
                                    source={{uri: branchOverlyImage ? getAvatar({profilePicture: branchOverlyImage.replace('_thumbnail', '')}) : S3_BUCKET_LINK + DEFAULT_IMAGE}}/>
                            </LinearGradient>
                        </View>
                        :
                        branchLink === CONTENT_TYPE.EDUCATION_CONTENT ?
                            <Image
                                {...addTestID('content-image')}
                                style={styles.contentImg}
                                resizeMode="cover"
                                source={branchOverlyImage ?  {uri:'https:' + branchOverlyImage} : require('../assets/images/general-topic-bg.png')}
                            />
                            :
                            <Image
                                {...addTestID('branch-map-image')}
                                style={styles.alfieImg}
                                resizeMode="contain"
                                source={require('../assets/images/branch-Map.png')}
                            />
                    }
                    <GradientButton
                        testId = "continue"
                        onPress={ ()=> handleOnContinueButton(branchLink)}
                        text={ btnText }
                    />
                </View>
            </Overlay>
        );
    };
}

const styles = StyleSheet.create({
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
    },
    pendingWrapper: {
        height: 'auto',
        padding: 24,
        paddingTop: 34,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
        left: 0,
        right: 0,
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingLeft: 24,
        paddingRight: 24,
        height: 550,
        paddingTop: 20
    },
    alfieImg: {
        width: 180,
        height: 150,
        alignSelf: 'center',
        marginBottom: 40
    },
    contentImg: {
        width: '100%',
        height: 150,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 8,
        marginBottom: 20
    },
    pendingTitle: {
        color: '#01417f',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 22,
        lineHeight: 33,
        letterSpacing: 0.61,
        textAlign: 'center',
        marginBottom: 8,
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: 300,
        alignSelf: 'center'
    },
    pendingSubTitle: {
        color: '#01417f',
        fontFamily: 'Roboto-Regular',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 24,
    },
    pendingDes: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.34,
        textAlign: 'justify',
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 20
    },
    proImagWrapper: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30
    },
    starImg: {
        position: 'absolute',
        left: 0,
        right: 0,
        width: '100%',
        height: 250
    },
    greRing: {
        width: 210,
        height: 210,
        borderRadius: 105,
        justifyContent: 'center',
        alignItems: 'center'
    },
    providerImg: {
        width: 200,
        height: 200,
        borderColor: '#fff',
        borderWidth: 5,
        borderRadius: 100
    }
});
