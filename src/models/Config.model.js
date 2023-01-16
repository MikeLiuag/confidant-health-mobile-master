import type {ApiEndpoint} from "./ApiEndpoint.model";

export interface ConfigModel {
    /**
     * @member baseUrl
     * @description The base url for all requests.
     */
    baseUrl: string;

    /**
     * @member wsUrl
     * @description Websocket Server url for tele-sessions.
     */
    wsUrl: string;
    /**
     * @member mock
     * @description Request mocking configurations
     */
    mock: Mock;
    /**
     * @member suppressLogs
     * @description A flag for suppressing console logs for production builds
     */
    suppressLogs: boolean;
}

interface Mock {
    /**
     * @member enable
     * @description Defines whether requests should be mocked or not
     */
    enable: boolean;
    /**
     * @member delay
     * @description Defines the artificial network latency plus response time period for mocked requests
     */
    delay: number;
    /**
     * @member inclusivity
     * @description Defines whether the supplied endpoints in config should be included for providing mock responses or not.
     */
    inclusivity: boolean;
    /**
     * @member endpoints
     * @description The Endpoints to be included or excluded for mocking.
     */
    endpoints: ApiEndpoint[];

}