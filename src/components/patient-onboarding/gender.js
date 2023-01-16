import React, { Component } from 'react';
import { Text, Button } from "native-base";
import { StyleSheet} from 'react-native';
import { Colors, Buttons } from '../../styles';
import { Row } from 'react-native-easy-grid';
import LinearGradient from 'react-native-linear-gradient';
import { View } from "native-base";
import {GENDER_FEMALE, GENDER_MALE, GENDER_OTHER} from "../../constants/CommonConstants";
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';


/**
 * Class to display the gender of the user
 *
 * @class Gender
 * @extends Component
 */
export default class Gender extends Component{
    constructor(props) {
        super(props);

        this.state = {
            gender: props.gender ? props.gender : GENDER_MALE
        };
    }

    /**
     * Set appliedFor value and send value to parent component
     *
     * @event _onPressButton
     * @return {value} selectedGender
     */
    _onPressButton(value) {
        this.setState({ gender: value });

        // SEND RESPONSE BACK TO PATIENT ON BOARDING SCREEN
        this.props.onChoiceSelected(value);
    }

    /**
     * Set the gradient of icon when tapped on the specific icon
     *
     * @event setGradientStyle
     * @return style to render
     */
    setGradientStyle(gender) {
        switch (gender) {
            case GENDER_MALE:
                return this.state.gender === GENDER_MALE ? ['#4FACFE', '#34b6fe', '#00C8FE'] : ['#EDEDF7', '#EDEDF7', '#EDEDF7'];
            case GENDER_FEMALE:
                return this.state.gender === GENDER_FEMALE ? ['#4FACFE', '#34b6fe', '#00C8FE'] : ['#EDEDF7', '#EDEDF7', '#EDEDF7'];
            case GENDER_OTHER:
                return this.state.gender === GENDER_OTHER ? ['#4FACFE', '#34b6fe', '#00C8FE'] : ['#EDEDF7', '#EDEDF7', '#EDEDF7'];
        }
    }

    render() {
        return (
        <Row size={70} style={ POBstyles.contentBlock }>
            <View>
                <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={this.setGradientStyle(GENDER_MALE)}
                                style={ POBstyles.roundBtnBG }>
                    <Button transparent style={ POBstyles.roundBtnSelected }  onPress={() => this._onPressButton(GENDER_MALE)}>
                        <AwesomeIcon name="mars" size={36} color={ this.state.gender === GENDER_MALE ? "#fff": "#222"}/>
                        <Text uppercase={false} style={ this.state.gender === GENDER_MALE ? POBstyles.roundText : POBstyles.roundTextBlack}>Male</Text>
                    </Button>
                </LinearGradient>

                <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={this.setGradientStyle(GENDER_FEMALE)}
                                style={ POBstyles.roundBtnBG }>
                <Button transparent style={ POBstyles.roundBtnSelected }  onPress={() => this._onPressButton(GENDER_FEMALE)}>
                    <AwesomeIcon name="venus" size={36} color={ this.state.gender === GENDER_FEMALE ? "#fff": "#222"}/>
                    <Text uppercase={false} style={ this.state.gender === GENDER_FEMALE ? POBstyles.roundText : POBstyles.roundTextBlack}>Female</Text>
                </Button>
                </LinearGradient>

                <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={this.setGradientStyle(GENDER_OTHER)}
                                style={ POBstyles.roundBtnBG }>
                <Button transparent style={ POBstyles.roundBtnSelected }  onPress={() => this._onPressButton(GENDER_OTHER)}>
                    <AwesomeIcon name="transgender" size={36} color={ this.state.gender === GENDER_OTHER ? "#fff": "#222"}/>
                    <Text uppercase={false} style={ this.state.gender === GENDER_OTHER ? POBstyles.roundText : POBstyles.roundTextBlack}>Other</Text>
                </Button>
                </LinearGradient>
            </View>
        </Row>
        )
    }
}

const POBstyles = StyleSheet.create({
    contentBlock: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
    maleIcon: {
        ...Buttons.mediaButtons.roundIcon,
    },
    roundText: {
        ...Buttons.mediaButtons.roundText,
        color: Colors.colors.whiteColor,
    },
    roundTextBlack: {
        ...Buttons.mediaButtons.roundText,
        color: Colors.colors.darkText,
    }
});
