import React, { Component } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "native-base";
import {
    Colors,
    CommonStyles,
    TextStyles
} from "ch-mobile-shared";
import AntIcons from "react-native-vector-icons/AntDesign";
import FeatherIcons from "react-native-vector-icons/Feather";

export default class GenericViewAllCard extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    render() {
        return (
            <View style={styles.sectionWrapper}>
                    <View style={styles.iconWrap}>
                        <AntIcons name={'rightcircle'} size={40} color={Colors.colors.primaryIcon}/>
                    </View>
                    <Text style={styles.iconText}>All {this.props.allText}</Text>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    sectionWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: "center"
    },
    iconText: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginTop: 16
    }
});
