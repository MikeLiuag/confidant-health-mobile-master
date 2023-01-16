import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Button, Text, Spinner } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { Buttons } from "../styles";
import {addTestID} from "ch-mobile-shared";

export default class GradientButton extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  render() {
    return (
      <LinearGradient
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        colors={(this.props.disabled)? ["#D1D1D1", "#EBEBEB", "#EBEBEB"] : ["#4FACFE", "#34b6fe", "#00C8FE"]}
        style={buttonStyles.startButton}
      >
        <Button
            {...addTestID(this.props.testId)}
            disabled={this.props.disabled}
            onPress={() => {
              this.props.onPress();
            }}
            transparent
            style={buttonStyles.clearBg}
        >
          {this.renderButtonChild()}
        </Button>
      </LinearGradient>
    );
  }

  renderButtonChild() {
    if (this.state.isLoading || this.props.isLoading) {
      return <Spinner color="white" style={buttonStyles.spinner} />;
    } else {
      return <Text
          style={[buttonStyles.buttonText, (this.props.disabled)? { color: "#737373"}: {color: "#ffffff"}]}>
        {this.props.text} </Text>;
    }
  }
}
const buttonStyles = StyleSheet.create({
  startButton: {
    ...Buttons.mediaButtons.startButtonBG
  },
  clearBg: {
    textAlign: "center",
    alignSelf: "center"
  },
  spinner: {
    alignSelf: "center"
  },
  buttonText: {
    fontSize: 13,
    fontFamily: "Roboto-Bold",
    letterSpacing: 0.7,
    textAlign: "center",
    width: "100%",
    color: "#ffffff",
    textTransform: 'uppercase'
  }
});
