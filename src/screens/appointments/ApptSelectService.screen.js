import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connectConnections} from "../../redux";
import {Screens} from '../../constants/Screens';
import {AlertUtil, SelectServiceV2Component} from 'ch-mobile-shared';
import AppointmentService from "../../services/Appointment.service";
import {AppointmentSelectServiceComponent} from "../../components/appointment/AppointmentSelectService.component";
import {
    FILTER_SERVICE_BY_COST,
    FILTER_SERVICE_BY_DURATION,
    FILTER_SERVICE_BY_RATING,
    PROVIDER_FILTERS_LOOKINGFOR_OPTIONS
} from "../../constants/CommonConstants";

class AppointmentSelectServiceScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedProvider = navigation.getParam('selectedProvider', null);
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.updateAppointment = navigation.getParam('updateAppointment', null);
        this.state = {
            isLoading: true,
            servicesList: [],
            selectedService: null,
            filteredItems: [],
            itemSelected: false,
            durationsList: FILTER_SERVICE_BY_DURATION,
            costsList: FILTER_SERVICE_BY_COST,
            ratingList: FILTER_SERVICE_BY_RATING,
            providers: PROVIDER_FILTERS_LOOKINGFOR_OPTIONS,
            openFilterModal:false,
        };
    }

    getDurationText = (duration) => {
        const minText = ' min';
        const hourText = ' hour';
        if (duration < 60) {
            return duration + minText;
        }
        const hour = parseInt(duration / 60);
        const min = duration % 60;
        let text = hour + hourText;
        if (min > 0) {
            text = text + ' ' + min + minText;
        }
        return text;
    };

    clearFilters =() =>{
        let costsList = this.state.costsList.map(item=> {
            item.checked = false;
            return item
        })
        let durationsList = this.state.durationsList.map(item=> {
            item.checked = false;
            return item
        })
        this.setState({costsList, durationsList})
    }

    async componentDidMount(): void {
        this.clearFilters();
        const providerId = this.originalAppointment ? this.originalAppointment.participantId : this.selectedProvider.userId;
        let servicesList = await AppointmentService.getProviderServices(providerId);
        if (servicesList.errors) {
            AlertUtil.showErrorMessage(servicesList.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            servicesList = servicesList.map(service => {
                service.durationText = this.getDurationText(service.duration);
                return service;
            });
            this.setState({isLoading: false, filteredItems: servicesList, servicesList});
        }
    }


    nextStep = (selectedService) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
            selectedProvider: this.selectedProvider,
            originalAppointment: this.originalAppointment,
            selectedService: selectedService,
            updateAppointment: this.updateAppointment
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateLearnMoreScreen = (selectedService) => {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN, {
            ...this.props.navigation.state.params,
          selectedItem: {
                service: selectedService,
              providers:  [this.selectedProvider]},
            isProviderFlow: true
        });
    }


    toggleFilterItem = (listKey, title, applyFilterCallback) => {
        let relevantList = this.state[listKey];
        relevantList = relevantList.map((option) => {
            if (option.title === title) {
                option.checked = !option.checked;
            } else {
                option.checked = false;
            }

            return option;
        });
        const isChecked = relevantList.some((option) => option.checked);
        const updatedState = {};
        updatedState[listKey] = relevantList;
        updatedState.isDisabled = isChecked;

        let callback = () => {
        };
        if (applyFilterCallback) {
            callback = applyFilterCallback;
        }

        this.setState(updatedState, callback)
    }

    applyFilter = () => {
        const selectedCosts = this.state.costsList.filter(cost => cost.checked === true).map(cost => cost.value)
        const selectedDurations = this.state.durationsList.filter(duration => duration.checked === true).map(duration => duration.value)

        let selectedValue = this.state.servicesList;
        if (selectedCosts.length > 0) {
            selectedValue = selectedValue.filter(item => item.cost <= Math.max(...selectedCosts));
        }
        if (selectedDurations.length > 0) {
            selectedValue = selectedValue.filter(item => item.duration <= Math.max(...selectedDurations));
        }

        this.setState({
            filteredItems: selectedValue,
        });
        AlertUtil.showSuccessMessage("Filter applied");
    }


    updateCheckStatus = (selectedItem) => {
        let {filteredItems} = this.state;
        filteredItems = filteredItems.map((filterItem) => {
            if (filterItem.id === selectedItem.id) {
                filterItem.isSelected = !filterItem.isSelected;
            } else {
                filterItem.isSelected = false;
            }
            return filterItem;
        })
        this.setState({filteredItems, selectedItem})
    }

    closeFilterModal = () => {

        this.setState({openFilterModal:false})
    }



    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SelectServiceV2Component
                nextStep={this.nextStep}
                servicesList={this.state.servicesList}
                selectedProvider={this.selectedProvider}
                backClicked={this.backClicked}
                isLoading={this.state.isLoading}
                filteredItems={this.state.filteredItems}
                updateCheckStatus={this.updateCheckStatus}
                applyFilter={this.applyFilter}
                toggleFilterItem={this.toggleFilterItem}
                navigateLearnMoreScreen={this.navigateLearnMoreScreen}
                closeFilterModal={this.closeFilterModal}
                durationsList={this.state.durationsList}
                costsList={this.state.costsList}
                ratingLis={this.state.ratingLis}
                providers={this.state.providers}
                itemSelected={this.state.itemSelected}
                openFilterModal={this.state.openFilterModal}
                selectedItem ={this.state.selectedItem}
            />
        );
    };
}


export default connectConnections()(AppointmentSelectServiceScreen);
