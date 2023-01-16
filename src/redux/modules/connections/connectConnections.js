import { connect } from "react-redux";
import { connectActionCreators } from "./actions";
import {appointmentsActionCreators, connectAppointments} from "../appointments";
import { revampActionCreators } from "../revamp";

function mapStateToProps({ connections, profile, auth, appointments,chat, educational, revamp }) {
    return {
        connections, profile, auth,appointments,chat, educational, revamp
    };
}

const mapDispatchToProps = {...connectActionCreators, ...appointmentsActionCreators,...revampActionCreators};

export function connectConnections(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
