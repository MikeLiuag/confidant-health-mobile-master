import React, { Component } from 'react';
import { StyleSheet, View, AppState} from "react-native";
import LottieView from "lottie-react-native";
import alfie from "../assets/animations/alfie-face-new";
export default class Loader extends Component{

  constructor(props){
    super(props);
    this.state= {
      appState : AppState.currentState
    }
  }

  componentDidMount(): void {
    AppState.addEventListener('change', this._handleAppState);
  }
  componentWillUnmount(): void {
    AppState.removeEventListener('change', this._handleAppState);
  }

  _handleAppState = () => {
    if(this.state.appState === 'active') {
      if(this.animation) {
        this.animation.play();
      }
    }
  }

  render(): React.ReactNode {
    return (
        <View style={styles.loadersty}>
          <LottieView
              ref={animation => {
                this.animation = animation;
              }}
              style={ styles.alfie }
              resizeMode="cover"
              source={alfie}
              autoPlay={true}
              loop />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  loadersty: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  alfie: {
    width: 150,
    height: 150
  }
});
