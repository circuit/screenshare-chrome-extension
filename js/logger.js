// Define global variables for JSHint
/*global console*/

var Circuit = (function (circuit) {
    'use strict';

    /**
     * Enum for Log level of API logging
     * @class LogLevel
     * @memberOf Circuit
     * @static
     * @final
     * @property Debug - Debug Log Level
     * @property Info - Info Log Level
     * @property Warning - Warning Log Level
     * @property Error - Error Log Level
     */
    var LogLevel = Object.freeze({
        /**
         * @property Debug
         * @type {String}
         * @static
         */
        Debug: 1,
        /**
         * @property Info
         * @type {String}
         * @static
         */
        Info: 2,
        /**
         * @property Warning
         * @type {String}
         * @static
         */
        Warning: 3,
        /**
         * @property Error
         * @type {String}
         * @static
         */
        Error: 4,
        /**
         * @property Off
         * @type {String}
         * @static
         */
        Off: 5
    });

    var _logLevel = LogLevel.Warning;

    /**
     * API logger instance.
     * @static
     * @class logger
     */
    var logger = {
        /**
         * Set the log level for API logging.
         * @method setLevel
         * @param {LogLevel} level Log level
         * @memberof Circuit.logger
         * @example
         *     Circuit.logger.setLevel(Circuit.Enums.LogLevel.Debug);
         */
        setLevel: function (level) {
            _logLevel = level;
        },

        /**
         * Get the log level for API logging.
         * @method getLevel
         * @returns {LogLevel} Log level
         * @memberof Circuit.logger
         * @example
         *     var level = Circuit.logger.getLevel();
         */
        getLevel: function () {
            return _logLevel;
        },

        debug: function () {
            if (_logLevel <= LogLevel.Debug) {
                console.log.apply(console, Array.prototype.slice.apply(arguments));
            }
        },
        info: function () {
            if (_logLevel <= LogLevel.Info) {
                console.info.apply(console, Array.prototype.slice.apply(arguments));
            }
        },
        warning: function () {
            if (_logLevel <= LogLevel.Warning) {
                console.warn.apply(console, Array.prototype.slice.apply(arguments));
            }
        },
        warn: function () {
            if (_logLevel <= LogLevel.Warning) {
                console.warn.apply(console, Array.prototype.slice.apply(arguments));
            }
        },
        error: function (error, obj) {
            if (_logLevel <= LogLevel.Error) {
                error = (error && error.stack) || error;
                obj = (obj && obj.stack) || obj;
                if (obj) {
                    console.error(error, obj);
                } else {
                    console.error(error);
                }
            }
        },
        msgSend: function () {
            if (_logLevel <= LogLevel.Debug) {
                console.log.apply(console, Array.prototype.slice.apply(arguments));
            }
        },
        msgRcvd: function () {
            if (_logLevel <= LogLevel.Debug) {
                console.log.apply(console, Array.prototype.slice.apply(arguments));
            }
        },

        logMsg: function (minLevel, txt, msg) {
            switch (minLevel.name) {
                case 'DEBUG':
                    this.debug(txt, msg);
                    break;
                case 'INFO':
                    this.info(txt, msg);
                    break;
                case 'WARN':
                case 'WARNING':
                    this.info(txt, msg);
                    break;
                case 'ERROR':
                    this.info(txt, msg);
                    break;
                default:
                    this.debug(txt, msg);
            }
        }
    };

    circuit.logger = logger;
    circuit.Enums = circuit.Enums || {};
    circuit.Enums.LogLevel = LogLevel;

    return circuit;

})(Circuit || {});
