import { connect } from "react-redux";
import { profileActionCreators} from "./actions";

function mapStateToProps({ profile, auth, educational,payment, connections, appointments}) {
    return {
        profile, auth, educational,payment, connections, appointments
    };
}

const mapDispatchToProps = profileActionCreators;

export function connectProfile(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
