import React, {Component} from "react";
import {StyleSheet} from "react-native";
import {ListItem, Text} from "native-base";
import {addTestID, Colors, TextStyles} from 'ch-mobile-shared';
import FeatherIcons from 'react-native-vector-icons/Feather';

export class SingleAccordionItem extends Component<Props> {
    render() {
        return (
            <ListItem
                {...addTestID(this.props.listTestId)}
                key={this.props.keyId}
                onPress={this.props.listPress}
                style={this.props.itemSelected
                    ? styles.multiListSelected
                    : styles.multiList}
            >
                <Text
                    style={
                        this.props.itemSelected
                            ? styles.multiListTextSelected
                            : styles.multiListText
                    }>
                    {this.props.itemTitle}
                </Text>
                {this.props.itemSelected &&
                <FeatherIcons
                    size={24}
                    color={Colors.colors.mainBlue}
                    name="check"/>
                }
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    multiList: {
        borderBottomWidth: 0,
        borderColor: Colors.colors.mediumContrastBG,
        marginLeft: 0,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 24,
        borderRadius: 8,
    },
    multiListSelected: {
        borderBottomWidth: 0,
        borderColor: Colors.colors.mediumContrastBG,
        backgroundColor: Colors.colors.mainBlue05,
        marginLeft: 0,
        paddingRight: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    multiListText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        paddingRight: 24,
        paddingLeft: 24,
        flex: 1
    },
    multiListTextSelected: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mainBlue,
        paddingRight: 24,
        paddingLeft: 24,
        flex: 1
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4,
        backgroundColor: 'red',
        color: Colors.colors.mainBlue
    },
    multiCheckSelected: {
        borderWidth: 0,
        color: Colors.colors.mainBlue,

        // borderColor: Colors.colors.mainBlue,

    }
});
