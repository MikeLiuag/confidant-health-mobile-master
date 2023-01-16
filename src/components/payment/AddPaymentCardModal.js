import React, {Component} from 'react';
import {addTestID, Colors, CommonStyles, isIphoneX, PrimaryButton, TextStyles} from 'ch-mobile-shared';
import {Content, Text, View} from 'native-base';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {CreditCardInput} from './react-native-credit-card-input';
import Modal from 'react-native-modalbox';

export class AddPaymentCardModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cardData: {valid: false},
        }
    }

    render() {
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                onClosed={this.props.onClose}
                style={{
                    ...CommonStyles.styles.commonModalWrapper,
                    maxHeight: 490,
                    backgroundColor: Colors.colors.screenBG
                }}
                isOpen={this.props.isOpen}
                entry={"bottom"}
                position={"bottom"} swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}
                      {...addTestID('swipeBar')}
                />
                <KeyboardAvoidingView
                    style={{flex: 1, bottom: 0}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Content showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalHeader}>Add new card</Text>
                        <CreditCardInput
                            {...addTestID("CVC-input")}
                            // autoFocus
                            requiresName
                            requiresCVC
                            requiresPostalCode
                            additionalInputsProps={{
                                cvc: {
                                    textContentType: "password",
                                    secureTextEntry: true,
                                },
                            }}
                            labelStyle={styles.label}
                            inputStyle={styles.input}
                            inputContainerStyle={styles.inputContainer}
                            validColor={Colors.colors.primaryText}
                            invalidColor={Colors.colors.errorIcon}
                            placeholderColor={"#fff"}
                            cardScale={1}
                            cardFontFamily="Roboto-Regular"
                            allowScroll={false}
                            onChange={(cardData) => {
                                this.setState({cardData});
                            }

                            }/>
                    </Content>
                  <View style = {{ marginBottom : isIphoneX()? 34 : 24 }}>
                    <PrimaryButton
                        disabled={!this.state.cardData.valid}
                        onPress={() => this.props.onSubmit(this.state.cardData)}
                        testId="add-card"
                        text="Add card"
                    />
                  </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }

}
const styles = StyleSheet.create({

    modalHeader: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginTop: 8,
        textAlign: 'center'
    },
})
