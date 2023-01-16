import React from 'react';
import {Image, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {
    Text, View
} from 'native-base';
import {Colors, CommonStyles, TextStyles, valueExists} from "ch-mobile-shared";
import {DEFAULT_GROUP_IMAGE, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {getTimeFromMilitaryStamp} from "ch-mobile-shared/src/utilities";

export class CommonGroupCard extends React.PureComponent {

    constructor(props) {
        super(props);
        this.groupDetails = this.props.groupDetails;
    }


    renderGroupTags = () => {
        const {groupTags} = this.groupDetails;
        return (
            groupTags?.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}>
                    <View style={styles.groupTags}>
                        {groupTags?.map(groupTag => {
                            return (
                                <View style={styles.singleTag}>
                                    <Text style={styles.tagText}>{groupTag}</Text>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            )
        )
    }

    render() {
        return(
            <TouchableOpacity
                onPress={()=>{
                    this.props.onPress(this.groupDetails)
                }}
                style={styles.singleGroup}>
                <View>
                    {this.groupDetails?.joinedGroup && <Image
                        style={styles.joinImg}
                        source={require('../../assets/images/joined-tag.png')}
                    />
                    }
                    <Image
                        style={styles.groupImg}
                        resizeMode={'cover'}
                        source={{uri: this.groupDetails.groupImage ? S3_BUCKET_LINK + this.groupDetails.groupImage : S3_BUCKET_LINK + DEFAULT_GROUP_IMAGE}}
                    />
                </View>
                <View style={styles.groupContent}>
                    <Text style={styles.groupMainTitle}>{this.groupDetails.name}</Text>
                    <View style={styles.timeTypeWrap}>
                        {this.groupDetails?.meetings && this.groupDetails?.meetings.length > 0 && (
                            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                <Text
                                    style={styles.timeText}>{this.groupDetails?.meetings[0].day} {getTimeFromMilitaryStamp(this.groupDetails?.meetings[0].meetingStartTime).desc}
                                    {'-'}{getTimeFromMilitaryStamp(this.groupDetails?.meetings[0].meetingEndTime).desc}</Text>
                                {/*<View style={styles.greyDot}/>*/}
                            </View>
                        )}
                        { this.groupDetails.isGroupAnonymous && (
                            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                {
                                    this.groupDetails?.meetings && this.groupDetails?.meetings.length > 0 &&
                                    <View style={styles.greyDot}/>
                                }
                                <Text style={styles.anonymousText}>Anonymous group</Text>
                            </View>
                        )}

                    </View>
                    {this.groupDetails?.groupTags?.length > 0 && this.renderGroupTags()}
                    { valueExists(this.groupDetails?.groupDescription) &&  (
                        <Text numberOfLines={3} style={styles.groupDes}>{this.groupDetails?.groupDescription}</Text>
                    )}

                    { this.props.totalMembers && <View style={styles.totalMembers}>
                        <Image
                            style={styles.anonymousIcon}
                            source={require('../../assets/images/anonymous-icon.png')}/>
                        <Text style={styles.memberText}>{this.groupDetails?.joinedMembersCount} group members</Text>
                    </View>}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    singleGroup: {
        borderRadius: 12,
        ...CommonStyles.styles.shadowBox,
        marginVertical: 16,
        borderWidth: 0.5,
        overflow: 'hidden',
        position: 'relative'
    },
    joinImg: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10
    },
    groupImg: {
        height: 160,
        width: '100%'
    },
    groupContent: {
        paddingVertical: 24
    },
    groupMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        paddingHorizontal: 24
    },
    timeTypeWrap: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast
    },
    greyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.neutral50Icon,
        marginHorizontal: 8
    },
    anonymousText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast
    },
    groupTags: {
        marginVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center'
    },
    singleTag: {
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginRight: 4
    },
    tagText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast
    },
    groupDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        paddingHorizontal: 24
    },
    totalMembers: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 16
    },
    anonymousIcon: {
        marginRight: 12,
        width: 48,
        height: 48
    },
    memberText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText
    },
});
