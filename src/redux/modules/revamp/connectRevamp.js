import {connect} from "react-redux";
import {revampActionCreators} from "./actions";

function mapStateToProps({revamp, auth}) {
    return {
        revamp, auth
    };
}

const mapDispatchToProps = revampActionCreators;

export function connectRevamp(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
