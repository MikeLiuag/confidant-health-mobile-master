import React, {Component} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {Button, Container, Content, Left, Right, Body, Title, Header, Icon, Form, Textarea} from 'native-base';
import {connectConnections} from './../../redux';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class AppointmentEditMessageScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.setText = navigation.getParam('setText', null);
        this.text = navigation.getParam('text', null);
        this.state = {
            isLoading: true,
            text: this.text
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Appointment Edit Message Screen'
        );
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <LinearGradient
                    start={{ x: 1, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{ flex: 1}}
                >
                    <Header
                        {...addTestID('Header')}
                        transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left>
                            <Button
                                {...addTestID('Back-Clicked')}
                                transparent
                                style={styles.backBtn}
                                onPress={this.backClicked}>
                                <Icon
                                    name="close"
                                    type={'AntDesign'}
                                    style={styles.backIcon}
                                />
                            </Button>
                        </Left>
                        <Body style={{ flex: 2 }}>
                            <Title
                                {...addTestID('Add-Message')}
                                style={styles.stepperText}>Add Message</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content style={{ padding: 24}}>
                        <Form>
                            <Textarea
                                {...addTestID('Text-Area')}
                                rowSpan={5}
                                onChangeText={(text)=>{
                                    this.setState({text});
                                }}
                                value={this.state.text}
                                style={styles.areaText}
                                placeholderTextColor={"#b3bec9"}
                                placeholder="Add message" />
                        </Form>
                    </Content>
                    <View style={styles.nextBtn}>
                        <GradientButton
                            testId = "add-message"
                            text="Add Message"
                            onPress={()=>{
                                if(this.setText) {
                                    this.setText(this.state.text);
                                    this.props.navigation.goBack();
                                }
                            }}
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingLeft: 18,
        paddingRight: 18,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: HEADER_SIZE
    },
    stepperText: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        letterSpacing: 0.3,
        lineHeight: 24
    },
    backBtn: {
        marginLeft: 0,
        width: 45
    },
    backIcon: {
        color: '#3fb2fe',
        fontSize: 28
    },
    areaText: {
        color: '#646c73',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.2,
        height: 'auto'
    },
    checkWrapper: {
        paddingRight: 16
    },
    nextBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX()? 34 : 24
    }
});
export default connectConnections()(AppointmentEditMessageScreen);
