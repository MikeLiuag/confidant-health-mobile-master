/**
 * Created by Sana on 2/1/2019.
 */

import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Button, Text } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { Screens } from "../../constants/Screens";
import {addTestID} from "ch-mobile-shared";

export default class GetStartedBtn extends Component<Props> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={["#4FACFE", "#34b6fe", "#00C8FE"]}
        style={buttonStyles.startButton}
      >
        <Button
            {...addTestID('Get-Started')}
          onPress={() => {
            this.props.onPress();
          }}
          transparent
          style={buttonStyles.clearBg}
        >
          <Text style={buttonStyles.buttonText}> Get Started </Text>
        </Button>
      </LinearGradient>
    );
  }
}

const buttonStyles = StyleSheet.create({
  startButton: {
    width: 250,
    height: 50,
    marginTop: 10,
    justifyContent: "center",
    borderRadius: 3
  },
  clearBg: {
    textAlign: "center"
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    color: "#ffffff"
  }
});
