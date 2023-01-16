import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {ProgressReportSeeAllComponent} from 'ch-mobile-shared';
import {connectProfile} from '../../redux';
import ProfileService from '../../services/Profile.service';
import {Screens} from "../../constants/Screens";
import PushNotificationListeners from '../../components/PushNotificationListeners';
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";

class ProgressReportSeeAllScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false,
    };
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };

  dctClicked = (dctId , scorable) => {
    this.props.navigation.navigate(
        Screens.DCT_REPORT_VIEW_SCREEN,
        {
          dctId ,scorable
        }
    );
  };

  dctAttemptClicked = (userId, dctId,contextId , score,dctTitle,completionDate, colorCode, scorable) => {
    this.props.navigation.navigate(
        Screens.OUTCOME_DETAIL_SCREEN,
        {
          userId,dctId, contextId,score,dctTitle,completionDate, colorCode, scorable
        }
    );
  };



  render() {
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setBarStyle('dark-content', true);
    return (
      <ProgressReportSeeAllComponent
        title={this.props.navigation.getParam('title', null)}
        section={this.props.navigation.getParam('section', null)}
        data={this.props.navigation.getParam('data', null)}
        backClicked={this.backClicked}
        activityError={this.state.isError}
        isLoading={this.state.isLoading}
        addNotificationCallback={PushNotificationListeners.addNotificationCallback}
        removeNotificationCallback={PushNotificationListeners.removeNotificationCallback}
        getUserActivity={ProfileService.getUserActivity}
        getAssignedContent={ProfileService.getContentAssignedToMe}
        userId={this.props.auth.meta.userId}
        getDCTCompletionList={ProfileService.getDCTDetails}
        dctAttemptClicked={this.dctAttemptClicked}
        dctClicked={this.dctClicked}
        appointments = {this.props.appointments.appointments}
        connections = {this.props.connections}
        S3_BUCKET_LINK = {S3_BUCKET_LINK}
      />
    );
  }
}

export default connectProfile()(ProgressReportSeeAllScreen);
