import React from 'react';

import {View} from 'react-native';
import Modal from 'react-native-modal';
import { ContentLoader } from './content-loader/ContentLoader';

const styles = {
    innerContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
    },

    modalWrapperStyle: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: 0,
    }
};

export default class CustomOverlay extends React.Component {
    state = {
        visible: this.props.visible,
        isLoading: true
    };



    render() {
        const {
            children,
            onClose
        } = this.props;
        return (
            <View style={{width: '100%'}}>
                {
                    this.state.isLoading &&
                    <View style={styles.innerContainer}>
                        <ContentLoader type="chat-bot-loader" numItems="1"/>
                    </View>
                }

                <Modal
                    hasBackdrop={false}
                    backdropOpacity={0.4}
                    style={{margin: 0}}
                    hardwareAccelerated={true}
                    isVisible={this.state.visible}
                    onRequestClose={onClose}
                    onDismiss={onClose}
                    animationIn="slideInRight"
                    animationInTiming={350}
                    animationOut="slideOutLeft"
                    animationOutTiming={350}
                    onModalWillShow={() => this.setState({isLoading: true})}
                    onModalShow={() => this.setState({isLoading: false})}
                >

                    <View style={[styles.innerContainer, styles.modalWrapperStyle]}>
                        {
                            this.state.isLoading ?
                            <ContentLoader type="chat-bot-loader" numItems="1"/>
                            : (
                                children instanceof Function ? children(this._hideModal, this.state) : children
                            )
                        }
                    </View>
                </Modal>
            </View>
        );
    }
}
