var Circuit = (function (circuit) {
    'use strict';

    var ChromeExtension = {};

    ChromeExtension.SIGNATURE = 'ansibleChromeExtensionSignature';

    ChromeExtension.DOMEvent = Object.freeze({
        TO_EXTENSION: 'toExtension',
        FROM_EXTENSION: 'fromExtension'
    });

    // Used to define if we have a callback or not.
    ChromeExtension.BgMsgType = Object.freeze({
        REQUEST: 'request',
        RESPONSE: 'response',
        EVENT: 'event'
    });

    // Features (Targets). As a general rule, we have message types for each feature (Target)
    ChromeExtension.BgTarget = Object.freeze({
        INTERNAL: 'internal',
        LOG: 'log',
        SCREEN_SHARE: 'screenShare',
        CLIPBOARD: 'clipboard',
        EXCHANGE_CONNECTOR: 'exchange_connector',
        CONTACT_CARD: 'contact_card',
        SCHEDULE: 'schedule'
    });

    // Error reasons
    ChromeExtension.ResponseError = Object.freeze({
        UNREGISTERED: 'unregistered',             // The content script failed to communicate with the extension and unregistered itself.
        TIMEOUT: 'timeout',                       // Timeout waiting for response from extension
        UNSUPPORTED_REQUEST: 'unsupportedRequest' // Extension doesn't support this request
    });

    // Log events
    ChromeExtension.BgLogMsgType = Object.freeze({
        LOG: 'log'
    });

    // Internal Targets
    ChromeExtension.BgInternalMsgType = Object.freeze({
        INIT_MSG: 'initMsg',
        INIT_MSG_ACK: 'initMsgAck',
        INJECT_SIGNATURE: 'injectChromeAppSignature',
        IS_ALIVE: 'isAlive',
        GET_WINDOW_SIZE: 'getWindowSize'
    });

    ChromeExtension.BgScreenShareMsgType = Object.freeze({
        CHOOSE_DESKTOP_MEDIA: 'cdm',
        CHOOSE_DESKTOP_MEDIA_DONE: 'cdmDone',
        CHOOSE_DESKTOP_MEDIA_CANCELLED: 'cdmCancelled'
    });

    ChromeExtension.BgClipboardMsgType = Object.freeze({
        COPY: 'copy',
        PASTE: 'paste'
    });

    ChromeExtension.BgExchangeMsgType = Object.freeze({
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        RESOLVE_CONTACT: 'resolveContact',
        SEARCH_CONTACTS: 'searchContacts',
        GET_CONNECTION_STATUS: 'getConnectionStatus',
        GET_CAPABILITIES: 'getCapabilities',
        GET_CONTACT: 'getContact',
        STORE_EXCH_CREDENTIALS: 'storeCredentials',
        CONNECTION_STATUS: 'connectionStatus'
    });

    // Possible response values sent by Exchange Connector
    ChromeExtension.ExchangeConnResponse = Object.freeze({
        OK: 'ok',
        NO_RESULT: 'noResult',
        FAILED: 'failed',
        COULD_NOT_CONNECT: 'couldNotConnect',
        UNAUTHORIZED: 'unauthorized',
        UNSUPPORTED_METHOD: 'unsupportedMethod'
    });

    ChromeExtension.BgNativeHostResultType = Object.freeze({
        PORT_OPEN: 'hostPortOpen',
        PORT_CLOSED: 'hostPortClosed',
        PORT_OPEN_FAILED: 'hostPortOpenFailed',
        PORT_CONNECTION_FAILED: 'hostPortConnectionFailed',
        UNAVAILABLE: 'hostUnavailable'
    });

    // Possible messages between ContactCard application and Chrome Extension
    ChromeExtension.ContactCardMsgType = Object.freeze({
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        READY: 'ready',
        URL_UPDATE: 'urlUpdate',
        GET_PRESENCE: 'getPresence',
        START_CHAT: 'startChat',
        START_AUDIO_CALL: 'startAudioCall',
        START_VIDEO_CALL: 'startVideoCall',
        START_TELEPHONY_CALL: 'startTelephonyCall'
    });

    // Possible responses ContactCard application and Chrome Extension
    ChromeExtension.ContactCardResponse = Object.freeze({
        OK: 'ok',
        FAILED: 'failed',
        CONNECTION_ERROR: 'connectionError',
        BUSY: 'busy',
        UNSUPPORTED_METHOD: 'unsupportedMethod',
        TELEPHONY_UNAVAILABLE: 'telephonyUnavailable',
        WEBAPP_UNAVAILABLE: 'webAppUnavailable',
        COULD_NOT_CONNECT: 'couldNotConnect',
        UNSUPPORTED_OS: 'unsupporteOperationSystem'
    });

    // Possible messages between ContactCard application and Chrome Extension
    ChromeExtension.ScheduleMsgType = Object.freeze({
        CREATE_SCHEDULE_EVENT: 'createScheduleEvent',
        UPDATE_SCHEDULE_EVENT: 'updateScheduleEvent',
        DELETE_SCHEDULE_EVENT: 'deleteScheduleEvent'
    });

    // Exports
    circuit.ChromeExtension = ChromeExtension;

    return circuit;

})(Circuit || {});
