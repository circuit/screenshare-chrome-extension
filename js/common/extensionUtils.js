/*global chrome, document*/
/*exported ExtUtils*/

// Define the object
var ExtUtils = {};

/*
 * Pseudo-classical OOP pattern
 * Child and Parent must be constructor function
 */
ExtUtils.inherit = function (Child, Parent) {
    'use strict';
    function F() {}
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.parent = Parent.prototype;
};

ExtUtils.json2xml = function (obj, tag) {
    'use strict';
    if (obj === undefined || obj === null) {
        return tag ? ('<' + tag + '/>') : '';
    }

    var xml = '';

    var endTag;
    if (tag) {
        // Remove any attributes from the end tag
        var idx = tag.indexOf(' ');
        endTag = (idx === -1) ? tag : tag.slice(0, idx);
    }

    function addElement(value) {
        if (tag) {
            xml += '<' + tag + '>' + value + '</' + endTag + '>';
        } else {
            xml += value;
        }
    }

    switch (typeof obj) {
    case 'string':
        var str = obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        addElement(str);
        break;
    case 'object':
        if (obj instanceof Date) {
            addElement(obj.toISOString());
        } else if (obj instanceof Array) {
            if (tag) {
                xml += '<' + tag + '>';
            }
            obj.forEach(function (o) {
                xml += ExtUtils.json2xml(o, 'item');
            });
            if (tag) {
                xml += '</' + endTag + '>';
            }
        } else {
            if (tag) {
                xml += '<' + tag + '>';
            }
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr) && (typeof obj[attr] !== 'function')) {
                    xml += ExtUtils.json2xml(obj[attr], attr);
                }
            }
            if (tag) {
                xml += '</' + endTag + '>';
            }
        }
        break;
    default:
        addElement(obj);
        break;
    }
    return xml;
};

ExtUtils.getHostNameFromUrl = function (url) {
    'use strict';
    // Parses the host from a given url
    var a = document.createElement('a');
    a.href = url;

    // Chrome will default to domain where script is called from if invalid
    return url.indexOf(a.host) !== -1 ? a.host : '';
};

//////////////////////////////////////////////////
// Chrome Window Handling functions
//////////////////////////////////////////////////
// Create WebApp on new tab or New Window
ExtUtils.startNewWebAppWindow = function (url) {
    'use strict';
    // trying to create a tab
    chrome.tabs.create({url: url}, function (tab) {
        if (!tab) {
            // probably no window available
            chrome.windows.create({url: url}, function (win) {
                // better to focus after window creation callback
                chrome.windows.update(win.id, {focused: true});
            });
        } else {
            // better to focus after tab creation callback
            chrome.windows.update(tab.windowId, {focused: true});
        }
    });
};

// Find if the App is running
ExtUtils.focusOnExistingWebApp = function (win, currTab) {
    'use strict';
    if (win) {
        currTab.debug('[ExtUtils]: WebApp Window: ', win.id);
        if (win.state === 'minimized') {
            chrome.windows.update(win.id, {state: 'normal', focused: true}, function (win) {
                currTab.debug('[ExtUtils]: WebApp Window state: ', win.state);
                chrome.tabs.update(currTab.id, {highlighted: true, active: true}, function () {
                    currTab.debug('[ExtUtils]: WebApp Window tab: ', currTab.id);
                });
            });
        }
        chrome.windows.update(win.id, {focused: true}, function (win) {
            currTab.debug('[ExtUtils]: WebApp Window state: ', win.state);
            chrome.tabs.update(currTab.id, {highlighted: true, active: true}, function () {
                currTab.debug('[ExtUtils]: WebApp Window tab: ', currTab.id);
            });
        });
    }
};

// Find the tab where the app is running
ExtUtils.findWebAppWindow = function (currTab, focus, cb) {
    'use strict';
    var isWebAppRunning = false;
    if (!currTab) {
        currTab.error('[ExtUtils] No WebApp stored');
    }
    currTab.debug('[ExtUtils] Current stored WebApp tab Id: ', currTab.id);
    try {
        chrome.windows.getCurrent({'populate': true}, function (win) {
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    if (currTab.id === tab.id) {
                        // WebApp tab found. Just put in focus
                        currTab.info('[ExtUtils] WebApp running. Tab URL', tab.url);
                        isWebAppRunning = true;
                        if (focus) {
                            ExtUtils.focusOnExistingWebApp(win, currTab);
                        }
                    }
                }
                if (!isWebAppRunning && focus) {
                    // WebApp Tab not found. We need to start WebApp in new Window
                    ExtUtils.startNewWebAppWindow('https://' + currTab.lastClientUrl);
                    currTab.debug('[ExtUtils] Starting WebApp with url:', currTab.url);
                }
                cb(isWebAppRunning);
            });
        });
    }
    catch (e) {
        currTab.debug('[ExtUtils]: No Window open', e);
    }
};
