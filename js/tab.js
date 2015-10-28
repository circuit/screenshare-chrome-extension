// Define external globals for JSHint
/*global BgMessageSender, Circuit*/
/*exported Tab*/

function Tab(tabId) {
    'use strict';

    var _logger = Circuit.logger;

    if (!tabId) {
        throw new Error('Cannot create Tab object without a tab Id');
    }
    ///////////////////////////////////////////////////////////////////////////
    // Internal variables
    ///////////////////////////////////////////////////////////////////////////
    var _msgSender = BgMessageSender.getInstance();

    ///////////////////////////////////////////////////////////////////////////
    // Public interfaces
    ///////////////////////////////////////////////////////////////////////////
    this.id = tabId;

    this.lastClientUrl;

    this.info = function (txt, obj) {
        _logger.info(tabId, txt, obj);
    };
    this.debug = function (txt, obj) {
        _logger.debug(tabId, txt, obj);
    };
    this.warning = function (txt, obj) {
        _logger.warning(tabId, txt, obj);
    };
    this.error = function (txt, obj) {
        _logger.error(tabId, txt, obj);
    };
    this.msgRcvd = function (txt, msg) {
        _logger.msgRcvd(tabId, txt, msg);
    };
    this.msgSend = function (txt, msg) {
        _logger.msgSend(tabId, txt, msg);
    };
    this.sendResponse = function (reqId, data, suppressLog) {
        _msgSender.sendResponse(tabId, reqId, data, suppressLog);
    };
    this.sendInternalEvent = function (data) {
        _msgSender.sendInternalEvent(data, tabId);
    };
    this.sendScreenShareEvent = function (data) {
        _msgSender.sendScreenShareEvent(data, tabId);
    };
}
