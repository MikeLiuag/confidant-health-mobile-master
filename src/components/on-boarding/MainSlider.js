/*
/!**
 * Created by Sana on 1/31/2019.
 *!/

import React, { Component } from 'react';
import {Image, Platform, StyleSheet, TouchableOpacity, ViewPropTypes} from 'react-native';
import { View, Text } from 'native-base';
import Swiper from 'react-native-swiper';
import VideoPlayer from 'react-native-video-player';

export default class MainSlider extends Component<Props> {

    constructor(props){
        super(props);
        console.log(this.props);
        this.state= {
            contentLength: 0,
            type: []
        }
    }

    render() {
        let assets = false;
        let contentType = '';
        let contentLength = this.props.contentLength;
        let items = [];
        let paraCount = 0;
        const paragraphMap = {};
        let section = [];
        for (let i = 0; i < contentLength; i++) {
            assets = false;
            if (this.props.type[i] === 'embedded-asset-block') {

                assets = true;
                contentLength = contentLength - 1;
            }
            if (assets)  {
                contentType = this.props.data.fields.content.content[i].data.target.fields.file.contentType;
            }
            if (assets && !contentType.includes('image') && this.props.data.fields.content.content[i].data.target.fields) {
                section.push(<View>
                    <View style={styles.videowrapper}>
                        <Text style={styles.audioTitle}>Listen to Josephs story about finding love after losing it to an opioid addiction. </Text>
                        <VideoPlayer
                            thumbnail={{ uri: 'http://techslides.com/demos/samples/sample.png' }}
                            // video={{ uri: 'http://techslides.com/demos/samples/sample.mp3' }} //static audio link
                            video={{ uri: 'https:'+this.props.data.fields.content.content[i].data.target.fields.file.url }} //video link
                            ref={r => this.player = r}
                            disableControlsAutoHide
                            pauseOnPress
                            resizeMode='cover'
                            loop
                            style={ styles.backgroundVideo }
                            customStyles={ audioStyles }
                        />

                    </View>
                </View>);
                console.log('Audio hai ye');
            }
            if (assets && contentType.includes('image')) {
                section.push(<View>
                    <Image style={ styles.sliderImage }
                           source={{uri: 'https:'+this.props.data.fields.content.content[i].data.target.fields.file.url}} />
                    </View>);
                console.log('Image hai ye');
            }
            if(!assets){
                if (this.props.data.fields.content.content[i].nodeType === 'heading-3') {
                    if (this.props.data.fields.content.content[i].content[0]) {
                        //items.push('Heading hai ye');
                        section.push(<View key={i}>
                            <Text style={styles.mainText}>This is Heading Type Educational Content</Text>
                        </View>);
                        console.log('Heading hai ye');
                    }
                }
                if (this.props.data.fields.content.content[i].nodeType === 'paragraph') {
                    if (this.props.data.fields.content.content[i].content[1]) {
                        section.push(<View key={i}>
                            <View style={styles.videowrapper}>
                                <Text style={styles.videoTitle}>Take a moment to watch the following video. </Text>
                                <VideoPlayer
                                    thumbnail={{ uri: 'http://techslides.com/demos/samples/sample.jpg' }}
                                    // video={{ uri: 'http://techslides.com/demos/samples/sample.mp4' }} //static link
                                    video={{ uri: this.props.data.fields.content.content[i].content[1].data.uri }}
                                    disableControlsAutoHide
                                    pauseOnPress
                                    resizeMode='cover'
                                    loop
                                    ref={r => this.player = r}
                                    style={ styles.backgroundVideo }
                                    customStyles={ videoStyles }
                                />
                            </View>
                        </View>);
                        console.log('Video hai ye');
                    } else{
                        if (this.props.data.fields.content.content[i].content[0]) {
                            console.log('para hai ye');
                            section.push(<View key={i}>
                                <Text style={styles.description}>{this.props.data.fields.content.content[i].content[0].value}</Text>
                            </View>);
                        }
                    }
                }
                if (this.props.data.fields.content.content[i].nodeType === 'hr') {
                    console.log('section is comming')
                    console.log(section);
                    items.push(section);
                    section = [];
                    console.log('HR hai ye');
                }
            }
        }
        console.log(items);
        return (
            <Swiper style={styles.swiperWrapper}
                    showsButtons={false}
                    showsPagination={false}
                // paginationStyle={ styles.paginationTop }
                // dot={ <View style={ sliderStyles.dots } />}
                // activeDot={<View style={ sliderStyles.activeDot } />}
            >
                {items.map((section, key) => section.map((item, key) => (<View key={key} style={styles.slide}>
                    {item}
                </View>)))}
            </Swiper>
        );
    }
}



// Define your Base Styles Before Media Queries
const styles = {
    swiperWrapper: {
        minHeight: 700,
    },
    sliderImage: {
        marginTop: 40,
        resizeMode: 'contain',
        width: '100%',
        height: 300
    },
    slide: {
        flex: 1,
    },
    mainText: {
        fontFamily: 'Roboto-Regular',
        color: '#30344D',
        fontSize: 24,
        fontWeight: '500',
        marginBottom: 15,
    },
    description: {
        fontFamily: 'Roboto-Regular',
        color: '#30344D',
        fontSize: 20,
        fontWeight: '300',
    },
    videowrapper: {

    },
    videoTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#30344D',
        fontSize: 24,
        fontWeight: '300',
    },
    backgroundVideo: {
        marginTop: 10,
        width: '100%',
        height: 450,
        backgroundColor: '#E0E0E0'
    },
    audioTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 24,
        fontWeight: '600',
    },
};

const videoStyles = {
    preloadingPlaceholder: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 84,
        height: 84,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playArrow: {
        color: 'white',
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: '#25345C',
    },
    controls: {
        backgroundColor: '#25345C',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center',
    },
    playControl: {
        color: 'white',
        padding: 8,
    },
    extraControl: {
        color: 'white',
        padding: 8,
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5,
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 8,
    },
    seekBarProgress: {
        height: 8,
        backgroundColor: '#4FACFE',
        borderRadius: 8
    },
    seekBarKnob: {
        display: 'none'
    },
    seekBarBackground: {
        backgroundColor: 'black',
        height: 8,
        borderRadius: 8
    },
    overlayButton: {
        flex: 1,
    },
}

const audioStyles = {
    preloadingPlaceholder: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        backgroundColor: '#25345C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 84,
        height: 84,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playArrow: {
        color: 'white',
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: '#25345C',
    },
    controls: {
        backgroundColor: '#25345C',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center',
    },
    playControl: {
        color: 'white',
        padding: 8,
    },
    extraControl: {
        color: 'white',
        padding: 8,
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5,
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 8,
    },
    seekBarProgress: {
        height: 8,
        backgroundColor: '#4FACFE',
        borderRadius: 8
    },
    seekBarKnob: {
        display: 'none'
    },
    seekBarBackground: {
        backgroundColor: 'black',
        height: 8,
        borderRadius: 8
    },
    overlayButton: {
        flex: 1,
    },
}

*/
