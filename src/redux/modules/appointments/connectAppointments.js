import { connect } from "react-redux";
import { appointmentsActionCreators} from "./actions";
import {profileActionCreators} from "../profile/actions";

function mapStateToProps({ appointments, auth, connections,profile, payment}) {
    return {
        appointments, auth, connections,profile, payment
    };
}

const mapDispatchToProps = {...appointmentsActionCreators,...profileActionCreators};

export function connectAppointments(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}