// Define external globals for JSHint
/*global BgScreenShareHandler, chrome, Circuit, console, ExtUtils, Tab*/

(function () {
    'use strict';

    var ChromeExtension = Circuit.ChromeExtension;

    var INIT_SCRIPT_INJECT = 'typeof (isAnsibleContentLoaded) !== \'undefined\' || chrome.extension.sendRequest({ loaded: false })';

    var _logger = Circuit.logger;
    var _screenShareHandler = new BgScreenShareHandler();

    ///////////////////////////////////////////////////////////////////////////
    // Internal functions
    ///////////////////////////////////////////////////////////////////////////
    function injectScript(tab) {
        if (tab.id && tab.status === 'complete' && tab.url && tab.url.indexOf('chrome') !== 0) {
            chrome.tabs.executeScript(tab.id, {code: INIT_SCRIPT_INJECT}, function () {
                if (!chrome.runtime.lastError) {
                    console.log('[Background]: Initialized extension for tabId = ' + tab.id + ', url = ' + tab.url);
                }
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Content Script Initialization message
    ///////////////////////////////////////////////////////////////////////////
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo && changeInfo.status === 'complete') {
            // The tab has just changed state from loading to complete. Try to inject the script now.
            injectScript(tab);
        }
    });

    ///////////////////////////////////////////////////////////////////////////
    // Content Script Request Listener - Content Script Initialization
    ///////////////////////////////////////////////////////////////////////////
    chrome.extension.onRequest.addListener(function (req, sender) {
        var tab = new Tab(sender.tab.id);
        tab.msgRcvd('[Background]: Message from content script:', req);
        if (req.loaded === false) {
            var cb = function () {
                tab.sendInternalEvent({
                    type: ChromeExtension.BgInternalMsgType.INJECT_SIGNATURE,
                    version: chrome.app.getDetails().version
                });

                chrome.tabs.executeScript(sender.tab.id, {
                    code: 'var isAnsibleContentLoaded = true;'
                });

                // This API will trigger a silent update of the extension, if available
                chrome.runtime.requestUpdateCheck(function (status, details) {
                    tab.info('[Background]: Request update check result:', [status, details]);
                });
            };
            chrome.tabs.executeScript(sender.tab.id, {file: 'js/ansible-content.js'}, cb);
        }
    });

    ///////////////////////////////////////////////////////////////////////////
    // WebClient Messages Listener
    ///////////////////////////////////////////////////////////////////////////
    chrome.runtime.onMessage.addListener(function (msg, sender) {
        if (!msg) {
            return;
        }
        var tab = new Tab(sender.tab.id);

        var msgData = {};
        try {
            msgData = JSON.parse(msg);
        } catch (e) {
            tab.error('[Background]: Unknown message from webclient.', e);
        }

        if (!msgData.suppressLog) {
            tab.msgRcvd('[Background]: ', msgData);
        }

        switch (msgData.target) {
        case ChromeExtension.BgTarget.INTERNAL:
            switch (msgData.data.type) {
            case ChromeExtension.BgInternalMsgType.INIT_MSG_ACK:
                tab.debug('[Background]: Extension initialization completed');

                // ... show the page action.
                chrome.pageAction.show(tab.id);

                tab.debug('[Background]: Set last web client tabId to', sender.tab.id);
                _logger.setLastClientTabId(tab.id);
                tab.lastClientUrl = ExtUtils.getHostNameFromUrl(sender.tab.url);
                break;
            case ChromeExtension.BgInternalMsgType.IS_ALIVE:
                tab.sendResponse(msgData.reqId, null, true);
                break;
            default:
                tab.warning('[Background]: Unexpected internal message type');
                break;
            }
            break;
        case ChromeExtension.BgTarget.SCREEN_SHARE:
            tab.chromeTabObj = sender.tab;
            _screenShareHandler.onWebClientMsg(tab, msgData);
            break;
        default:
            tab.warning('[Background]: Unexpected message target: ', msgData.target);
            tab.sendResponse(msgData.reqId, {error: ChromeExtension.ResponseError.UNSUPPORTED_REQUEST});
            break;
        }
        return true;
    });

    ///////////////////////////////////////////////////////////////////////////
    // Ansible Content Script Installer
    ///////////////////////////////////////////////////////////////////////////
    chrome.runtime.onInstalled.addListener(function (details) {
        console.log('[Background]: onInstalled event was fired. reason = ', details.reason);

        // When installed, we need to inject our scripts to the existing webclient.
        // We don't know if it's open, so we try every tab.
        chrome.tabs.query({}, function (tabs) {
            if (tabs && tabs.length > 0) {
                tabs.forEach(injectScript);
            }
        });
    });

    chrome.runtime.onUpdateAvailable.addListener(function (details) {
        _logger.info(null, '[Background]: Update available:', details);
        chrome.runtime.reload();
    });
})();
