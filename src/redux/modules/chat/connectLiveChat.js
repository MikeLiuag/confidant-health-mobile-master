import {connect} from "react-redux";
import {chatActionCreators} from "./actions";
import {appointmentsActionCreators} from "../appointments";

function mapStateToProps({auth, chat, connections, appointments,profile}) {
    return {auth, chat, connections, appointments,profile};
}
const mapDispatchToProps = {...chatActionCreators,...appointmentsActionCreators};

export function connectLiveChat(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
