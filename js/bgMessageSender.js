// Define external globals for JSHint
/*global chrome, console, Circuit*/
/*exported BgMessageSender*/

function BgMessageSender() {
    'use strict';

    // Singleton pattern
    if (BgMessageSender.prototype._singletonInstance) {
        return BgMessageSender.prototype._singletonInstance;
    }
    BgMessageSender.prototype._singletonInstance = this;

    ///////////////////////////////////////////////////////////////////////////
    // Internal variables
    ///////////////////////////////////////////////////////////////////////////
    var ChromeExtension = Circuit.ChromeExtension;
    var _logger = Circuit.logger;

    ///////////////////////////////////////////////////////////////////////////
    // Internal functions
    ///////////////////////////////////////////////////////////////////////////
    function sendMessage(target, msgData, tabId, suppressLog) {
        var msg = {
            target: target,
            suppressLog: !!suppressLog
        };

        // If it is a message from Native Host, we must change the event format
        if ((target === ChromeExtension.BgTarget.CONTACT_CARD) ||
            (target === ChromeExtension.BgTarget.SCHEDULE)) {
            // Copy required fields
            msg.keysToOmitFromLogging = msgData.keysToOmitFromLogging;
            msg.reqId = msgData.reqId;
            msg.type = msgData.type;
            msg.data = msgData.data;
        } else {
            if (msgData && msgData.keysToOmitFromLogging) {
                msg.keysToOmitFromLogging = msgData.keysToOmitFromLogging.map(function (key) {
                    return 'data.' + key;
                });
                delete msgData.keysToOmitFromLogging;
            }
            msg.type = ChromeExtension.BgMsgType.EVENT;
            msg.data = msgData;
        }

        if (!tabId) {
            console.log('[BgMessageSender]: Tab Id not provided. Cannot send message: ', msg);
            return;
        }
        if (!suppressLog) {
            _logger.msgSend(tabId, '[BgMessageSender]:', msg);
        }
        chrome.tabs.sendMessage(tabId, JSON.stringify(msg));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Public interfaces
    ///////////////////////////////////////////////////////////////////////////
    this.sendResponse = function (tabId, reqId, data, suppressLog) {
        var msg = {
            type: ChromeExtension.BgMsgType.RESPONSE,
            reqId: reqId,
            suppressLog: !!suppressLog,
            data: data
        };
        if (data && data.keysToOmitFromLogging) {
            msg.keysToOmitFromLogging = data.keysToOmitFromLogging.map(function (key) {
                return 'data.' + key;
            });
            delete data.keysToOmitFromLogging;
        }

        if (!tabId) {
            console.log('[BgMessageSender] Tab Id not provided. Cannot send message: ', msg);
            return;
        }
        if (!suppressLog) {
            _logger.msgSend(tabId, '[BgMessageSender]: ', msg);
        }
        chrome.tabs.sendMessage(tabId, JSON.stringify(msg));
    };

    this.sendInternalEvent = function (data, tabId) {
        sendMessage(ChromeExtension.BgTarget.INTERNAL, data, tabId);
    };

    this.sendScreenShareEvent = function (data, tabId, supressLog) {
        sendMessage(ChromeExtension.BgTarget.SCREEN_SHARE, data, tabId, supressLog);
    };

    this.sendExchangeConnEvent = function (data, tabId) {
        sendMessage(ChromeExtension.BgTarget.EXCHANGE_CONNECTOR, data, tabId);
    };

    this.sendContactCardMessage = function (tabId, nativeMsgData) {
        sendMessage(ChromeExtension.BgTarget.CONTACT_CARD, nativeMsgData, tabId, true);
    };

    this.sendScheduleMessage = function (tabId, nativeMsgData) {
        sendMessage(ChromeExtension.BgTarget.SCHEDULE, nativeMsgData, tabId, true);
    };
}

BgMessageSender.prototype.constructor = BgMessageSender;
BgMessageSender.prototype.name = 'BgMessageSender';

BgMessageSender.getInstance = function () {
    'use strict';
    var msgSender = new BgMessageSender();
    return msgSender;
};
