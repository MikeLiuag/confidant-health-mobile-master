import React, { Component } from "react";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import { View, Text } from "native-base";
import {Colors, CommonStyles, TextStyles} from "ch-mobile-shared";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import { S3_BUCKET_LINK } from "../../constants/CommonConstants";

export default class SingleChatbotItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.sectionWrapper}>
                <View style={styles.sectionCardStyle}>
                    {this.props?.avatar ?
                      <Image
                        style={styles.fullImage}
                        resizeMode="cover"
                        source={{uri: S3_BUCKET_LINK + this.props.avatar}}
                      />
                      :
                      <Image
                        style={styles.fullImage}
                        resizeMode="cover"
                        source={require('../../assets/images/group-dummy.png')}
                      />
                    }
                    <View style={{backgroundColor: Colors.colors.mediumContrastBG}}>
                        <ProgressBarAnimated
                            style={{width: '100%'}}
                            borderWidth={0}
                            width={241}
                            value={this.props.progressValue}
                            height={8}
                            backgroundColor={Colors.colors.mainPink}
                            backgroundColorOnComplete={Colors.colors.successIcon}
                            borderRadius={0}
                        />
                    </View>

                    <View style={styles.afterFullWrap}>
                        <Text style={styles.tokenText}>{this.props.tokenText}</Text>
                        <Text style={styles.mainTitle}>{this.props.mainTitle}</Text>
                        <Text style={styles.itemType}>{this.props.statusType}</Text>
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    sectionCardStyle: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        height: 235,
        width: 241,
        marginRight: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        position: 'relative'
    },
    fullImage: {
        height: 120,
        width: '100%',
    },
    afterFullWrap: {
        padding: 16
    },
    tokenText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8
    },
    mainTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 8
    },
    itemType: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular
    }
});
