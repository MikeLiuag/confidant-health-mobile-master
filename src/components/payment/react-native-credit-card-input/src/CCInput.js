import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewPropTypes,
    Platform
} from "react-native";
import {Colors, TextStyles, CommonStyles } from "ch-mobile-shared";
import Instabug from 'instabug-reactnative';

const s = StyleSheet.create({
  baseInputStyle: {
    ...TextStyles.mediaTexts.manropeRegular,
    color: Colors.colors.highContrast,
    ...TextStyles.mediaTexts.inputText,
    lineHeight: 21,
    height: 37
  },
  inputBox: {
    ...CommonStyles.styles.headerShadow,
    // borderColor: Colors.colors.highContrastBG,
    // shadowColor: Colors.colors.highContrastBG,
    // borderWidth: 1,
    backgroundColor: Colors.colors.white,
    paddingHorizontal: 16,
    paddingTop: 9,
    borderRadius: 8,
    marginBottom: 16
  },
  inputBoxValid: {
    ...CommonStyles.styles.headerShadow,
    // borderColor: Colors.colors.highContrastBG,
    // shadowColor: Colors.colors.highContrastBG,
    // borderWidth: 1,
    backgroundColor: Colors.colors.white,
    paddingHorizontal: 16,
    paddingTop: 9,
    borderRadius: 8,
    marginBottom: 16
  }
});

export default class CCInput extends Component {
  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,

    status: PropTypes.oneOf(["valid", "invalid", "incomplete"]),

    containerStyle: ViewPropTypes.style,
    inputStyle: Text.propTypes.style,
    labelStyle: Text.propTypes.style,
    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
    additionalInputProps: PropTypes.shape(TextInput.propTypes),
  };

  static defaultProps = {
    label: "",
    value: "",
    status: "incomplete",
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
    additionalInputProps: {},
  };

  constructor(props) {
    super(props);
    this.inputView = null;
  }


  componentWillReceiveProps = newProps => {
    const { status, value, onBecomeEmpty, onBecomeValid, field } = this.props;
    const { status: newStatus, value: newValue } = newProps;

    if (value !== "" && newValue === "") onBecomeEmpty(field);
    if (status !== "valid" && newStatus === "valid") onBecomeValid(field);
  };

  focus = () => {if(this.inputView){this.inputView.focus();}};

  privatizeView = (view)=>{
    if(this.props.field==='number' || this.props.field==='cvc') {
      if(view) {
        Platform.OS === 'ios'? Instabug.setPrivateView(view) : null;
      }
    }
  };

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = value => this.props.onChange(this.props.field, value);

  render() {
    let { label, value, placeholder, status, keyboardType,
            containerStyle, inputStyle, labelStyle,
            validColor, invalidColor, placeholderColor,
            additionalInputProps } = this.props;
    if(this.props.field==='cvc') {
      labelStyle =  [...labelStyle, {textTransform: 'uppercase'}];
    }
    return (
      <TouchableOpacity onPress={this.focus}
        activeOpacity={0.99}>
        <View style={(validColor && status === "valid") ?
            [s.inputBoxValid, ...containerStyle] : [s.inputBox, ...containerStyle]}>
          { !!label && <Text style={(validColor && status === "valid")  ? [labelStyle, { color: Colors.colors.highContrast}] : [labelStyle]}>{
            this.props.field==='postalCode'?'Billing':label
          } {this.props.field==='postalCode' && (<Text style={{textTransform: 'uppercase'}}>ZIP</Text>)}</Text>}
          <TextInput ref={c => {
            this.inputView = c;
            this.privatizeView(c);
          }}
            {...additionalInputProps}
            keyboardType={keyboardType}
            autoCapitalise="words"
            autoCorrect={false}
            style={[
              s.baseInputStyle,
              inputStyle,
              ((validColor && status === "valid") ? { color: validColor } :
              (invalidColor && status === "invalid") ? { color: invalidColor } :
              {}),
            ]}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={placeholderColor}
            placeholder={placeholder}
            value={value}
            onFocus={this._onFocus}
            onChangeText={this._onChange} />
        </View>
      </TouchableOpacity>
    );
  }
}
