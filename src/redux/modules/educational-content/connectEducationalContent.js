import { connect } from "react-redux";
import { educationalActionCreators } from "./actions";
import { profileActionCreators} from "../profile/actions";

function mapStateToProps({ educational, profile, auth,  }) {
    return {
        educational,
        profile,
        auth
    };
}

const mapDispatchToProps = {...profileActionCreators, ...educationalActionCreators}

export function connectEducationalContent(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}