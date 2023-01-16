import React, { Component } from "react";
import { StatusBar, StyleSheet, Image, FlatList, Platform } from "react-native";
import { Body, Button, Container, Content, Header, Left, Right, Text, Title, View } from "native-base";
import {
  isIphoneX,
  Colors,
  TextStyles,
  CommonStyles, SecondaryButton, addTestID, PrimaryButton, TransactionSingleActionItem, getHeaderHeight,
} from "ch-mobile-shared";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { Screens } from "../../constants/Screens";
import { NavigationActions, StackActions } from "react-navigation";
const HEADER_SIZE = getHeaderHeight();
export default class ApptStateLimitedConsentRejectionScreen extends React.PureComponent<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.selectedProvider = navigation.getParam("selectedProvider", null);
    this.selectedService = navigation.getParam("selectedService", null);
    this.selectedSchedule = navigation.getParam("selectedSchedule", null);
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };
  moveToHome = () =>{
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: Screens.TAB_VIEW})],
    });

    this.props.navigation.dispatch(resetAction);
  }


  render() {
    StatusBar.setBarStyle('dark-content', true);
    return (
      <Container style={{backgroundColor: Colors.colors.screenBG}}>
        <Header noShadow={false} transparent style={styles.header}>
          <StatusBar
            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
            translucent
            barStyle={'dark-content'}
          />
          <Left>
            <Button
              {...addTestID('back')}
              onPress={this.backClicked}
              transparent
              style={styles.backButton}>
              <EntypoIcons
                size={30}
                color={Colors.colors.mainBlue}
                name="chevron-thin-left"
              />
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content>
          <View style={styles.textBox}>
            <Text style={styles.magicMainText}>
              Sorry, our {'\n'}prescribers aren’t in your state yet.
            </Text>
            <Text style={styles.magicSubText}>
              You won’t be able to meet with this type of provider because you’re not located in Connecticut.
            </Text>
            <Text style={styles.magicSubText}>
              If you selected this by accident, {'\n'}please go back and change it.
            </Text>
            <Text style={styles.magicSubText}>
              Otherwise, you can book an {'\n'}appointment with our matchmakers or {'\n'}coaches - they can practice {'\n'}anywhere.
            </Text>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <PrimaryButton
            bgColor={Colors.colors.primaryText}
            textColor={'#fff'}
            arrowIcon={false}
            testId="backtohome"
            onPress={() => {
              this.moveToHome();
            }}
            text="Back to Home"
            disabled={''}
          />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 15,
    paddingLeft: 0,
    paddingRight: 0,
    height: HEADER_SIZE,
    ...CommonStyles.styles.headerShadow,
  },
  textBox: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  magicMainText: {
    ...TextStyles.mediaTexts.serifProExtraBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.highContrast,
    marginBottom: 24,
  },
  magicSubText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextL,
    marginBottom: 30,
    textAlign: 'left',
    color: Colors.colors.mediumContrast,
  },
  greBtn: {
    padding: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    ...CommonStyles.styles.stickyShadow,
  },
});
