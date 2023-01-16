import { connect } from "react-redux";
import { paymentActionCreators } from "./actions";

function mapStateToProps({ auth, payment, connections, profile }) {
    return {
        auth, payment, connections, profile
    };
}

const mapDispatchToProps = {...paymentActionCreators}

export function connectPayment(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
