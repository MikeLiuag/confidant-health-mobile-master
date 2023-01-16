import {fork, all} from "redux-saga/effects";
import {liveChatSaga, chatSaga, authSaga, educationalSaga, profileSaga, connectionsSaga, appointmentSaga, paymentSaga, revampSaga} from "../modules";

export default function* rootSaga(store) {
    yield all([
        fork(chatSaga),
        fork(authSaga),
        fork(educationalSaga),
        fork(profileSaga),
        fork(paymentSaga),
        fork(appointmentSaga),
        fork(connectionsSaga, store),
        fork(liveChatSaga,store),
        fork(revampSaga)
    ]);
}
