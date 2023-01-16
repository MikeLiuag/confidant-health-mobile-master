import { connect } from "react-redux";
import { chatActionCreators } from "./actions";
import { educationalActionCreators } from '../educational-content';
import { connectActionCreators } from '../connections';

function mapStateToProps({ chat, auth,profile,connections, appointments,payment, educational }) {
  return {
    chat, auth,profile,connections, appointments,payment, educational
  };
}

export function connectChat(configMapStateToProps = mapStateToProps) {
  return connect(
    configMapStateToProps,
      {...chatActionCreators, ...educationalActionCreators, ...connectActionCreators},
  );
}
