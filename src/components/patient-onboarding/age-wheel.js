import React, { Component } from 'react';
import { View } from "native-base";
import { Image, StyleSheet, Platform , PickerIOS } from 'react-native';
import { Colors } from '../../styles';
import { WheelPicker } from 'react-native-wheel-picker-android'
import { Row } from 'react-native-easy-grid';
import LinearGradient from 'react-native-linear-gradient';
import { createStyles, maxWidth } from 'react-native-media-queries';
import { MediaQuery } from 'react-native-responsive-ui';
import {AGE_LIST} from '../../constants/CommonConstants';
import Loader from "../Loader";
import { Picker } from 'react-native-wheel-pick';


console.disableYellowBox = true;
const isIos = Platform.OS === 'ios';

/**
 * Class to render the age wheel
 *
 * @class AgeWheel
 * @extends Component
 */
export default class AgeWheel extends Component{
    constructor(props) {
        super(props);

        // get the index of selectedAge
        let ageIndex = AGE_LIST.findIndex(i => i === props.age);
        let androidPickerAge = ageIndex > -1 ? ageIndex : 0;

        this.state = {
            selectedAge: props.age,
            initAge: isIos ? props.age : androidPickerAge,
            isLoading: false
        };
    }

    /**
     * Get the selected value (incase of IOS ) or index (incase of android) from the wheel and manipulate the age.
     * Then send the selectedAge to the parent (patient-onboarding.screen)
     */
  onItemSelected = async selectedValueOrIndex => {
      await this.setState({
          selectedAge: isIos ? selectedValueOrIndex : AGE_LIST[selectedValueOrIndex],
          isLoading: false
      });

      await this.props.onChoiceSelected(this.state.selectedAge);
  };

  render() {
      if (this.state.isLoading) {
          return (
              <Loader/>
          )
      } else {
          return (
              <Row size={70} style={ POBstyles.wheelBlock }>
                  <View style={ POBstyles.customSelected}>
                      <LinearGradient start={{x: 0, y: 1}} end={{x: 1, y: 0}} colors={['#4FACFE', '#34b6fe', '#00C8FE']}
                                      style={ isIos? POBstyles.customSelectedIndicatorios : mediaStyles.customSelectedIndicator }>

                      </LinearGradient>
                  </View>
                  <MediaQuery minWidth={400} orientation="portrait">
                      { isIos ? <Picker
                          style={ POBstyles.customWheeliOS }
                          selectedValue={ this.state.initAge }
                          pickerData={AGE_LIST}
                          onValueChange={this.onItemSelected}
                          itemStyle={pickerItemStyle}
                      />
                          : <WheelPicker style={ POBstyles.customWheel }
                              isCyclic
                              hideIndicator
                              selectedItemTextSize={35}
                              itemTextSize={28}
                              itemTextColor={ Colors.colors.lightestText }
                              selectedItemTextColor={ 'white' }
                              initPosition={this.state.initAge}
                              data={AGE_LIST}
                              onItemSelected={this.onItemSelected}/>}
                  </MediaQuery>
                  <MediaQuery maxWidth={400} orientation="portrait">
                      { isIos ?
                          <Picker
                              style={ POBstyles.customWheeliOS }
                              selectedValue={ this.state.initAge }
                              pickerData={AGE_LIST}
                              onValueChange={this.onItemSelected}
                              itemStyle={pickerItemStyle}
                          />
                      : <WheelPicker style={ POBstyles.customWheel }
                                     isCyclic
                                     hideIndicator
                                     selectedItemTextSize={28}
                                     itemTextSize={20}
                                     itemTextColor={ Colors.colors.lightestText }
                                     selectedItemTextColor={ 'white' }
                                     initPosition={this.state.initAge}
                                     data={AGE_LIST}
                                     onItemSelected={this.onItemSelected}/> }

                  </MediaQuery>
              </Row>
          )
      }

  }
}


// Define your base styles
const baseStyle = {
    customSelectedIndicator: {
        width: 100,
        height: 66,
        borderRadius: 12,
        top: 92,
        left: '50%',
        marginLeft: -50,
    }
};

const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent',
    color: Colors.colors.darkText ,
    fontFamily: 'Roboto-Regular',
    fontSize:36
};

const mediaStyles = createStyles(
    baseStyle,
    // override styles only if screen width is less than 480
    maxWidth(400, {
        customSelectedIndicator: {
            width: 80,
            height: 52,
            top: 79,
            marginLeft: -40,
            borderRadius: 10,
        }
    }),
);

const POBstyles = StyleSheet.create({
    customSelectedIndicatorios: {
        width: 100,
        height: 60,
        borderRadius: 12,
        top: 78,
        left: '50%',
        marginLeft: -50,
    },
    wheelBlock: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    customWheel: {
        width: '100%',
        height: 250,
        zIndex: 10,
    },
    customWheeliOS: {
        width: 90,
        height: 250,
        zIndex: 10,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
        borderTopWidth: 0,
    },
    customSelected: {
        width: '100%',
        height: 250,
        position: 'absolute',
        zIndex: -1,
    }
    
});
