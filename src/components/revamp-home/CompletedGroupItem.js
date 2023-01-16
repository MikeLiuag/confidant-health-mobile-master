import React, { Component } from "react";
import { StyleSheet, TouchableOpacity} from "react-native";
import { View, Text } from "native-base";
import {Colors, CommonStyles, TextStyles, PrimaryButton} from "ch-mobile-shared";

export default class CompletedGroupItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.sectionWrapper}>
                <View style={styles.sectionCardStyle}>
                    <View style={styles.textWrap}>
                        <Text style={styles.tokenText} numberOfLines = {1} >{this.props.tokenText}</Text>
                        <Text style={styles.mainTitle} numberOfLines = {1}>{this.props.mainTitle}</Text>
                        <Text style={styles.itemType} numberOfLines = {1}>{this.props.sessionTime}</Text>
                    </View>
                    {
                        this.props.btnText && (
                            <View style={styles.btnWrap}>
                                <PrimaryButton
                                    textColor={Colors.colors.primaryText}
                                    bgColor={Colors.colors.mainBlue10}
                                    text={this.props.btnText}
                                    onPress = {()=>{}}
                                />
                            </View>
                        )
                    }
                    {
                        this.props.scheduleTime && (
                            <View style={styles.scheduleWrap}>
                                <Text style={styles.scheduleText}>{this.props.scheduleTime}</Text>
                            </View>
                        )
                    }
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    sectionCardStyle: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        // height: 199,
        width: 241,
        marginRight: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        position: 'relative'
    },
    textWrap: {
        paddingTop: 24,
        paddingHorizontal: 24
    },
    btnWrap: {
        paddingHorizontal: 24,
        paddingBottom: 24
    },
    tokenText: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
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
        ...TextStyles.mediaTexts.manropeRegular,
        marginBottom: 24
    },
    scheduleWrap: {
        backgroundColor: Colors.colors.secondaryText,
        width: '100%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12
    },
    scheduleText: {
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        textAlign: 'center'
    }
});
