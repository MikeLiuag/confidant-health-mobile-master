import React, { Component } from "react";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import { View, Text } from "native-base";
import {Colors, CommonStyles, TextStyles, PrimaryButton} from "ch-mobile-shared";
import AntIcon from "react-native-vector-icons/AntDesign";

export default class SingleActivityItem extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.sectionWrapper}>
              <View style={styles.rowOne}>
                    <View style={{ flex: 1}}>
                        <Text style={styles.mainHead}>{this.props.activityTitle}</Text>
                        <Text style={styles.mainSub}>{this.props.activityTime}</Text>
                    </View>
                  <View>
                      <Image
                          style={[styles.sectionImg]}
                          source={this.props.activityImg}
                          resizeMode={"contain"} />
                  </View>
              </View>
              <View style={styles.rowTwo}>
                    <View style={styles.pleasureWrap}>
                        <Text style={[styles.pleasureNum,
                            { color: this.props.pleasureColor, backgroundColor: this.props.pleasureBG}]}>{this.props.pleasure}</Text>
                        <Text style={[styles.pleasureText, { color: this.props.pleasureColor}]}>Pleasure</Text>
                    </View>
                  {
                      this.props.aligned === true
                          ?
                          <View style={styles.alignWrap}>
                              <Text style={styles.alignText}>Aligned</Text>
                              <AntIcon style={styles.sectionIcon}
                                       color={Colors.colors.successIcon}
                                       size={24}
                                       name='checkcircle' />
                          </View>
                          :this.props.aligned === false ?
                          <View style={styles.alignWrap}>
                              <Text style={styles.notAlignText}>Not aligned</Text>
                              <AntIcon style={styles.sectionIcon}
                                       color={Colors.colors.mediumContrast}
                                       size={24}
                                       name='closecircleo' />
                          </View>
                          : <View style={styles.alignWrap}>
                                  <Text style={styles.notAlignText}>I'm not sure</Text>
                                  <AntIcon style={styles.sectionIcon}
                                           color={Colors.colors.mediumContrast}
                                           size={24}
                                           name='questioncircleo' />
                              </View>
                  }
              </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    sectionWrapper: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        justifyContent: 'center',
        marginBottom: 16
    },
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
        marginBottom: 8
    },
    mainSub: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular
    },
    sectionImg: {
        width: 64,
        height: 64
    },
    rowTwo: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center'
    },
    pleasureWrap: {
        flexDirection: "row",
        alignItems: 'center'
    },
    pleasureNum: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: "hidden",
        textAlign: "center",
        lineHeight: 32
    },
    pleasureText: {
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        paddingLeft: 8
    },
    alignWrap: {
        flexDirection: "row",
        alignItems: 'center'
    },
    alignText: {
        color: Colors.colors.successText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginRight: 8
    },
    notAlignText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginRight: 8
    }
});
