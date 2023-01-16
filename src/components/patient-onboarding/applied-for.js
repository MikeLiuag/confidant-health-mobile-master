import React, { Component } from 'react';
import { Text, Button, View } from "native-base";
import { StyleSheet} from 'react-native';
import { Colors, Buttons } from '../../styles';
import { Row } from 'react-native-easy-grid';
import LinearGradient from 'react-native-linear-gradient';
import AntIcon from 'react-native-vector-icons/AntDesign';

import {APPLIED_FOR_MYSELF, APPLIED_FOR_SOMEONEELSE} from "../../constants/CommonConstants";

/**
 * Class to display if user is registering for themselves or someone else
 *
 * @class AppliedFor
 * @extends Component
 */
export default class AppliedFor extends Component{
    constructor(props) {
        super(props);

        this.state = {
            isAppliedForMyself: props.appliedFor === APPLIED_FOR_MYSELF
        };
    }

    /**
     * Set appliedFor value and send value to parent component
     *
     * @event _onPressButton
     * @return {value} selectedGender
     */
    _onPressButton(value) {
        this.setState({
            isAppliedForMyself: value
        });

        // SEND RESPONSE BACK TO PATIENT ON BOARDING SCREEN
        this.props.onChoiceSelected(value ? APPLIED_FOR_MYSELF : APPLIED_FOR_SOMEONEELSE);
    }

    /**
     * Set the gradient of icon when tapped on the specific icon
     *
     * @event setGradientStyle
     * @return style to render
     */
    setGradientStyle(isMyself) {
        if (isMyself) {
            return this.state.isAppliedForMyself ? ['#4FACFE', '#34b6fe', '#00C8FE'] : ['#EDEDF7', '#EDEDF7', '#EDEDF7']
        } else {
            return !this.state.isAppliedForMyself ? ['#4FACFE', '#34b6fe', '#00C8FE'] : ['#EDEDF7', '#EDEDF7', '#EDEDF7']
        }
    }

    render() {
        return (
                <Row size={70} style={ POBstyles.userBlock }>
                    <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={this.setGradientStyle(true)}
                                    style={ POBstyles.roundBtnBGUser }>
                        <Button transparent style={ POBstyles.roundBtnSelected } onPress={() => this._onPressButton(true)}>
                            <AntIcon name="user" size={36} color={ this.state.isAppliedForMyself? "#fff" : "#222222"} />
                            <Text uppercase={false} style={ this.state.isAppliedForMyself ? POBstyles.roundText : POBstyles.roundTextBlack}>Myself</Text>
                        </Button>
                    </LinearGradient>

                    <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={this.setGradientStyle(false)}
                                    style={ POBstyles.roundBtnBGUser }>
                        <Button transparent style={ POBstyles.roundBtnSelected } onPress={() => this._onPressButton(false)}>
                            <View style={ POBstyles.elseIcons}>
                                <AntIcon name="user" size={36} color={ this.state.isAppliedForMyself? "#222" : "#FFF"} />
                                <AntIcon name="user" size={36} style={{ marginLeft: -14}} color={ this.state.isAppliedForMyself? "#222" : "#FFF"} />
                            </View>
                            <Text uppercase={false} style={ !this.state.isAppliedForMyself ? POBstyles.roundText : POBstyles.roundTextBlack }>Someone Else</Text>
                        </Button>
                    </LinearGradient>
                </Row>
        )
    }
}

const POBstyles = StyleSheet.create({
    userBlock: {
        display: 'flex',
        justifyContent: 'space-evenly',
        paddingTop: 50,
    },
    roundBtnBGUser: {
        ...Buttons.mediaButtons.roundBtn,
    },
    roundBtnBG: {
        ...Buttons.mediaButtons.roundBtn,
        margin: 5,
    },
    roundBtnSelected: {
        ...Buttons.mediaButtons.roundBtn,
        backgroundColor: 'transparent',
    },
    roundText: {
        ...Buttons.mediaButtons.roundText,
        color: Colors.colors.whiteColor,
    },
    roundTextBlack: {
        ...Buttons.mediaButtons.roundText,
        color: Colors.colors.darkText,
    },
    elseIcons: {
        display: 'flex',
        flexDirection: 'row',
    }
});
