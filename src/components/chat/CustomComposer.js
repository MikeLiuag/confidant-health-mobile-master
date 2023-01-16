import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
const styles = StyleSheet.create({
    textInput: {
        flex: 1,
        marginLeft: 50,
        marginRight:20,
        fontSize: 13,
        lineHeight: 17,
        height: 42,
        borderWidth: 0.5,
        borderColor: '#CFCCCC',
        borderRadius: 90,
        paddingLeft: 15,
        color: '#444',
        paddingTop: Platform.OS === 'ios'? 0 : 12,
        marginTop: Platform.select({
            ios: 8,
            android: 10,
        }),
        marginBottom: Platform.select({
            ios: 8,
            android: 10,
        }),
    },
});

export default class CustomComposer extends React.Component {
    constructor() {
        super(...arguments);
        this.contentSize = undefined;
        this.onContentSizeChange = (e) => {
            const { contentSize } = e.nativeEvent;
            // Support earlier versions of React Native on Android.
            if (!contentSize) {
                return;
            }
            if (!this.contentSize ||
                (this.contentSize &&
                    (this.contentSize.width !== contentSize.width ||
                        this.contentSize.height !== contentSize.height))) {
                this.contentSize = contentSize;
                this.props.onInputSizeChanged(this.contentSize);
            }
        };
        this.onChangeText = (text) => {
            this.props.onTextChanged(text);
        };
    }
    render() {
        return (<TextInput testID={this.props.placeholder} accessible
                           accessibilityLabel={this.props.placeholder}
                           autoCorrect={false}
                           placeholder={this.props.placeholder} placeholderTextColor={'#999'}
                           multiline={this.props.multiline} onChange={this.onContentSizeChange} onContentSizeChange={this.onContentSizeChange}
                           onChangeText={this.onChangeText} style={[
            styles.textInput,
            this.props.textInputStyle,
            // { height: this.props.composerHeight },
        ]} autoFocus={this.props.textInputAutoFocus} value={this.props.text} enablesReturnKeyAutomatically
                           underlineColorAndroid='transparent' keyboardAppearance={this.props.keyboardAppearance} {...this.props.textInputProps}/>);
    }
}
CustomComposer.defaultProps = {
    composerHeight: 100,
    text: '',
    placeholderTextColor: "#666",
    textInputProps: null,
    multiline: false,
    textInputStyle: {},
    textInputAutoFocus: false,
    keyboardAppearance: 'default',
    onTextChanged: () => { },
    onInputSizeChanged: () => { },
};
CustomComposer.propTypes = {
    composerHeight: PropTypes.number,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    textInputProps: PropTypes.object,
    onTextChanged: PropTypes.func,
    onInputSizeChanged: PropTypes.func,
    multiline: PropTypes.bool,
    textInputStyle: PropTypes.any,
    textInputAutoFocus: PropTypes.bool,
    keyboardAppearance: PropTypes.string,
};
//# sourceMappingURL=Composer.js.maps
