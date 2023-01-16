import React from 'react';
import {View, Image, Dimensions, StyleSheet, AppState} from 'react-native';
import {Content, Text} from 'native-base';
import Loader from 'ch-mobile-shared/src/components/Loader';
import {Colors, TextStyles} from 'ch-mobile-shared';

export class SavingsContent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const actual = this.props.userCost / this.props.marketCost;
    const actualResult = parseFloat(actual * 100).toFixed(0);
    const savings = 100 - actualResult;
    const contribution = parseFloat(this.props.userCost - this.props.selectedServiceCost).toFixed(2);
    const communityPaying = parseFloat(this.props.selectedServiceCost - this.props.userCost).toFixed(2);


    return (
      <View>
        {(() => {
          if (this.props.userCost > this.props.selectedServiceCost) {
            return (
              <View>
                <Text style={styles.savingText}>
                  You’re{' '}
                  {savings > 1 ? (
                    <Text>
                      <Text style={styles.subTextPink}>saving {savings}%</Text> and{' '}
                    </Text>
                  ) : null}{' '}
                  <Text style={styles.subTextPink}>
                    contributing ${contribution}
                  </Text>{' '}
                  to the Confidant Community.
                </Text>
                <Text style={styles.savingText}>
                  <Text style={styles.subTextPink}>
                    100%
                  </Text>{' '}
                  go to someone else’s clinical care.
                </Text>
              </View>
            );
          } else if (this.props.userCost === this.props.selectedServiceCost) {
            return (
              <View>
                <Text style={styles.savingText}>
                  You’re <Text style={styles.subTextPink}>saving {savings}%</Text>{' '}
                  But you are <Text style={styles.redText}>not</Text>{' '}
                  contributing to the Confidant Community.
                </Text>
              </View>
            );
          } else if (this.props.userCost < this.props.selectedServiceCost) {
            return (
              <View>
                <Text style={styles.savingText}>
                  The Community is paying{' '}
                  <Text style={styles.subTextPink}> ${communityPaying}</Text> for
                  your care.
                </Text>
              </View>
            );
          }
        })()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  savingText: {
    color: '#25345C',
    fontFamily: 'Roboto-Regular',
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0.8,
    textAlign: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 24,
    marginTop: 24,
  },
  blueText: {
    color: '#318AC4',
    fontFamily: 'Roboto-Bold',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0.8,
  },
  redText: {
    color: '#D0021B',
    fontFamily: 'Roboto-Bold',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0.8,
  },
  subTextPink: {
    color: Colors.colors.secondaryText,
    ...TextStyles.mediaTexts.bodyTextM,
    ...TextStyles.mediaTexts.manropeMedium,
  },
});
