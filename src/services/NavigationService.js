import {NavigationActions} from 'react-navigation';
export default class NavigationService {

    static _navigator;

    static navigationOptions = {
        forAssignment: false,
    };

    static setTopNavigator(navigator) {
        NavigationService._navigator = navigator;
    }

    static navigateTo(route, params?) {
        NavigationService._navigator && NavigationService._navigator.dispatch(
            NavigationActions.navigate(params ? {routeName: route, params} : {routeName: route}));
    }

    static modifyNavigationOptions(key, value) {
        NavigationService.navigationOptions[key] = value;
    }

    static getNavigationOption(key) {
        return NavigationService.navigationOptions[key];
    }

    static getCurrentRouteParams(nav) {
        if(!nav) {
            nav = NavigationService._navigator.state.nav;
        }
        if (Array.isArray(nav.routes) && nav.routes.length > 0) {
            return NavigationService.getCurrentRouteParams(nav.routes[nav.index]);
        } else {
            return nav;
        }
    }

    static getActiveRouteName(navigationState) {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return NavigationService.getActiveRouteName(route);
        }
        return route.routeName;
    }

}
