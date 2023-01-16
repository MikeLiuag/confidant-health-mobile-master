import { connect } from "react-redux";
import { authActionCreators } from "./actions";
import { profileActionCreators } from "../profile";

function mapStateToProps({ auth,profile,chat }) {
    return {
        auth,
        profile,
        chat,
    };
}

const mapDispatchToProps = {...authActionCreators,...profileActionCreators};

export function connectAuth(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
