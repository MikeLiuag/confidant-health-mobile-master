import {DirectLine} from "botframework-directlinejs";

let instance = null;

export class DirectLineClient {

    static createInstance(token) {
        if (!token) {
            throw new Error("Directline Token is required");
        }
        instance = new DirectLine({
            token,
            webSocket: true,
            pollingInterval: 1000
        });
        return instance;
    }

    static getInstance() {
        return instance;
    }

}
