import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
} from 'react-native';
import {Text} from 'native-base';
import GradientButton from './GradientButton';
import Overlay from 'react-native-modal-overlay';
import {addTestID, isIphoneX} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import {
    DEFAULT_IMAGE,
    GET_CONNECTED_TO,
    S3_BUCKET_LINK,
    YOU_ARE_ON_TAKING_A_GREAT_STEP
} from "../constants/CommonConstants";

export default class ProviderConnectOverlay extends Component<Props> {
    constructor(props) {
        super(props);
    }

    render(): React.ReactNode  {
        return(
            <Overlay
                containerStyle={styles.overlayBG}
                childrenWrapperStyle={styles.pendingWrapper}
                visible={this.props.modalVisible}
                onClose={this.props.closeOverlay}
                closeOnTouchOutside>
                <View style={{width: '100%'}}>
                    <Text style={styles.pendingTitle}>{GET_CONNECTED_TO}</Text>
                    <Text style={styles.pendingSubTitle}>{this.props.branchOverlySubTitle}</Text>
                    <Text style={styles.pendingDes}
                          // adjustsFontSizeToFit={true}
                          numberOfLines={4}
                    >{this.props.branchOverlyDescription}</Text>

                    <View style={styles.proImagWrapper}>
                        <Image
                            style={styles.starImg}
                            resizeMode="contain"
                            source={require('../assets/images/stars.png')} />
                        <LinearGradient
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            colors={["#e73500", "#ff7f05", "#fbeb4b"]}
                            style={styles.greRing}
                        >

                            <Image
                                {...addTestID('Alfie-body-png')}
                                style={styles.providerImg}
                                resizeMode="cover"
                                source={{uri: this.props.branchOverlyImage ? S3_BUCKET_LINK + this.props.branchOverlyImage.replace('_thumbnail', '') : S3_BUCKET_LINK + DEFAULT_IMAGE}} />
                        </LinearGradient>
                    </View>
                    <GradientButton
                        testId = "continue"
                        onPress={this.props.connectionProvider}
                        text="Connect with Provider"
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
        marginBottom: 24
    },
    pendingDes: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.34,
        textAlign: 'justify',
        width: '100%',
        // maxHeight: 95,
        paddingLeft: 15,
        paddingRight: 15,
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
