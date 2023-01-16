import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {
    Button,
    Icon,
    Text, View
} from 'native-base';
import {Colors, CommonStyles, S3_BUCKET_LINK,DEFAULT_IMAGE, TextStyles} from "ch-mobile-shared";

export class CommonMemberCard extends React.PureComponent {

    render() {
        const {member} = this.props;
        return(
            <TouchableOpacity
                onPress={this.props.onPress}
                style={styles.singleMemberBox}>
                <View style={styles.colorImgBG}>
                    <Image
                        style={styles.personImg}
                        resizeMode={'cover'}
                        source={{uri : member?.profilePicture ? S3_BUCKET_LINK + member?.profilePicture : S3_BUCKET_LINK + DEFAULT_IMAGE}}  />
                </View>
                <View style={styles.personDetails}>
                    <Text style={styles.infoTitle}>{member?.name}</Text>
                    <Text style={styles.infoContent}>{member?.userType}</Text>
                </View>
                <Button
                    style={styles.rightBtn}
                    transparent
                    onPress = {this.props.onPress}
                >
                    <Icon onPress = {this.props.onPress} style={styles.rightIcon} type={'SimpleLineIcons'} name="arrow-right"/>
                </Button>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    singleMemberBox: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8
    },
    colorImgBG: {
        width: 48,
        height: 48,
        position: 'relative',
        marginRight: 12
    },
    personImg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderColor: Colors.colors.highContrastBG,
        borderWidth: 1
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.colors.successIcon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: 2
    },
    personDetails: {
        flex: 1
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    rightBtn: {
        paddingRight: 0,
        marginRight: 0
    },
    rightIcon: {
        fontSize: 24,
        color: Colors.colors.primaryIcon,
    }
});
