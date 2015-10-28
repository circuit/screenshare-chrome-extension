// Define external globals for JSHint

var Circuit = (function (circuit) {
    'use strict';

    function BaseEventTarget(logger) {
        var _listeners = {};

        ///////////////////////////////////////////////////////////////////////////
        // Public interfaces
        ///////////////////////////////////////////////////////////////////////////
        this.dispatch = function (event) {
            var type = event && event.type;
            if (!type) {
                logger && logger.error('[EventTarget]: Attempted to dispatch a bad event');
                return;
            }

            if (_listeners[type]) {
                _listeners[type].forEach(function (listener) {
                    try {
                        listener(event);
                    } catch (e) {
                        logger && logger.error(e);
                    }
                });
            } else {
                logger && logger.debug('[EventTarget]: There is no listener for ' + type);
            }
        };

        this.addEventListener = function (type, listener) {
            if (!type || typeof listener !== 'function') {
                logger && logger.error('[EventTarget]: addEventListener invoked with invalid arguments');
                return;
            }
            if (!_listeners[type]) {
                _listeners[type] = [];
            }
            if (_listeners[type].indexOf(listener) >= 0) {
                logger && logger.warning('[EventTarget]: Attempted to add duplicate event listener');
                return;
            }
            _listeners[type].push(listener);
            logger && logger.debug('[EventTarget]: Added event listener for ' + this.name +
                ', type = ' + type + ', count = ' + _listeners[type].length);
        };

        this.removeEventListener = function (type, listener) {
            if (_listeners[type]) {
                var idx = _listeners[type].indexOf(listener);
                if (idx >= 0) {
                    _listeners[type].splice(idx, 1);
                }

                logger && logger.debug('[EventTarget]: Removed event listener for ' + this.name +
                    ', type = ' + type + ', count = ' + _listeners[type].length);
            }
        };

        this.hasEventListener = function (type) {
            return !!_listeners[type] && _listeners[type].length > 0;
        };

        /**
         * Needed for unit tests, since multiple instances of angular services
         * are created during test execution, so multiple listeners are added.
         * Also used by the SDK to since multiple users are logged in.
         * This API SHALL NOT be used by IMP client itself.
         */
        this.removeAllListeners = function () {
            _listeners = {};
        };
    }

    BaseEventTarget.prototype.constructor = BaseEventTarget;

    // Helper function to create a generic event with no data
    BaseEventTarget.prototype.createEvent = function (type) {
        return {type: type};
    };

    // Helper function to dispatch a generic event with no data
    BaseEventTarget.prototype.dispatchEvent = function (type) {
        var evt = this.createEvent(type);
        this.dispatch(evt);
    };

    // Exports
    circuit.BaseEventTarget = BaseEventTarget;

    return circuit;

})(Circuit || {});
