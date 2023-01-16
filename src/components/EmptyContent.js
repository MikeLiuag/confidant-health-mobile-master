import React from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import {
    Content,
    Text
} from 'native-base';
import {addTestID} from "ch-mobile-shared";

export class EmptyContent extends React.PureComponent {

    render() {
        return(
            <Content style={styles.contentStyle}>
              <View style={styles.score}>
                <Image
                    {...addTestID('Information-png')}
                    style={{width: 25, height: 25}}
                    source={require('../assets/images/information.png')}
                />
                <Text style={styles.scrText}>{this.props.message}</Text>
              </View>
            </Content>
        );
    }
}

const styles = StyleSheet.create({
    contentStyle: {
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 20
    },
    score: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrText: {
        color: '#A4ABB2',
        fontFamily: 'Roboto',
        fontSize: 12,
        fontWeight: '100',
        textAlign: 'center',
        marginLeft: 10,
    }
});
