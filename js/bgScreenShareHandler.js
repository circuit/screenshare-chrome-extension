// Define external globals for JSHint
/*global chrome, Circuit*/
/*exported BgScreenShareHandler*/

function BgScreenShareHandler() {
    'use strict';

    // Imports
    var ChromeExtension = Circuit.ChromeExtension;

    ///////////////////////////////////////////////////////////////////////////
    // Internal functions
    ///////////////////////////////////////////////////////////////////////////
    function chooseDesktopMedia(tab) {
        chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], tab.chromeTabObj, function (streamId) {
            if (streamId) {
                tab.sendScreenShareEvent({
                    type: ChromeExtension.BgScreenShareMsgType.CHOOSE_DESKTOP_MEDIA_DONE,
                    streamId: streamId
                });
            } else {
                tab.sendScreenShareEvent({
                    type: ChromeExtension.BgScreenShareMsgType.CHOOSE_DESKTOP_MEDIA_CANCELLED
                });
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    // Public interfaces
    ///////////////////////////////////////////////////////////////////////////
    this.onWebClientMsg = function (tab, msg) {
        var asyncReply;
        switch (msg.data.type) {
        case ChromeExtension.BgScreenShareMsgType.CHOOSE_DESKTOP_MEDIA:
            asyncReply = chooseDesktopMedia(tab);
            break;
        default:
            tab.warning('[BgScreenShareHandler]: Unexpected request type - ', msg.data.type);
            break;
        }
        if (!asyncReply) {
            // Send response to acknowledge the request
            tab.sendResponse(msg.reqId);
        }
    };
}
