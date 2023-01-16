import React, { Component } from "react";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import { View, Text } from "native-base";
import {Colors, CommonStyles, TextStyles} from "ch-mobile-shared";
import AntIcon from "react-native-vector-icons/AntDesign";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";

export default class SingleGroupItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.sectionWrapper}>
                <View style={styles.sectionCardStyle}>

                    {this.props.groupImage ?
                        <Image
                            style={styles.fullImage}
                            resizeMode="cover"
                            source={{uri: S3_BUCKET_LINK + this.props.groupImage}}
                        />
                        :
                        <Image
                            style={styles.fullImage}
                            resizeMode="cover"
                            source={require('../../assets/images/default-group.png')}
                        />
                    }
                    <View style={styles.contentWrapper}>
                        <View style={{flex: 1}}>
                            <Text style={styles.mainTitle}>{this.props.mainTitle}</Text>
                            <Text style={styles.itemType}>{this.props.statusType}</Text>
                        </View>
                        <View>
                            <AntIcon style={styles.tickIcon}
                                     color={Colors.colors.successIcon}
                                     size={24}
                                     name='checkcircle' />
                        </View>
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
        height: 197,
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
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
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
