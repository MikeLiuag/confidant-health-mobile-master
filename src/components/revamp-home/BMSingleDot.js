import React, { Component } from "react";
import {Image, StyleSheet } from "react-native";
import { View } from "native-base";
import {Colors } from "ch-mobile-shared";

export default class BMSingleDot extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={[styles.dotBorder,
                { borderColor: this.props.dotColor, borderWidth: this.props.inProgress? 1 : 0}]}>
                <View style={[styles.dotItself, { backgroundColor: this.props.dotColor }]}></View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    dotBorder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderColor: Colors.colors.neutral50Icon,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 3
    },
    dotItself: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.colors.neutral50Icon
    }
});
