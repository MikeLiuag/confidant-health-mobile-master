import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connectProfile} from '../../redux';
import ProfileService from "../../services/Profile.service";
import {DCTReportViewComponent} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';

class DCTReportViewScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            dctId: this.props.navigation.getParam('dctId', null)
        };
    }

    dctClicked = (contextId, score, dctTitle,completionDate,colorCode, scorable) => {
        const dctId = this.state.dctId;
        this.props.navigation.navigate(
            Screens.OUTCOME_DETAIL_SCREEN,
            {
                contextId,dctId,score,dctTitle,completionDate, colorCode, scorable
            }
        );
    };

    async componentDidMount(): void {
        try {
            const data: any = await ProfileService.getDCTDetails(
                this.props.auth.meta.userId,this.state.dctId,0,3,
            );
            if (data.errors) {
                this.setState({
                    isLoading: false,
                    isError: data.errors[0],
                });
            }
            else {
                this.setState({
                    initialScore: data.initialScore,
                    currentScore: data.currentScore,
                    scorable : data.scorable,
                    dctTitle: data.dctTitle,
                    totalAttempt: data.totalAttempt,
                    dctCompletionsList: data.DCTCompletionsList ? data.DCTCompletionsList : '',
                    isLoading: false,
                    isError: false,
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
    dctSeeAll = props => {
        this.props.navigation.navigate(
            Screens.PROGRESS_REPORT_SEE_ALL_SCREEN_DCT,
            props,
        );
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <DCTReportViewComponent
                backClicked={this.backClicked}
                initialScore={this.state.initialScore}
                currentScore={this.state.currentScore}
                scorable={this.state.scorable}
                dctTitle={this.state.dctTitle}
                totalAttempt={this.state.totalAttempt}
                dctCompletionsList={this.state.dctCompletionsList}
                isLoading={this.state.isLoading}
                dctClicked={this.dctClicked}
                dctSeeAll={this.dctSeeAll}
                dctId={this.state.dctId}
                userId={this.props.profile.patient.userId}
            />
        );
    }
}
export default connectProfile()(DCTReportViewScreen);
