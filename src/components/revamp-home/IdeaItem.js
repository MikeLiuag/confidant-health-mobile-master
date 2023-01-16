import React, { Component } from "react";
import {Image, StyleSheet } from "react-native";
import { View, Text } from "native-base";
import {Colors, TextStyles } from "ch-mobile-shared";

export default class IdeaItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.ideaRow}>
                <View>
                    <Image
                        style={[styles.sectionImg]}
                        source={require("../../assets/images/idea-icon.png")}
                        resizeMode={"contain"} />
                </View>
                <View style={{ flex: 1}}>
                    <Text style={styles.ideaText}>You are doing better this week compared to a previous one.</Text>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    ideaRow: {
        paddingHorizontal: 40,
        paddingVertical: 24,
        flexDirection: 'row',
        backgroundColor: Colors.colors.mediumContrastBG,
        alignItems: "center"
    },
    ideaText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        paddingHorizontal: 24
    }
});
