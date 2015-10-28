// Define external globals for JSHint
/*global chrome, CustomEvent, document, window*/

/**
 * This is the content script injected by the Ansible Extension when it's installed or
 * when it detects that a chrome tab is being loaded.
 * Note that there might be multiple instances of this content script if the Extension is
 * reloaded multiple times or is updated from the webstore. But only one instance should be
 * valid.
 */
(function () {
    'use strict';

    var _id = ''; // This id is supposed to uniquely identify a particular content instance

    function sendMsgToExtensionEvtHandler(evt) {
        try {
            // Relay the message to the extension through the chrome.runtime API
            // Only the extension that injected this content instance should
            // be able to receive it.
            chrome.runtime.sendMessage(evt.detail, function () {});
        } catch (e) {
            // The extension is not receiving messages. It could have crashed, uninstalled or
            // disabled. Send an error back to the webclient.
            logError('[ansible-content] Error sending message to extension. Unregistering this content script. Id: ' + _id, evt.detail);
            var pDetail = JSON.parse(evt.detail);
            if (pDetail.reqId) {
                sendMsgToWebClient('internal',
                'response', {
                    error: 'unregistered'
                }, pDetail.reqId);
            }
            // Since this content script and extension are useless now, unregister them.
            // The webclient has a ping timer that will detect if there are no content scripts available
            // and remove the extension signature.
            unregisterExtension(_id);
        }
    }

    function sendMsgToWebClient(target, type, msg, reqId) {
        var evt = new CustomEvent('fromExtension', {
            detail: JSON.stringify({
                target: target,
                type: type,
                reqId: reqId,
                data: msg
            })
        });
        document.dispatchEvent(evt);
    }

    function unregisterContentEvtHandler(evt) {
        // We need to be careful not to unregister a valid event handler,
        // that's why we're checking the id here. But if no id is supplied in
        // the event details, we're assuming that all event handlers need to be
        // unregistered.
        if (!evt.detail.id || evt.detail.id === _id) {
            logDebug('[ansible-content] Removing old event listener. Id: ' + _id);
            document.removeEventListener('toExtension', sendMsgToExtensionEvtHandler);
            document.removeEventListener('unregisterContent', unregisterContentEvtHandler);
        }
    }

    function registerExtension(version) {
        // Register the event handler that will relay the webclient messages to the extension
        document.addEventListener('toExtension', sendMsgToExtensionEvtHandler);
        // Register the event handler that will unregister this content script instance (cleanup code)
        document.addEventListener('unregisterContent', unregisterContentEvtHandler);

        logInfo('[ansible-content] Ansible Extension Signature injected. Sending init message...');
        var div = document.createElement('div');
        div.id = 'ansibleChromeExtensionSignature';
        div.hidden = true;
        div.setAttribute('contentScriptId', _id);
        document.body.appendChild(div);

        // Send this event to the tab's main page. Only the Ansible
        // Web client will reply to this message.
        sendMsgToWebClient('internal', 'event', {type: 'initMsg', version: version});
    }

    function unregisterExtension(id) {
        var event = new CustomEvent('unregisterContent', {
            detail: {
                id: id
            }
        });
        // This event will be received by all content script instances
        document.dispatchEvent(event);
    }

    // This logging function only sends a message to the webclient, which will
    // actually log the messages
    function log(level, levelName, msg, obj) {
        var loggingEvent = {
            type: 'log',
            log: {
                level: {
                    level: level,
                    name: levelName
                },
                messages: [msg]
            }
        };
        obj && loggingEvent.log.messages.push(obj);
        sendMsgToWebClient('log', 'event', loggingEvent);
    }

    function logDebug(msg, obj) {
        log(20000, 'DEBUG', msg, obj);
    }

    function logInfo(msg, obj) {
        log(30000, 'INFO', msg, obj);
    }

    function logError(msg, obj) {
        log(50000, 'ERROR', msg, obj);
    }

    // This handles messages from the Extension
    chrome.runtime.onMessage.addListener(function (msg) {
        if (!msg) {
            return;
        }
        var parsed = {};
        try {
            parsed = JSON.parse(msg);
        } catch (e) {
            logError('[ansible-content] Invalid message from background: ' +
                msg, e);
            return;
        }
        var div = document.getElementById('ansibleChromeExtensionSignature');
        if (parsed.target === 'internal') {
            if (parsed.data.type === 'injectChromeAppSignature') {
                _id = (new Date()).getTime();
                logInfo('[ansible-content] Injecting Ansible signature. Version: ' + parsed.data.version + ' ' + _id);
                // Create <div> with our "signature". That's how we can tell if
                // there's a registered extension or not

                if (div) {
                    logInfo('[ansible-content] Found previously injected content. Updating it.');
                    div.setAttribute('contentScriptId', _id);
                }
                unregisterExtension(); // This will unregister all previous listeners
                registerExtension(parsed.data.version);
                return;
            } else if (parsed.data.type === 'getWindowSize') {
                // Get the browser's size and position and send it back to the extension
                var w = window.innerWidth || document.documentElement.clientWidth ||
                        document.body.clientWidth;
                var h = window.innerHeight || document.documentElement.clientHeight ||
                        document.body.clientHeight;
                var x = window.screenX || window.screenLeft;
                var y = window.screenY || window.screenTop;
                sendMsgToExtensionEvtHandler({
                    detail: JSON.stringify({
                        target: 'exchange_connector',
                        type: 'event',
                        data: {
                            method: 'getWindowSize',
                            h: h,
                            w: w,
                            x: x,
                            y: y
                        }
                    })
                });
                return;
            }
        }

        if (div && div.getAttribute('contentScriptId') !== String(_id)) {
            // Since we can't remove this event listener for a particular content script instance, it
            // can be invoked multiple times, causing duplicate messages being sent to the
            // webclient. So verify if it's the _id matches the one stored in the div. Otherwise,
            // discard it.
            return;
        }
        // Forward message to webclient
        var event = new CustomEvent('fromExtension', { detail : msg });
        document.dispatchEvent(event);
    });

    logInfo('[ansible-content] ansible-content.js injected!');
})();
