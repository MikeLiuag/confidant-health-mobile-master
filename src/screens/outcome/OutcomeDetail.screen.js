import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {connectProfile} from '../../redux';
import {OutcomeDetailComponent} from 'ch-mobile-shared';
import ProfileService from '../../services/Profile.service';

class OutcomeDetailScreen extends Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isError: false,
            contextId : this.props.navigation.getParam('contextId', null),
            dctId : this.props.navigation.getParam('dctId', null),
            score : this.props.navigation.getParam('score', null),
            dctTitle : this.props.navigation.getParam('dctTitle', null),
            completionDate : this.props.navigation.getParam('completionDate', null),
            colorCode : this.props.navigation.getParam('colorCode', null),
            scorable : this.props.navigation.getParam('scorable', null)
        };
    }

    async componentWillMount(): void {
        try {
            const data: any = await ProfileService.getOutcomeDetail(
                this.state.contextId,this.state.dctId
            );

            if (data.errors) {
                this.setState({
                    isLoading: false,
                    isError: data.errors[0],
                });
            } else {
                this.setState({
                    isLoading: false,
                    isError: false,
                    outcomeDetails: data
                });
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false, isError: true});
        }
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <OutcomeDetailComponent
                isLoading={this.state.isLoading}
                outcomeError={this.state.isError}
                outcomeData={this.state.outcomeDetails}
                dctTitle={this.state.dctTitle}
                completionDate={this.state.completionDate}
                score={this.state.score}
                scorable={this.state.scorable}
                colorCode={this.state.colorCode}
                backClicked={this.backClicked}
             />
        );
    }
}
const styles = StyleSheet.create({
    backButton: {},
    greWrapper: {},
    greBG: {},
    greTitle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 1
    },
    greTime: {
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        textAlign: 'center',
        letterSpacing: 1.09,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 30
    },
    scoreWrapper: {
        paddingTop: 40,
        paddingBottom: 40
    },
    circleBar: {
        alignSelf: 'center'
    },
    circleInside: {
        backgroundColor: '#359226',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 1,
        borderRadius: 140,
        overflow: 'hidden',
        borderWidth: 30,
        borderColor: '#197A11'
    },
    circleText: {
        fontSize: 40,
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontWeight: '700',
        textAlign: 'center'
    },
    textInside: {
        fontFamily: 'Roboto-Bold',
        fontSize: 14,
        letterSpacing: 1.27,
        textTransform: 'uppercase',
        textAlign: 'center',
        color: '#fff'
    },
    QASection: {},
    singleQA: {
        padding: 24,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 0.5
    },
    QSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    QAIcon: {
        borderWidth: 1,
        borderColor: '#ebebeb',
        width: 40,
        height: 40,
        textAlign: 'center',
        lineHeight: 40,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#fff',
        color: '#3fb2fe',
        fontSize: 20,
        marginRight: 16
    },
    QText: {
        flex: 1,
        fontFamily: 'Roboto-Bold',
        color: '#25345c',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.47
    },
    ASection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    AText: {
        flex: 1,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 22,
        color: '#646c73'
    }
})
export default connectProfile()(OutcomeDetailScreen);
