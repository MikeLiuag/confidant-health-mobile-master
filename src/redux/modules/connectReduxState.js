import {connect} from "react-redux";

function mapStateToProps({ auth, profile, settings, appointments, connections,chat, educational, revamp }) {
    return {
        auth,
        profile,
        settings,
        appointments,
        connections,
        chat,
        educational,
        revamp
    };
}


export function connectReduxState(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        null
    );
}
