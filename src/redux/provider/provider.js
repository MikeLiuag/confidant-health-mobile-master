// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import createStore from '../store';
import {PersistGate} from 'redux-persist/integration/react';
import {MainErrorView} from '../../components/MainErrorView';

let store;

class AppStoreProvider extends React.Component {
    getChildContext() {
        return {
            store,
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorDesc: null
        };
    }

    static childContextTypes = {
        store: PropTypes.shape({}),
    };

    onError = (error) => {
        console.log(error);
      this.setState({error: error.stack, errorDesc: error.message});
    };

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {error: error};
    }

    componentDidCatch(error, errorInfo) {
        console.log('Did catch error')
        this.onError(error);
    }


    render() {
        const {children} = this.props;
        store = store || createStore(this.onError);
        if (this.state.error) {
            return <MainErrorView error={this.state.error} errorDesc={this.state.errorDesc} stateStore={store.store}/>
        }
        return (
            <Provider store={store.store}>
                <PersistGate loading={null} persistor={store.persistor}>
                    {children}
                </PersistGate>
            </Provider>
        );

        //return <Provider store={store}>{children}</Provider>;
    }
}

export default AppStoreProvider;
