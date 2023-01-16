import React, { Component } from "react";
import {StyleSheet, TouchableOpacity} from "react-native";
import { View, Text } from "native-base";
import {Colors, CommonStyles, TextStyles} from "ch-mobile-shared";
import AntIcons from "react-native-vector-icons/AntDesign";
import FeatherIcons from "react-native-vector-icons/Feather";
import {PLAN_STATUS} from "../../constants/CommonConstants";

export default class GenericListItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <TouchableOpacity style={styles.sectionWrapper} onPress={()=>{this.props.navigateToScreen()}}>
                <View style={{...styles.sectionShape, backgroundColor: this.props.itemColor}}/>
                <View style={styles.sectionItem}>
                    <View style={styles.sectionItemContent}>
                        <View style={styles.sectionItemHeading}>
                            <Text style={{...styles.sectionItemHeadingText, color: this.props.itemColor }}>{PLAN_STATUS[this.props.headingText]?.value}</Text>
                            {this.props.headingSubText && (<Text style={styles.sectionItemHeadingSubText}>{this.props.headingSubText}</Text>)}
                        </View>
                        <Text style={styles.sectionItemContentText}>{this.props.mainText}</Text>
                    </View>
                    <View style={styles.sectionItemHeadingIconRed}>
                        {
                            this.props.iconType === 'AntIcon'?
                                <AntIcons name={this.props.iconName} size={28} color={this.props.shapeColor}
                                          onPress={()=>{this.props.performAction()}}/>
                                :
                                <FeatherIcons name={this.props.iconName} size={28} color={this.props.shapeColor}
                                              onPress={()=>{this.props.performAction()}}/>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
const styles = StyleSheet.create({
    sectionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    sectionShape: {
        width: 4,
        height: 40,
        backgroundColor: Colors.colors.primaryIcon,
        alignItems: 'center',
        marginLeft: 'auto',
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5
    },
    sectionItem: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        width: '100%',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.colors.white,
    },
    sectionItemHeading: {
        flexDirection: 'row',
        marginBottom: 4
    },
    sectionItemHeadingText: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.lowContrast
    },
    sectionItemHeadingSubText: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast,
        marginLeft: 8
    },
    sectionItemContent: {
        flexBasis: '80%',
    },
    sectionItemHeadingIconRed: {
        alignItems: 'center',
        justifyContent: "center",
    },
    sectionItemContentText : {}
});
