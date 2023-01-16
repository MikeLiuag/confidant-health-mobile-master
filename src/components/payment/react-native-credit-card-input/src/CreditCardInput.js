import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
    NativeModules,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TextInput,
    Image,
    ViewPropTypes,
} from 'react-native';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CreditCard from './CardView';
import CCInput from './CCInput';
import {InjectedProps} from './connectToState';
import {Button} from 'native-base';
import {addTestID, Colors, TextStyles, CommonStyles } from "ch-mobile-shared";

const s = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    form: {
        marginTop: 20,
        width: '100%',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
        // borderWidth: 1,
        // borderColor: Colors.colors.highContrastBG,
    },
    inputLabel: {
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText
    },
    input: {
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.inputText
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconRow: {
        position: 'relative',
    },
    cardIcon: {
        position: 'absolute',
        right: 16,
        top: 30,
    },
    cardImg: {
        position: 'absolute',
        right: 16,
        top: 30,
        width: 24,
        height: 24,
    },
});

const CVC_INPUT_WIDTH = 88;
const EXPIRY_INPUT_WIDTH = 102;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const CARD_NUMBER_INPUT_WIDTH = Dimensions.get('window').width - EXPIRY_INPUT_WIDTH - CARD_NUMBER_INPUT_WIDTH_OFFSET;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 105;

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            startNumber: 0,
        };
    }

    static propTypes = {
        ...InjectedProps,
        labels: PropTypes.object,
        placeholders: PropTypes.object,

        labelStyle: Text.propTypes.style,
        inputStyle: Text.propTypes.style,
        inputContainerStyle: ViewPropTypes.style,

        validColor: PropTypes.string,
        invalidColor: PropTypes.string,
        placeholderColor: PropTypes.string,

        cardImageFront: PropTypes.number,
        cardImageBack: PropTypes.number,
        cardScale: PropTypes.number,
        cardFontFamily: PropTypes.string,
        cardBrandIcons: PropTypes.object,

        allowScroll: PropTypes.bool,

        additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
    };

    static defaultProps = {
        cardViewSize: {},
        labels: {
            number: 'Card number',
            name: 'Cardholder Name',
            expiry: 'Expiration',
            cvc: 'CVC',
            postalCode: 'Billing zip',
        },
        placeholders: {
            name: 'Full Name',
            number: '1234 5678 1234 5678',
            expiry: 'MM/YY',
            cvc: 'CVC',
            postalCode: '345678',
        },
        inputContainerStyle: {
            borderWidth: 1,
            borderColor: Colors.colors.highContrastBG,
            ...CommonStyles.styles.shadowBox
        },
        validColor: Colors.colors.highContrast,
        invalidColor: Colors.colors.errorIcon,
        placeholderColor: Colors.colors.mediumContrast,
        allowScroll: false,
        additionalInputsProps: {},
    };

    componentDidMount = () => this._focus(this.props.focused);

    componentWillReceiveProps = newProps => {
        if (this.props.focused !== newProps.focused) {
            this._focus(newProps.focused);
        }
    };

    _focus = field => {
        if (!field) {
            return;
        }

        const scrollResponder = this.refs?.Form.getScrollResponder();
        const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

        NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
            e => {
                throw e;
            },
            x => {
                scrollResponder.scrollTo({x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true});
                this.refs[field].focus();
            });
    };

    _inputProps = field => {
        const {
            inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
            placeholders, labels, values, status,
            onFocus, onChange, onBecomeEmpty, onBecomeValid,
            additionalInputsProps,
        } = this.props;

        return {
            inputStyle: [s.input, inputStyle],
            labelStyle: [s.inputLabel, labelStyle],
            validColor, invalidColor, placeholderColor,
            ref: field, field,

            label: labels[field],
            placeholder: placeholders[field],
            value: values[field],
            status: status[field],

            onFocus, onChange, onBecomeEmpty, onBecomeValid,

            additionalInputProps: additionalInputsProps[field],
        };
    };

    renderVendorImage = () => {
        const {startNumber} = this.state;

        switch (startNumber) {
            case 3:
                return (<Image
                    {...addTestID('Amex-png')}
                    style={s.cardImg}
                    resizeMode="contain"
                    source={require('../images/amex.png')}/>);
            case 4:
                return (<Image
                    {...addTestID('Visa-png')}
                    style={s.cardImg}
                    resizeMode="contain"
                    source={require('../images/visa.png')}/>);
            case 5:
                return (<Image
                    {...addTestID('Master-png')}
                    style={s.cardImg}
                    resizeMode="contain"
                    source={require('../images/master.png')}/>);
            case 6:
                return (<Image
                    {...addTestID('Discover-png')}
                    style={s.cardImg}
                    resizeMode="contain"
                    source={require('../images/discover.png')}/>);
            default:
                return (<AwesomeIcon
                    style={s.cardIcon}
                    name="credit-card" size={24} color={Colors.colors.primaryIcon} />);
        }
    };

    render() {
        const {
            cardImageFront, cardImageBack, inputContainerStyle,
            values: {number, expiry, cvc, name, type}, focused,
            allowScroll, requiresName, requiresCVC, requiresPostalCode,
            cardScale, cardFontFamily, cardBrandIcons,
        } = this.props;

        return (
            <View style={s.container}>
                {/*<CreditCard focused={focused}*/}
                {/*  brand={type}*/}
                {/*  scale={cardScale}*/}
                {/*  fontFamily={cardFontFamily}*/}
                {/*  imageFront={cardImageFront}*/}
                {/*  imageBack={cardImageBack}*/}
                {/*  customIcons={cardBrandIcons}*/}
                {/*  name={requiresName ? name : " "}*/}
                {/*  number={number}*/}
                {/*  expiry={expiry}*/}
                {/*  cvc={cvc} />*/}
                <ScrollView ref="Form"
                            keyboardShouldPersistTaps="always"
                            // scrollEnabled={allowScroll}
                            showsHorizontalScrollIndicator={false}
                            style={s.form}>

                    {requiresName &&
                    <CCInput
                        {...addTestID('cardholder-name-input')}
                        {...this._inputProps('name')}
                        containerStyle={[s.inputContainer, inputContainerStyle]}/>}
                    <View style={s.iconRow}>
                        <CCInput {...addTestID('number-input')}
                            {...this._inputProps('number')}
                                 keyboardType="numeric"
                                 onChange={(cardData, value) => {
                                     let startNumber = parseInt((value + '').charAt(0));
                                     if (isNaN(startNumber)) {
                                         startNumber = 0;
                                     }
                                     this.setState({
                                         startNumber: startNumber,
                                     });
                                     this.props.onChange(cardData, value);
                                 }}
                                 containerStyle={[s.inputContainer, inputContainerStyle]}/>
                        {this.renderVendorImage()}
                    </View>
                    <View style={s.fieldRow}>
                        <CCInput {...addTestID('expiry-input')}
                                 {...this._inputProps('expiry')}
                                 keyboardType="numeric"
                                 containerStyle={[s.inputContainer, inputContainerStyle, {width: EXPIRY_INPUT_WIDTH}]}/>
                        {requiresCVC &&
                        <CCInput {...addTestID('cvc-input')}
                                 {...this._inputProps('cvc')}
                                 keyboardType="numeric"
                                 containerStyle={[s.inputContainer, inputContainerStyle, {width: CVC_INPUT_WIDTH}]}/>}
                        {requiresPostalCode &&
                        <CCInput {...addTestID('postalCode-input')}
                                 {...this._inputProps('postalCode')}
                                 keyboardType="numeric"
                                 containerStyle={[s.inputContainer, inputContainerStyle, {width: POSTAL_CODE_INPUT_WIDTH}]}/>}
                    </View>
                </ScrollView>
            </View>
        );
    }
}
