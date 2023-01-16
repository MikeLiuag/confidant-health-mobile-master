import React, {Component} from "react";
import {StyleSheet} from 'react-native';
import {Content, Text, View} from "native-base";
import {Colors, CommonStyles, TextStyles, TransactionSingleActionItem} from "ch-mobile-shared";
import AntIcon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather";
import Modal from "react-native-modalbox";

export class PlanItemModal extends Component<Props> {
    render() {
        const {selectedPlanItem, screenDetails, openModal, activeSegmentId} = this.props;
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                isOpen={openModal}
                onClosed={() => {
                    this.props.closeModal()
                }}
                style={{
                    ...CommonStyles.styles.commonModalWrapper,
                    height:'auto',
                    position:'absolute',
                    padding:24
                }}
                entry={"bottom"}
                position={"bottom"}
                ref={'planItemModal'}
                swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}/>
                <Content>
                    <Text style={styles.modalHeading} numberOfLines={2}>{selectedPlanItem.planItem.name}</Text>
                    <View style={styles.actionList}>
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Remove from plan'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <AntIcon size={22} color={Colors.colors.errorIcon} name="delete"/>
                                }
                                onPress={() => {
                                    this.props.closeModal();
                                    this.props.removePlanItem();
                                }}
                            />
                        </View>
                        {
                            ((activeSegmentId === 'fullPlan'
                            && !selectedPlanItem.priority)
                            || (activeSegmentId === 'priority'))
                            && <View style={styles.btnOptions}>
                                <TransactionSingleActionItem
                                    title={`${selectedPlanItem.priority ? 'Remove from' : 'Add to'} Priorities`}
                                    iconBackground={Colors.colors.whiteColor}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <AntIcon size={22} color={selectedPlanItem.priority
                                            ? Colors.colors.errorIcon
                                            : Colors.colors.successIcon
                                        }
                                                 name={selectedPlanItem.priority ? "minuscircle" : "pluscircle"}/>
                                }
                                    onPress={() => {
                                        this.props.closeModal();
                                        this.props.addOrRemoveFromPriorities()
                                    }}
                                />
                            </View>
                        }
                        {screenDetails?.title && (
                            <View style={styles.btnOptions}>
                                <TransactionSingleActionItem
                                    title={`View ${screenDetails?.title}`}
                                    iconBackground={Colors.colors.whiteColor}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcon size={22} color={Colors.colors.primaryIcon} name="arrow-right"/>
                                    }
                                    onPress={() => {
                                        this.props.closeModal();
                                        screenDetails?.method();
                                    }}
                                />
                            </View>
                        )}
                    </View>
                </Content>

            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    btnOptions: {
        marginBottom: 8,
    },
    modalHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8
    }

})
