import React, { Component } from "react";
import {Image, StyleSheet } from "react-native";
import { View, Text } from "native-base";
import {Colors, TextStyles } from "ch-mobile-shared";

export default class SingleMindBodyItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.rowOne}>
                <View style={{ flex: 1}}>
                    <Text style={styles.mainHead}>{this.props.itemName}</Text>
                    <Text style={styles.mainSub}>{this.props.itemStatus}</Text>
                </View>
                <View>
                    <Image
                        style={styles.itemIcon}
                        source={this.props.itemImg}
                        resizeMode={"contain"} />
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    rowOne: {
        padding: 24,
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: "center",
        borderBottomColor: Colors.colors.mediumContrastBG
    },
    mainHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 8,
        textTransform: 'capitalize'
    },
    mainSub: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular
    },
    itemIcon : {
        width: 40,
        height: 40
    }
});
