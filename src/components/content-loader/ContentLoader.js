import React, { Component } from "react";
import {StyleSheet, View} from "react-native";
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient'
import Svg, {Rect, Circle} from 'react-native-svg'
import {addTestID} from "ch-mobile-shared";
export class ContentLoader extends Component {
    constructor(props) {
        super(props);
    }

    renderContentLoader = ()=>{
        let loaderViews = [];
        const numItems = this.props.numItems || 1;
        const type = this.props.type || 'chat';
        for(let i=0;i<numItems;i++) {
            loaderViews.push(this.renderLoaderItem(type, i));
        }
        return loaderViews;
    };

    renderLoaderItem = (type, index)=>{
        switch(type) {
            case 'chat':
                return (
                    <SvgAnimatedLinearGradient key={'content-loader-'+index} style={styles.contentLoaderItem}
                        // primaryColor="#e8f7ff"
                        // secondaryColor="#4dadf7"
                                               width={500}
                                               height={70}>
                        <Circle cx="44" cy={35} r="25"/>
                        <Rect x="80" y={19} rx="3" ry="3" width="150" height="13"/>
                        <Rect x="80" y={45} rx="3" ry="3" width="250" height="10"/>

                    </SvgAnimatedLinearGradient>
                );
            case 'provider-search-card':
                return (
                    <SvgAnimatedLinearGradient key={'content-loader-'+index}
                                               width={500}
                                               height={270}>
                        <Circle cx="70" cy={65} r="38"/>
                        <Rect x="135" y={42} rx="3" ry="3" width="150" height="14"/>
                        <Rect x="135" y={70} rx="3" ry="3" width="100" height="11"/>
                        <Rect x="33" y={130} rx="3" ry="3" width="340" height="55"/>
                        <Rect x="33" y={202} rx="3" ry="3" width="340" height="55"/>

                    </SvgAnimatedLinearGradient>
                );
            case 'i-statements':
                return (
                    <SvgAnimatedLinearGradient key={'content-loader-'+index}
                        // primaryColor="#e8f7ff"
                        // secondaryColor="#4dadf7"
                                               width={500}
                                               height={70}>
                        <Rect x="30" y={35} rx="3" ry="3" width="30" height="30"/>
                        {/*<Rect x="80" y={19} rx="3" ry="3" width="150" height="13"/>*/}
                        <Rect x="80" y={45} rx="3" ry="3" width="250" height="10"/>

                    </SvgAnimatedLinearGradient>
                );
            case 'chat-bot-questions':
                return (
                  <View style={{paddingTop:50}}>
                    <SvgAnimatedLinearGradient key={'content-loader-' + index}
                                               width={500} height={660}>
                        <Rect x="33" y={40} rx="3" ry="3" width="340" height="10"/>
                        <Rect x="33" y={60} rx="3" ry="3" width="340" height="10"/>
                        <Rect x="33" y={80} rx="3" ry="3" width="340" height="10"/>
                        <Rect x="33" y={100} rx="3" ry="3" width="280" height="10"/>
                        <Rect x="33" y={200} rx="3" ry="3" width="280" height="55"/>
                        <Rect x="33" y={270} rx="3" ry="3" width="280" height="55"/>
                        <Rect x="33" y={340} rx="3" ry="3" width="280" height="55"/>
                        <Rect x="53" y={580} rx="3" ry="3" width="300" height="55"/>
                    </SvgAnimatedLinearGradient>
                  </View>
                );
            case 'chat-bot-loader':
                return (
                    <View style={{paddingLeft: 100, paddingTop:50}}>
                        <SvgAnimatedLinearGradient key={'content-loader-' + index}
                                                width={500} height={660}>
                            {/*<Rect x="30" y={40} rx="3" ry="3" width="40" height="30"/>*/}
                            {/*<Rect x="345" y={40} rx="3" ry="3" width="40" height="30"/>*/}

                            <Rect x="30" y={120} rx="3" ry="3" width="350" height="20"/>
                            <Rect x="30" y={150} rx="3" ry="3" width="300" height="20"/>

                            <Rect x="30" y={190} rx="3" ry="3" width="350" height="10"/>
                            <Rect x="30" y={210} rx="3" ry="3" width="350" height="10"/>
                            <Rect x="30" y={230} rx="3" ry="3" width="300" height="10"/>

                            <Rect x="30" y={300} rx="3" ry="3" width="350" height="55"/>
                            <Rect x="30" y={370} rx="3" ry="3" width="350" height="55"/>
                            <Rect x="30" y={440} rx="3" ry="3" width="350" height="55"/>

                            <Rect x="30" y={580} rx="3" ry="3" width="350" height="55"/>
                        </SvgAnimatedLinearGradient>
                    </View>
                );
        }

    };

    render() {
        return (
            <View style={{flex:1}}
                  {...addTestID('Render-Content-Loader')}
            >
                {this.renderContentLoader()}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    contentLoaderItem: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
        borderColor: '#B7D2E5',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginBottom: -1,
        backgroundColor: '#fff'
    },
});
