import React, {Component} from 'react';
import { WebView } from 'react-native-webview';
import {Body, Text, Button, Container, Content, Header, Left, Right, Title} from 'native-base';
import {Platform, StatusBar, StyleSheet} from 'react-native';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {AlfieLoader, addTestID, getHeaderHeight} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";

const HEADER_SIZE = getHeaderHeight();

export default class TypeFormWebScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.serviceName = this.props.navigation.getParam("name", null);
        this.formUrl = this.props.navigation.getParam("formUrl", null);
        this.state = {
            formUrl: 'https://confidanthealth.typeform.com/to/e04mW6'
        }


    }

    componentDidMount(): void {
        // this.formRefresher = this.props.navigation.addListener(
        //     'willFocus',
        //     payload => {
        //         if(this.webView) {
        //             this.setState({formUrl: this.state.formUrl + '?t='+Date.now()});
        //             this.webView.reload();
        //         }
        //     }
        // );
    }
    componentWillUnmount(): void {
        // if(this.formRefresher) {
        //     this.formRefresher.remove();
        // }
    }

    goBack = ()=>{
        this.props.navigation.goBack();
    }

    render() {
        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            {...addTestID('Back')}
                            onPress={this.goBack}
                            transparent
                            style={styles.backButton}>
                            <FAIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body
                        style={Platform.OS === 'ios'? { flex: 4} : {flex: 5, paddingLeft: 25}}>
                        <Title style={styles.headerText}>{this.serviceName}</Title>
                    </Body>
                    <Right/>
                </Header>
                    <WebView
                        source={{ uri: this.formUrl }}
                        style={{ marginBottom: 20 }}
                        ref={(webView)=>{
                            this.webView = webView;
                        }}
                        startInLoadingState={true}
                        renderLoading={() => <AlfieLoader />}
                    />
            </Container>
        );
    }
}


const styles = StyleSheet.create({

    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 6
    },
    backButton: {
        marginLeft: 16,
        width: 30,
        paddingLeft: 0
    },

    headerText: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center',
        // width: 150
    },
});
