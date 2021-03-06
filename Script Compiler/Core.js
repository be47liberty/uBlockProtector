//@pragma-keepline uBlock Protector Core Library Start
"use strict";

//=====Initializer=====
/**
 * Initialization.
 * @function
 * @param {boolean} excluded - Whether this domain should be excluded from generic solutions.
 * @param {boolean} AdflyMatch - Whether this domain is an Adfly domain.
 * @param {boolean} AdflyUnmatch - Whether this domain should be excluded from Adfly bypasser.
 */
a.init = (excluded, AdflyMatch, AdflyUnmatch) => {
    //Load configurations
    a.config();
    //Log domain
    a.out.warn(`Domain: ${a.dom}`);
    //Check excluded domains
    a.config.domExcluded = excluded;
    excluded && a.out.warn("This domain is in the excluded list.");
    //Check Adfly
    if (!excluded && (AdflyMatch || (a.config.aggressiveAdflyBypasser && !AdflyUnmatch))) {
        a.generic.AdflyBypasser();
    }
    //Apply mods
    a.mods();
    //Set menu commands
    GM_registerMenuCommand("uBlock Protector Settings Page", () => {
        GM_openInTab(a.c.settingsPage);
    });
    GM_registerMenuCommand("uBlock Protector Home Page", () => {
        GM_openInTab(a.c.homePage);
    });
    GM_registerMenuCommand("uBlock Protector Support Page", () => {
        GM_openInTab(a.c.supportPage);
    });
    //Home page installation test
    if (a.domCmp(["jspenguin2017.github.io"], true) && a.win.location.pathname.startsWith("/uBlockProtector/")) {
        a.win.uBlock_Protector_Script = true;
    }
    //Settings page
    if (a.domCmp(["jspenguin2017.github.io"], true) && a.win.location.pathname.startsWith("/uBlockProtector/settings.html")) {
        a.on("load", () => {
            a.win.init({
                "config_debugMode": a.config.debugMode,
                "config_allowExperimental": a.config.allowExperimental,
                "config_aggressiveAdflyBypasser": a.config.aggressiveAdflyBypasser,
                "mods_Facebook_JumpToTop": a.mods.Facebook_JumpToTop,
                "mods_Blogspot_AutoNCR": a.mods.Blogspot_AutoNCR,
                "mods_NoAutoplay": a.mods.NoAutoplay,
            }, a.config.update);
        });
    }
};

//=====Configurations=====
/**
 * Load configurations, includes mods configurations.
 * @function
 */
a.config = () => {
    //Configuration
    a.config.debugMode = GM_getValue("config_debugMode", a.config.debugMode);
    a.config.allowExperimental = GM_getValue("config_allowExperimental", a.config.allowExperimental);
    a.config.aggressiveAdflyBypasser = GM_getValue("config_aggressiveAdflyBypasser", a.config.aggressiveAdflyBypasser);
    //Mods
    a.mods.Facebook_JumpToTop = GM_getValue("mods_Facebook_JumpToTop", a.mods.Facebook_JumpToTop);
    a.mods.Blogspot_AutoNCR = GM_getValue("mods_Blogspot_AutoNCR", a.mods.Blogspot_AutoNCR);
    a.mods.NoAutoplay = GM_getValue("mods_NoAutoplay", a.mods.NoAutoplay);
};
/**
 * Update a configuration.
 * @function
 * @param {integer} id - The ID of the configuration.
 * @param {bool} val - The new value of the configuration.
 */
a.config.update = (id, val) => {
    const names = [
        "config_debugMode",
        "config_allowExperimental",
        "config_aggressiveAdflyBypasser",
        "mods_Facebook_JumpToTop",
        "mods_Blogspot_AutoNCR",
        "mods_NoAutoplay",
    ];
    //Sanity check then save settings
    if (names.includes(id)) {
        GM_setValue(id, Boolean(val));
    }
};
/**
 * Whether debug data should be logged.
 * The default value is false.
 * @const {bool}
 */
a.config.debugMode = false;
/**
 * Whether generic solutions should be applied.
 * This settings is currently not exposed to the user.
 * This settings can be overwritten by a rule.
 * @var {bool}
 */
a.config.allowGeneric = true;
/**
 * Whether experimental features should run.
 * The default value is true.
 * @const {bool}
 */
a.config.allowExperimental = true;
/**
 * Whether Adfly bypasser should run on all pages.
 * The handler will check to make sure the page is an Adfly page.
 * The default value is true.
 * @const {bool}
 */
a.config.aggressiveAdflyBypasser = true;
/**
 * Whether current domain is "excluded".
 * How this will be treated depends on the rules.
 * Generic solutions will not apply if this is true.
 * Will be assigned by a.init().
 * @const {bool}
 */
a.config.domExcluded = null;

//=====Miscellaneous=====
/**
 * The unsafeWindow.
 * @const {Object}
 */
a.win = unsafeWindow;
/**
 * The document of unsafeWindow.
 * @const {Object}
 */
a.doc = a.win.document;
/**
 * The console of unsafeWindow.
 * @const {Object}
 */
a.out = a.win.console;
/**
 * The domain of current document.
 * @const {string}
 */
a.dom = a.doc.domain;
/**
 * The real addEventListener.
 * @const {Function}
 */
a.on = a.win.addEventListener.bind(a.win);
/**
 * The real setTimeout.
 * @const {Function}
 */
a.setTimeout = a.win.setTimeout.bind(a.win);
/**
 * The real clearTimeout.
 * @const {Function}
 */
a.clearTimeout = a.win.clearTimeout.bind(a.win);
/**
 * The real setInterval.
 * @const {Function}
 */
a.setInterval = a.win.setInterval.bind(a.win);
/**
 * The real clearInterval.
 * @const {Function}
 */
a.clearInterval = a.win.clearInterval.bind(a.win);
/**
 * Matching methods.
 * @const {Enumeration}
 */
a.matchMethod = {
    matchAll: 0, //Match all, omit defaults to this
    string: 1, //Partial string match
    stringExact: 2, //Exact string match, will result in match if one or more arguments matches the filter
    RegExp: 3, //Regular expression
    callback: 4, //Callback, arguments list will be supplied as an array, return true for match and false for not match
};
/**
 * Apply matching.
 * @function
 * @param {Array} args - Elements to match.
 * @param {Enumeration} method - The method to use.
 * @param {Any} filter - The appropriate filter.
 * @return {boolean} True if there is a match, false otherwise.
 */
a.applyMatch = (args, method, filter) => {
    switch (method) {
        case a.matchMethod.string:
            for (let i = 0; i < args.length; i++) {
                if (String(args[i]).includes(filter)) {
                    return true;
                }
            }
            break;
        case a.matchMethod.stringExact:
            for (let i = 0; i < args.length; i++) {
                if (filter === String(args[i])) {
                    return true;
                }
            }
            break;
        case a.matchMethod.RegExp:
            for (let i = 0; i < args.length; i++) {
                if (filter.test(String(args[i]))) {
                    return true;
                }
            }
            break;
        case a.matchMethod.callback:
            return filter(args);
        default:
            //Match all
            return true;
    }
    //Not matched
    return false;
};

//=====Libraries=====
/**
 * jQuery, lazy load as it takes a while.
 * @const {Object}
 */
a.win.Object.defineProperty(a, "$", {
    configurable: true,
    enumerable: true,
    get() {
        const val = a.make$();
        a.win.Object.defineProperty(a, "$", {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val,
        });
        return val;
    },
});
/**
 * yamd5, lazy load as it is rarely used.
 * @const {Object}
 */
a.win.Object.defineProperty(a, "md5", {
    configurable: true,
    enumerable: true,
    get() {
        const val = a.MD5Factory();
        a.win.Object.defineProperty(a, "md5", {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val,
        });
        return val;
    },
});

//=====Constants=====
/**
 * Object containing all constants.
 * @const {Object}
 */
a.c = {};
/**
 * The settings page of this project.
 * @const {string}
 */
a.c.settingsPage = "https://jspenguin2017.github.io/uBlockProtector/settings.html";
/**
 * The home page of this project.
 * @const {string}
 */
a.c.homePage = "https://jspenguin2017.github.io/uBlockProtector/";
/**
 * The support (issues) page of this project.
 * @const {string}
 */
a.c.supportPage = "https://github.com/jspenguin2017/uBlockProtector/issues";
/**
 * A string that will crash any JavaScript by syntax error when added to anywhere of its code.
 * @const {string}
 */
a.c.syntaxBreaker = "])} \"'` ])} \n\r \r\n */ ])}";
/**
 * Whether this script is running on the top frame.
 * @const {boolean}
 */
a.c.topFrame = (() => {
    try {
        return a.win.self === a.win.top;
    } catch (err) {
        //a.win.top was not accessible due to security reasons (means the script is not on the top frame)
        return false;
    }
})();

//=====Mods=====
/**
 * Apply all mods.
 * @function
 */
a.mods = () => {
    //===Facebook mods===
    if (a.c.topFrame && a.domCmp(["facebook.com"], true)) {
        (function addJumpToTop() {
            //Jump To Top button
            if (a.mods.Facebook_JumpToTop) {
                //Stop if the button already exist, this should not be needed, but just to be sure
                if (a.$("#uBlock_Protector_FBMod_JumpToTop").length > 0) {
                    return;
                }
                //Check if the nav bar is there
                const navBar = a.$("div[role='navigation']");
                if (navBar.length > 0) {
                    //Present, insert button
                    navBar.first().append(`<div class="_4kny _2s24" id="uBlock_Protector_FBMod_JumpToTop"><div class="_3qcu _cy7"><a class="_2s25" href="javascript: void(0);">Top</a></div></div>`);
                    a.$("#uBlock_Protector_FBMod_JumpToTop").click(() => {
                        a.win.scrollTo(a.win.scrollX, 0);
                    });
                    a.out.info("Facebook Mod: Jump to Top button added.");
                } else {
                    //Wait a little bit for the window to load, for some reason load event does not work
                    a.setTimeout(addJumpToTop, 500);
                }
            }
        })();
    }
    //===Blogspot mods===
    if (a.c.topFrame && a.mods.Blogspot_AutoNCR && a.domInc(["blogspot"], true) && !a.domCmp(["blogspot.com"], true)) {
        //Auto NCR (No Country Redirect) redirect
        const name = a.dom.replace("www.", "").split(".")[0];
        const path = a.win.location.href.split("/").slice(3).join("/");
        a.out.info("Blogspot Mod: Redirecting to NCR...");
        a.win.location.href = `http://${name}.blogspot.com/ncr/${path}`;
    }
    //===No autoplay mods===
    if (a.mods.NoAutoplay) {
        const disableMsg = "No Autoplay Mod: Autoplay disabled.";
        if (a.domCmp(["x-link.pl"], true)) {
            //iframe of gs24.pl
            a.observe("insert", (node) => {
                if (node.tagName === "VIDEO") {
                    node.onplay = (() => {
                        //I need to pause twice
                        let playCount = 2;
                        return function () {
                            playCount--;
                            this.pause();
                            if (playCount === 0) {
                                //Paused twice, detach event handler
                                this.onplay = null;
                            }
                        };
                    })();
                }
            });
            a.out.info(disableMsg);
        }
        if (a.domCmp(["komputerswiat.pl"], true)) {
            let token = a.setInterval(() => {
                if (a.$("video").length > 0) {
                    //Get element
                    const player = a.$("video").first();
                    //Block play
                    player[0].onplay = function () {
                        this.pause();
                    };
                    //Replace player
                    player.parents().eq(5).after(a.nativePlayer(player.attr("src"))).remove();
                    a.clearInterval(token);
                }
            }, 1000);
            a.out.info(disableMsg);
        }
        if (a.domCmp(["onet.tv"], true)) {
            //iframe of onet.pl
            a.observe("insert", (node) => {
                if (node && node.firstChild && node.firstChild.tagName === "VIDEO") {
                    //The inserted node is a div with video inside
                    node.firstChild.onplay = function () {
                        this.pause();
                        this.onplay = null;
                    };
                }
            });
            a.out.info(disableMsg);
        }
    }
};
/**
 * Whether a Jump To Top button should be added to Facebook.
 * The default value is true.
 * @const {bool}
 */
a.mods.Facebook_JumpToTop = true;
/**
 * Whether blogspot blogs should be automatically redirected to NCR (No Country Redirect) version.
 * Does not work if the blog is not top frame.
 * The default value is false.
 * @const {bool}
 */
a.mods.Blogspot_AutoNCR = false;
/**
 * Whether autoplay should be disabled on supported websites.
 * The default value is false.
 * @const {bool}
 */
a.mods.NoAutoplay = false;

//=====Common Functions=====
/**
 * Returns a new jQuery.
 * @function
 */
a.make$ = () => a.jQueryFactory(a.win, true);
/**
 * Write an error message to console.
 * @function
 * @param {string} [name=""] - The name of the AdBlocker detector.
 */
a.err = (name = "") => {
    //Check argument
    name && (name += " ");
    //Write error message
    a.out.error(`Uncaught AdBlock Error: ${name}AdBlocker detector is not allowed on this device!`);
};
/**
 * Check if current domain ends with one of the domains in the list.
 * Example: "google.com" will match "google.com" and domains ending with ".google.com"
 * @function
 * @param {Array.<string>} domList - The list of domains to compare.
 * @param {boolean} [noErr=false] - Set to true to prevent showing error message.
 * @return {boolean} True if current domain is in the list, false otherwise.
 */
a.domCmp = (domList, noErr) => {
    //Loop though each element
    for (let i = 0; i < domList.length; i++) {
        if (a.dom.endsWith(domList[i]) &&
            (a.dom.length === domList[i].length || a.dom.charAt(a.dom.length - domList[i].length - 1) === '.')) {
            return (!noErr && a.err()), true;
        }
    }
    return false;
};
/**
 * Check if current domain includes one of the strings that is in the list.
 * Example: "example" will match domains starting with "example." and domains that include ".example."
 *          "www.example" will match domains starting with "www.example." and domains that includes ".www.example."
 * @function
 * @param {Array.<string>} domList - The list of strings to compare.
 * @param {boolean} [noErr=false] - Set to true to prevent showing error message.
 * @return {boolean} True if current domain is in the list, false otherwise.
 */
a.domInc = (domList, noErr) => {
    //Loop though each element
    for (let i = 0; i < domList.length; i++) {
        let index = a.dom.indexOf(domList[i] + ".");
        switch (index) {
            case -1: break;
            case 0: return (!noErr && a.err()), true;
            default:
                if (a.dom.charAt(index - 1) === '.') {
                    return (!noErr && a.err()), true;
                }
                break;
        }
    }
    return false;
};
/**
 * Replace Function.prototype.toString() in order to prevent protected functions from being detected.
 * This function should be called from rules once if needed.
 * @function
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.protectFunc = () => {
    //Update flag
    a.protectFunc.enabled = true;
    //The original function
    const original = a.win.Function.prototype.toString;
    //New function
    const newFunc = function () {
        //Check if function "this" is in the protected list
        const index = a.protectFunc.pointers.indexOf(this);
        if (index === -1) {
            //Not protected, use original function to proceed
            return original.apply(this);
        } else {
            //Protected, return the mask string
            return a.protectFunc.masks[index];
        }
    };
    //Try to replace toString()
    try {
        a.win.Function.prototype.toString = newFunc;
        //Protect this function as well
        a.protectFunc.pointers.push(newFunc);
        a.protectFunc.masks.push(String(original));
        //Activate log
        a.out.warn("Functions protected.");
    } catch (err) {
        //Failed to protect
        a.out.error("uBlock Protector failed to protect functions!");
        return false;
    }
    return true;
};
/**
 * Whether protect functions is enabled.
 * @var {bool}
 */
a.protectFunc.enabled = false;
/**
 * Pointers to protected functions.
 * @var {Array.<Function>}
 */
a.protectFunc.pointers = [];
/**
 * Mask of protected functions.
 * @var {Array.<string>}
 */
a.protectFunc.masks = [];
/**
 * Filter a function.
 * @function
 * @param {string} func - The name of the function to filter, use "." to separate multiple layers.
 * @param {Enumeration} [method=Match All] - An option from a.matchMethods, omit or pass null defaults to match all.
 * @param {Any} filter - Filter to apply, this must be appropriate for the method.
 * @param {Function} [onMatch=undefined] - Callback when filter is matched, arguments list (as an array) will be supplied, return value of this callback will be send back to caller.
 * @param {Function} [onAfter=undefined] - Callback when filter is applied, match state (true for blocked, false for allowed) and arguments list (as an array) will be supplied.
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.filter = (func, method, filter, onMatch, onAfter) => {
    //The original function and its parent, will be set later
    let original = a.win;
    let parent;
    //The replacement function with filters
    const newFunc = (...args) => {
        //Call log
        if (a.config.debugMode) {
            a.out.warn(`${func} is called with these arguments:`);
            for (let i = 0; i < args.length; i++) {
                a.out.warn(String(args[i]));
            }
        }
        //Apply filter
        if (!method || a.applyMatch(args, method, filter)) {
            //Not allowed
            a.err();
            let ret = undefined;
            if (onMatch) {
                ret = onMatch(args);
            }
            onAfter && onAfter(true, args);
            return ret;
        }
        //Tests passed log
        a.out.info("Tests passed.");
        //Allowed
        onAfter && onAfter(false, args);
        return original.apply(parent, args);
    };
    //Try to replace the function
    try {
        let parent = a.win;
        let name = func; //Need to copy as I need to change it
        let i = name.indexOf(".");
        while (i > -1) {
            parent = parent[name.substring(0, i)];
            name = name.substring(i + 1);
            i = name.indexOf(".");
        }
        //Replace
        original = parent[name];
        parent[name] = newFunc;
        //Add this filter to protection list
        if (a.protectFunc.enabled) {
            a.protectFunc.pointers.push(newFunc);
            a.protectFunc.masks.push(String(original));
        }
        //Activate log
        a.out.warn(`Filter activated on ${func}`);
    } catch (err) {
        //Failed to activate
        a.out.error(`uBlock Protector failed to activate filter on ${func}!`);
        return false;
    }
    return true;
};
/**
 * Change the execution delay for setTimeout or setInterval.
 * @function
 * @param {string} func - The name of the function to patch, can be "setTimeout" or "setInterval".
 * @param {Enumeration} [method=Match All] - An option from a.matchMethods, omit or pass null defaults to match all.
 * @param {Any} filter - Filter to apply, this must be appropriate for the method.
 * @param {Function} [onMatch=undefined] - Callback when filter is matched, arguments list (as an array) will be supplied.
 * @param {Function} [onAfter=undefined] - Callback when filter is applied, match state (true for blocked, false for allowed) and arguments list (as an array) will be supplied.
 * @param {float} [ratio=0.02] - The boost ratio, between 0 and 1 for speed up, larger than 1 for slow down, defaults to speed up 50 times.
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.timewarp = (func, method, filter, onMatch, onAfter, ratio = 0.02) => {
    //The original function
    const original = a.win[func];
    //The replacement function with timewarp
    const newFunc = (...args) => {
        //Call log
        if (a.config.debugMode) {
            a.out.warn(`Timewarpped ${func} is called with these arguments:`);
            for (let i = 0; i < args.length; i++) {
                a.out.warn(String(args[i]));
            }
        }
        //Check if I need to timewarp this function
        if (!method || a.applyMatch(args, method, filter)) {
            //Timewarp
            a.out.warn("Timewarpped.");
            onMatch && onMatch(args);
            onAfter && onAfter(true, args);
            args[1] *= ratio;
            return original.apply(a.win, args);
        } else {
            //Do not timewarp
            a.out.info("Not timewarpped.");
            onAfter && onAfter(false, args);
            return original.apply(a.win, args);
        }
    };
    //Try to replace the function
    try {
        a.win[func] = newFunc;
        //Add this filter to protection list
        if (a.protectFunc.enabled) {
            a.protectFunc.pointers.push(newFunc);
            a.protectFunc.masks.push(String(original));
        }
        //Activate log
        a.out.warn(`Timewarp activated on ${func}`);
    } catch (err) {
        //Failed to activate
        a.out.error(`uBlock Protector failed to apply timewarp on ${func}!`);
        return false;
    }
    return true;
};
/**
 * Patch the HTML, this must be ran on document-start.
 * Warning: This breaks uBlock Origin element picker.
 * @function
 * @param {Function} patcher - A function that patches the HTML, it must return the patched HTML.
 */
a.patchHTML = (patcher) => {
    //Stop loading
    a.win.stop();
    //Get content
    GM_xmlhttpRequest({
        method: "GET",
        url: a.win.location.href,
        headers: {
            Referer: a.doc.referrer,
        },
        onload(result) {
            //Apply patched content
            a.doc.write(patcher(result.responseText));
        },
    });
};
/**
 * Replace a sample of code by syntax breaker.
 * Warning: This breaks uBlock Origin element picker.
 * This is the easiest way to break "stand alone" in-line JavaScript.
 * Can only crash one in-line block.
 * @function
 * @param {string} sample - A sample of code.
 */
a.crashScript = (sample) => {
    a.patchHTML((html) => html.replace(sample, a.c.syntaxBreaker));
};
/**
 * Defines a read-only property to unsafeWindow.
 * May not be able to lock the property's own properties.
 * @function
 * @param {string} name - The name of the property to define, use "." to separate multiple layers.
 * @param {Any} val - The value to set.
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.readOnly = (name, val) => {
    try {
        let parent = a.win;
        let i = name.indexOf(".");
        while (i > -1) {
            parent = parent[name.substring(0, i)];
            name = name.substring(i + 1);
            i = name.indexOf(".");
        }
        //Define the property
        a.win.Object.defineProperty(parent, name, {
            configurable: false,
            set() { },
            get() {
                return val;
            },
        });
    } catch (err) {
        //Failed to define property
        a.out.error(`uBlock Protector failed to define read-only property ${name}!`);
        return false;
    }
    return true;
};
/**
 * Defines a property to unsafeWindow that (tries to) crash scripts who access it.
 * @function
 * @param {string} name - The name of the property to define, use "." to separate multiple layers.
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.noAccess = (name) => {
    const errMsg = "AdBlock Error: This property may not be accessed!";
    try {
        let parent = a.win;
        let i = name.indexOf(".");
        while (i > -1) {
            parent = parent[name.substring(0, i)];
            name = name.substring(i + 1);
            i = name.indexOf(".");
        }
        a.win.Object.defineProperty(parent, name, {
            configurable: false,
            set() {
                throw errMsg;
            },
            get() {
                throw errMsg;
            },
        });
    } catch (err) {
        //Failed to define property
        a.out.error(`uBlock Protector failed to define non-accessible property ${name}!`);
        return false;
    }
    return true;
};
/**
 * Inject CSS into HTML, !important will be added automatically.
 * @function
 * @param {string} str - The CSS to inject.
 */
a.css = (() => {
    const matcher = /;/g;
    return (str) => {
        GM_addStyle(str.replace(matcher, " !important;"));
    };
})();
/**
 * Add a bait element, this sometimes has a side effect that adds an empty bar on top of the page.
 * Sometimes the height of the bait element is checked, so I cannot make it 0 height.
 * @function
 * @param {string} type - The type of the element, example: div.
 * @param {string} identifier - The class or id, example: .test (class) #test (id).
 * @param {boolean} [hidden=false] - Whether the element should be hidden.
 */
a.bait = (type, identifier, hidden) => {
    //Create element
    let elem = a.doc.createElement(type);
    //Add identifier
    switch (identifier.charAt(0)) {
        case '#':
            elem.id = identifier.substring(1);
            break;
        case '.':
            elem.className = identifier.substring(1);
            break;
    }
    //Hide element if needed
    if (hidden) {
        elem.style.display = "none";
    }
    //Add content and prepend to HTML
    elem.innerHTML = "<br>";
    a.doc.documentElement.prepend(elem);
};
/**
 * Set or get a cookie.
 * @function
 * @param {string} key - The key of the cookie.
 * @param {string} [val=undefined] - The value to set, omit this to get the cookie.
 * @param {integer} [time=31536000000] - In how many milliseconds will it expire, defaults to 1 year.
 * @param {string} [path="/"] - The path to set.
 * @return {string} The value of the cookie, null will be returned if the cookie does not exist, and undefined will be returned in set mode.
 */
a.cookie = (key, val, time = 31536000000, path = "/") => {
    if (typeof val === "undefined") {
        //Get mode
        const cookies = a.doc.cookie
        const i = cookies.indexOf(`${key}=`);
        const j = cookies.indexOf(";", i);
        if (i === -1) {
            //Not found
            return null;
        } else {
            if (j === -1) {
                //Goes to the end
                return cookies.substring(i + key.length + 1);
            } else {
                //Extract the value
                return cookies.substring(i + key.length + 1, j);
            }
        }
    } else {
        //Set mode
        let expire = new a.win.Date();
        expire.setTime((new a.win.Date()).getTime() + time);
        a.doc.cookie = `${key}=${a.win.encodeURIComponent(val)};expires=${expire.toGMTString()};path=${path}`;
    }
};
/**
 * Serialize an object into GET request parameters.
 * http://stackoverflow.com/questions/6566456/how-to-serialize-an-object-into-a-list-of-parameters
 * @function
 * @param {Object} obj - The object to serialize.
 * @return {string} The serialized string.
 */
a.serialize = (obj) => {
    var str = "";
    for (var key in obj) {
        if (str !== "") {
            str += "&";
        }
        str += `${key}=${a.win.encodeURIComponent(obj[key])}`;
    }
    return str;
};
/**
 * Generate a native HTML5 player with controls but not autoplay.
 * @function
 * @param {string} source - The source of the video.
 * @param {string} [type=(Auto Detect)] - The type of the video, will be automatically detected if not supplied, and defaults to MP4 if detection failed.
 * @param {string} [width="100%"] - The width of the player.
 * @param {string} [height="auto"] - The height of the player.
 * @return {string} An HTML string of the video player.
 */
a.nativePlayer = (source, type, width = "100%", height = "auto") => {
    //Detect type
    if (!type) {
        const i = source.lastIndexOf(".");
        let temp;
        if (i > -1) {
            temp = source.substring(i + 1);
        }
        switch (temp) {
            case "webm":
                type = "video/webm";
                break;
            case "mp4":
                type = "video/mp4";
                break;
            case "ogg":
                type = "video/ogg";
                break;
            default:
                //Defaults to MP4
                type = "video/mp4";
                break;
        }
    }
    //Construct HTML string
    return `<video width="${width}" height="${height}" controls><source src="${source}" type="${type}" /></video>`;
};
/**
 * Run a function on document-idle (DOMContentLoaded).
 * @function
 * @param {Function} func - The function to run.
 */
a.ready = (...args) => {
    a.on("DOMContentLoaded", ...args);
};
/**
 * Run function that is passed in on document-start (now), document-idle (DOMContentLoaded), and document-end (load).
 * @function
 * @param {Function} func - The function to run.
 */
a.always = (...args) => {
    func();
    a.on("DOMContentLoaded", ...args);
    a.on("load", ...args);
};
/**
 * Observe mutations of the document.
 * @function
 * @param {string} type - The type of mutation to observe.
 * @param {Function} callback - The callback function, relevant data will be passed in.
 */
a.observe = (type, callback) => {
    //Initialize observer
    if (!a.observe.init.done) {
        a.observe.init.done = true;
        a.observe.init();
    }
    //Add to callback array
    switch (type) {
        case "insert":
            a.observe.insertCallbacks.push(callback);
            break;
        case "remove":
            a.observe.removeCallbacks.push(callback);
            break;
    }
    //More types will be added when needed
};
/**
 * Initialize MutationObserver.
 * This should only be called once by a.observe()
 * @function
 */
a.observe.init = () => {
    //Set up observer
    const observer = new a.win.MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            //Insert
            if (mutations[i].addedNodes.length) {
                for (let j = 0; j < a.observe.insertCallbacks.length; j++) {
                    for (let k = 0; k < mutations[i].addedNodes.length; k++) {
                        a.observe.insertCallbacks[j](mutations[i].addedNodes[k]);
                    }
                }
            }
            //Remove
            if (mutations[i].removedNodes.length) {
                for (let j = 0; j < a.observe.removeCallbacks.length; j++) {
                    for (let k = 0; k < mutations[i].removedNodes.length; k++) {
                        a.observe.removeCallbacks[j](mutations[i].removedNodes[k]);
                    }
                }
            }
            //More types will be added when needed
        }
    });
    observer.observe(a.doc, {
        childList: true,
        subtree: true,
    });
};
/**
 * Whether initialization of MutationObserver is done.
 * @var {bool}
 */
a.observe.init.done = false;
/**
 * The callback functions for insert mutations.
 * @var {Array.<Function>}
 */
a.observe.insertCallbacks = [];
/**
 * The callback functions for remove mutations.
 * @var {Array.<Function>}
 */
a.observe.removeCallbacks = [];
/**
 * Returns a unique ID that is also a valid variable name.
 * @function
 * @return {string} Unique ID.
 */
a.uid = () => {
    const chars = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let str = "";
    for (let i = 0; i < 10; i++) {
        str += chars.charAt(a.win.Math.floor(a.win.Math.random() * chars.length));
    }
    a.uid.counter++;
    return str + a.uid.counter.toString();
};
/**
 * Unique ID counter, will be appended to randomly generated string to ensure uniqueness.
 * @var {integer}
 */
a.uid.counter = 0;

//=====Generic=====
/**
 * Apply all generic solutions, this function should be called once from rules.
 * @function
 */
a.generic = () => {
    //@pragma-keepline Based on generic solutions of Anti-Adblock Killer, modified to fit my Core API
    //@pragma-keepline License: https://github.com/reek/anti-adblock-killer/blob/master/LICENSE
    if (a.config.allowGeneric && !a.config.domExcluded) {
        const data = {};
        //===document-start===
        //FuckAdBlock
        a.generic.FuckAdBlock("FuckAdBlock", "fuckAdBlock");
        a.generic.FuckAdBlock("BlockAdBlock", "blockAdBlock");
        //ads.js
        a.readOnly("canRunAds", true);
        a.readOnly("canShowAds", true);
        a.readOnly("isAdBlockActive", false);
        //Playwire
        try {
            let playwireZeus;
            a.win.Object.defineProperty(a.win, "Zeus", {
                configurable: false,
                set(val) {
                    playwireZeus = val;
                },
                get() {
                    //Log
                    a.err("Playwire");
                    //Patch and return
                    try {
                        playwireZeus.AdBlockTester = {
                            check(a) { a(); },
                        };
                    } catch (err) { }
                    return playwireZeus;
                },
            });
        } catch (err) {
            a.out.error("uBlock Protector failed to set up Playwire AdBlocker detector defuser!");
        }
        //===document-idle===
        a.ready(() => {
            //AdBlock Detector (XenForo Rellect)
            if (a.win.XenForo && typeof a.win.XenForo.rellect === "object") {
                //Log
                a.err("XenForo");
                //Patch detector
                a.win.XenForo.rellect = {
                    AdBlockDetector: {
                        start() { },
                    },
                };
            }
            //Adbuddy
            if (typeof a.win.closeAdbuddy === "function") {
                //Log
                a.err("Adbuddy");
                //Disable
                a.win.closeAdbuddy();
            }
            //AdBlock Alerter (WP)
            if (a.doc.querySelector("div.adb_overlay > div.adb_modal_img")) {
                //Log
                a.err("AdBlock Alerter");
                //Remove alert and allow scrolling
                a.doc.querySelector("div.adb_overlay").remove();
                a.css("html, body { height:auto; overflow:auto; }");
            }
            //Block screen
            {
                const elem = a.doc.getElementById("blockdiv");
                if (elem && elem.innerHTML === "disable ad blocking or use another browser without any adblocker when you visit") {
                    //Log
                    a.out.err("Uncaught AdBlock Error: Generic block screens are not allowed on this device!");
                    //Remove block screen
                    elem.remove();
                }
            }
            //Antiblock.org v2
            (() => {
                const re = /^#([a-z0-9]{4,10}) ~ \* \{ display: none; \}/;
                const styles = document.querySelectorAll("style");
                for (let i = 0; i < styles.length; i++) {
                    const style = styles[i];
                    const cssRules = style.sheet.cssRules;
                    for (var j = 0; j < cssRules.length; j++) {
                        const cssRule = cssRules[j];
                        const cssText = cssRule.cssText;
                        if (re.test(cssText)) {
                            const id = re.exec(cssText)[1];
                            const scripts = a.doc.querySelectorAll("script");
                            for (let k = 0; k < scripts.length; k++) {
                                if (scripts[k].text.includes(`w.addEventListener('load',${id},false)`)) {
                                    //Log
                                    a.err("Antiblock.org v2");
                                    //Set data for future uses
                                    data.abo2 = id;
                                    return;
                                }
                            }
                        }
                    }
                }
            })();
            //BetterStopAdblock, Antiblock.org v3, and BlockAdBlock
            {
                const re = /^[a-z0-9]{4,12}$/i;
                for (let prop in a.win) {
                    try {
                        if (!prop.startsWith("webkit") &&
                            prop !== "document" &&
                            re.test(prop) &&
                            (a.win[prop] instanceof a.win.HTMLDocument) === false &&
                            a.win.hasOwnProperty(prop) &&
                            typeof a.win[prop] === "object") {
                            const method = a.win[prop];
                            //BetterStopAdblock and Antiblock.org v3
                            if (method.deferExecution &&
                                method.displayMessage &&
                                method.getElementBy &&
                                method.getStyle &&
                                method.insert &&
                                method.nextFunction) {
                                if (method.toggle) {
                                    //Log
                                    a.err("BetterStopAdblock");
                                    //Set data for future uses
                                    data.bsa = prop;
                                } else {
                                    //Log
                                    a.err("Antiblock.org v3");
                                    //Set data for future uses
                                    data.abo3 = prop;
                                }
                                a.win[prop] = null;
                            }
                            //BlockAdBlock
                            if (a.win.Object.keys(method).length === 3) {
                                //Each key should be 10 character long, one of the 3 keys can be "bab"
                                let isBAB = true;
                                //Verify length
                                const keyLen = a.win.Object.keys(method).join("");
                                if (keyLen !== 30 && keyLen !== 23) {
                                    isBAB = false;
                                } else {
                                    for (let prop in method) {
                                        if (prop.length !== 10 && prop !== "bab") {
                                            isBAB = false;
                                            break;
                                        }
                                    }
                                }
                                if (isBAB) {
                                    //Log
                                    a.err("BlockAdBlock");
                                    //Remove property
                                    a.win[prop] = null;
                                }
                            }
                        }
                    } catch (err) { }
                }
            }
        });
        //===on-insert===
        const re1 = /^[a-z0-9]{4}$/;
        const re2 = /^a[a-z0-9]{6}$/;
        //AntiAdblock (Packer)
        const reIframeId = /^(zd|wd)$/;
        const reImgId = /^(xd|gd)$/;
        const reImgSrc = /\/ads\/banner.jpg/;
        const reIframeSrc = /(\/adhandler\/|\/adimages\/|ad.html)/;
        //Adunblock
        const reId = /^[a-z]{8}$/;
        const reClass = /^[a-z]{8} [a-z]{8}/;
        const reBg = /^[a-z]{8}-bg$/;
        //Antiblock.org (all version)
        const reMsgId = /^[a-z0-9]{4,10}$/i;
        const reTag1 = /^(div|span|b|i|font|strong|center)$/i;
        const reTag2 = /^(a|b|i|s|u|q|p|strong|center)$/i;
        const reWords1 = /ad blocker|ad block|ad-block|adblocker|ad-blocker|adblock|bloqueur|bloqueador|Werbeblocker|adblockert|&#1570;&#1583;&#1576;&#1604;&#1608;&#1603; &#1576;&#1604;&#1587;|блокировщиком/i;
        const reWords2 = /kapat|disable|désactivez|désactiver|desactivez|desactiver|desative|desactivar|desactive|desactiva|deaktiviere|disabilitare|&#945;&#960;&#949;&#957;&#949;&#961;&#947;&#959;&#960;&#959;&#943;&#951;&#963;&#951;|&#1079;&#1072;&#1087;&#1088;&#1077;&#1097;&#1072;&#1090;&#1100;|állítsd le|publicités|рекламе|verhindert|advert|kapatınız/i;
        //Handler
        const onInsertHandler = (insertedNode) => {
            //No-Adblock
            {
                if (insertedNode.nodeName === "DIV" &&
                    insertedNode.id &&
                    insertedNode.id.length === 4 &&
                    re1.test(insertedNode.id) &&
                    insertedNode.firstChild &&
                    insertedNode.firstChild.id &&
                    insertedNode.firstChild.id === insertedNode.id &&
                    insertedNode.innerHTML.includes("no-adblock.com")) {
                    //Log
                    a.err("No-Adblock");
                    //Remove element
                    insertedNode.remove();
                }
            }
            //StopAdblock
            if (insertedNode.nodeName === "DIV" &&
                insertedNode.id &&
                insertedNode.id.length === 7 &&
                re2.test(insertedNode.id) &&
                insertedNode.parentNode &&
                insertedNode.parentNode.id &&
                insertedNode.parentNode.id === insertedNode.id + "2" &&
                insertedNode.innerHTML.includes("stopadblock.org")) {
                //Log
                a.err("StopAdblock");
                //Remove element
                insertedNode.remove();
            }
            //AntiAdblock (Packer)
            if (insertedNode.id &&
                reImgId.test(insertedNode.id) &&
                insertedNode.nodeName === "IMG" &&
                reImgSrc.test(insertedNode.src) ||
                insertedNode.id &&
                reIframeId.test(insertedNode.id) &&
                insertedNode.nodeName === "IFRAME" &&
                reIframeSrc.test(insertedNode.src)) {
                //Log
                a.err("AntiAdblock");
                //Remove element
                insertedNode.remove();
            }
            //Adunblock
            if (typeof a.win.vtfab !== "undefined" &&
                typeof a.win.adblock_antib !== "undefined" &&
                insertedNode.parentNode &&
                insertedNode.parentNode.nodeName === "BODY" &&
                insertedNode.id &&
                reId.test(insertedNode.id) &&
                insertedNode.nodeName === "DIV" &&
                insertedNode.nextSibling &&
                insertedNode.nextSibling.className &&
                insertedNode.nextSibling.nodeName === "DIV") {
                if (insertedNode.className &&
                    reClass.test(insertedNode.className) &&
                    reBg.test(insertedNode.nextSibling.className) &&
                    insertedNode.nextSibling.style &&
                    insertedNode.nextSibling.style.display !== "none") {
                    //Log
                    a.err("Adunblock Premium");
                    //Full Screen Message (Premium)
                    insertedNode.nextSibling.remove();
                    insertedNode.remove();
                } else if (insertedNode.nextSibling.id &&
                    reId.test(insertedNode.nextSibling.id) &&
                    insertedNode.innerHTML.includes("Il semblerait que vous utilisiez un bloqueur de publicité !")) {
                    //Log
                    a.err("Adunblock Free");
                    //Top bar Message (Free)
                    insertedNode.remove();
                }
            }
            //Antiblock.org (all version)
            if (insertedNode.parentNode &&
                insertedNode.id &&
                insertedNode.style &&
                insertedNode.childNodes.length &&
                insertedNode.firstChild &&
                !insertedNode.firstChild.id &&
                !insertedNode.firstChild.className &&
                reMsgId.test(insertedNode.id) &&
                reTag1.test(insertedNode.nodeName) &&
                reTag2.test(insertedNode.firstChild.nodeName)) {
                //Log
                a.err("Antiblock.org");
                //Stop audio message
                const audio = insertedNode.querySelector("audio[loop]");
                if (audio) {
                    audio.pause();
                    audio.remove();
                } else if ((data.abo2 && insertedNode.id === data.abo2) ||
                    (insertedNode.firstChild.hasChildNodes() && reWords1.test(insertedNode.firstChild.innerHTML) && reWords2.test(insertedNode.firstChild.innerHTML))) {
                    //Antiblock.org v2
                    insertedNode.remove();
                } else if ((data.abo3 && insertedNode.id === data.abo3) ||
                    (insertedNode.firstChild.hasChildNodes() && insertedNode.firstChild.firstChild.nodeName === "IMG" && insertedNode.firstChild.firstChild.src.startsWith("data:image/png;base64"))) {
                    //Antiblock.org v3
                    a.win[data.abo3] = null;
                    insertedNode.remove();
                } else if (data.bsa && insertedNode.id === data.bsa) {
                    //BetterStopAdblock
                    a.win[data.bsa] = null;
                    insertedNode.remove();
                }
            }
        };
        //===Set up observer===
        a.observe("insert", onInsertHandler);
    } else {
        //Generic solutions disabled log
        a.out.warn("Generic solutions are disabled on this domain.");
    }
};
/**
 * Setup generic Adfly bypasser, this function should be called once from a.init() if needed.
 * @function
 */
a.generic.AdflyBypasser = () => {
    //@pragma-keepline Based on AdsBypasser
    //@pragma-keepline License: https://github.com/adsbypasser/adsbypasser/blob/master/LICENSE
    const handler = (encodedURL) => {
        if (a.doc.body) {
            //This is not an Adfly page
            return;
        }
        //Some checking
        const index = encodedURL.indexOf("!HiTommy");
        if (index > -1) {
            encodedURL = encodedURL.substring(0, index);
        }
        //Decode URL
        let var1 = "", var2 = "";
        for (let i = 0; i < encodedURL.length; ++i) {
            if (i % 2 === 0) {
                var1 = var1 + encodedURL.charAt(i);
            } else {
                var2 = encodedURL.charAt(i) + var2;
            }
        }
        let decodedURL = a.win.atob(var1 + var2);
        decodedURL = decodedURL.substr(2);
        if (a.win.location.hash) {
            decodedURL += a.win.location.hash;
        }
        //Make sure the URL is not obviously bad
        if (decodedURL.length > 3 && decodedURL.includes(".")) {
            //Stop the window
            a.win.stop();
            //Nuke body since I got the link
            //The new solution is so fast that the body is not loaded
            //a.doc.body.innerHTML = `<div><h2>Adfly skipped by uBlock Protector. Redirecting to real link: <a href="${decodedURL}">${decodedURL}</a></h2></div>`;
            //Redirect
            a.win.onbeforeunload = null;
            //a.win.onunload = null;
            a.win.location.href = decodedURL;
        }
    };
    //Setup variable hijacker
    try {
        let val;
        //Prevent running multiple times
        let flag = true;
        a.win.Object.defineProperty(a.win, "ysmm", {
            configurable: false,
            set(value) {
                if (flag) {
                    flag = false;
                    try {
                        if (typeof value === "string") {
                            handler(value);
                        }
                    } catch (err) { }
                }
                //In case this is not an Adfly page, I want this variable to be functional
                val = value;
            },
            get() {
                return val;
            },
        });
    } catch (err) {
        a.out.error("uBlock Protector failed to set up Adfly bypasser!");
    }
};
/**
 * Create a FuckAdBlock constructor and instance which always returns not detected.
 * @function
 * @param {string} constructorName - The name of the constructor.
 * @param {string} instanceName - The name of the instance.
 * @return {boolean} True if the operation was successful, false otherwise.
 */
a.generic.FuckAdBlock = (constructorName, instanceName) => {
    const patchedFuckAdBlock = function () {
        //@pragma-keepline Based on FuckAdBlock
        //@pragma-keepline License: https://github.com/sitexw/FuckAdBlock/blob/master/LICENSE
        //===Init===
        //On not detected callbacks
        this._callbacks = [];
        //Add on load event
        a.on("load", () => {
            this.emitEvent();
        });
        //===v3 Methods===
        //Set options, do nothing
        this.setOption = () => {
            return this;
        };
        //Check, call on not detected callbacks
        this.check = () => {
            this.emitEvent();
            return true;
        };
        //Call on not detected callbacks
        this.emitEvent = () => {
            //Call callbacks
            for (let i = 0; i < this._callbacks.length; i++) {
                this._callbacks[i]();
            }
            return this;
        };
        //Clear events, empty callback array
        this.clearEvent = () => {
            this._callbacks = [];
        };
        //Add event handler
        this.on = (detected, func) => {
            //Log
            a.err("FuckAdBlock");
            if (!detected) {
                this._callbacks.push(func);
            }
            return this;
        };
        //Add on detected handler, do nothing
        this.onDetected = () => {
            //Log
            a.err("FuckAdBlock");
            return this;
        };
        //Add on not detected handler
        this.onNotDetected = (func) => {
            return this.on(false, func);
        };
        //===v4 Methods===
        this.debug = {};
        //Set debug state, do nothing
        this.debug.set = () => {
            return this;
        };
    };
    //Define FuckAdBlock to unsafeWindow and create its instance, error checks are done in a.readOnly()
    return a.readOnly(constructorName, patchedFuckAdBlock) && a.readOnly(instanceName, new a.win[constructorName]());
};
//Never used but tested and can be activated at any time
/**
 * Enable BetterJsPop v1 defuser.
 * Probably work on 1.x until 1.0.20.
 * In this version, websites are allowed to modify the script, so it can be closured and this will not work.
 * @function
 */
/*
a.generic.BetterJsPopV1 = () => {
    //Create neutralized object
    const noop = () => { };
    const retThis = () => obj;
    let obj = a.win.Object.freeze({
        Browser: a.win.Object.freeze({
            isChrome: false,
            isEdge: false,
            isFirefox: false,
            isIE: false,
            isMac: false,
            isMobile: false,
            isMozilla: false,
            isOpera: false,
            isSafari: false,
            isWebkit: false,
            isWin: false,
            version: 50,
        }),
        _bindTo: [],
        _checked: false,
        _chromeDelay: 300,
        _count: 0,
        _destroyed: false,
        _fired: 0,
        _flashElement: null,
        _flashUrl: "",
        _ignoreListener: false,
        _lastEvent: a.win.Object.freeze({
            event: null,
            prevent: true,
            time: 0,
        }),
        _lastOpenTime: 0,
        _licenseUrl: null,
        _perpage: 1,
        _stack: [],
        add: retThis,
        author: "",
        bindTo: noop,
        destroy: noop,
        exports: noop,
        fire: noop,
        flashActived: noop,
        flashUrl: noop,
        forceStackUseTabUnder: noop,
        getFlashUrl: noop,
        getFocusUrlForTabUnder: noop,
        getLicenseUrl: noop,
        getTabUnderUrl: noop,
        getTargetElement: noop,
        getTargetUrl: noop,
        hasPopunder: noop,
        ignoreListener: noop,
        init: noop,
        initFlash: noop,
        initMobile: noop,
        isRegistered: noop,
        licenseUrl: noop,
        perpage: noop,
        preInit: noop,
        preventEvent: noop,
        removeFlash: noop,
        saveLastEvent: noop,
        shouldIgnoreEvent: noop,
        shouldPreventEvent: noop,
        version: "1.0.20",
    });
    a.readOnly("BetterJsPop", obj);
};
*/
/**
 * Enable BetterJsPop v2 defuser.
 * Should work on 2.x until at least 2.5.35.
 * @function
 */
/*
a.generic.BetterJsPopV2 = () => {
    //Create neutralized object
    const noop = () => { };
    const retThis = () => obj;
    let obj = a.win.Object.freeze({
        Browser: a.win.Object.freeze({
            isAndroid: false,
            isChrome: false,
            isEdge: false,
            isFirefox: false,
            isIE: false,
            isIOS: false,
            isLinux: false,
            isMac: false,
            isMobile: false,
            isMozilla: false,
            isOpera: false,
            isSafari: false,
            isWebkit: false,
            isWin: false,
            longVersion: "55.0.0.0",
            popunderAvailable: noop,
            version: 55,
            versionCompare: noop,
        }),
        Cookie: a.win.Object.freeze({
            get: noop,
            remove: noop,
            set: noop,
        }),
        Event: a.win.Object.freeze({
            bind: noop,
            getTarget: noop,
            unbind: noop,
        }),
        Logger: a.win.Object.freeze({
            log: noop,
            print: noop,
        }),
        Storage: a.win.Object.freeze({
            get: noop,
            isAvailable: noop,
            remove: noop,
            set: noop,
        }),
        Utils: a.win.Object.freeze({
            addQueryString: noop,
            createElement: noop,
            getParent: noop,
            isFlashEnabled: noop,
            merge: noop,
            rand: noop,
            removeElement: noop,
            time: noop,
            uTimeout: noop,
            versionCompare: noop,
        }),
        add: retThis,
        author: "",
        bindTo: noop,
        config: retThis,
        coverElement: noop,
        destroy: noop,
        emptyStack: noop,
        fire: noop,
        getBindTo: noop,
        getClickedElement: noop,
        getConfig: noop,
        getFiredCount: noop,
        getIgnoreTo: noop,
        getLastEvent: noop,
        getLastOpenAt: noop,
        getQueuedCount: noop,
        getStack: noop,
        hasQueued: noop,
        ignoreTo: noop,
        isDebugMode: noop,
        isReachedPerpage: noop,
        object: [],
        releaseDate: "2017/5/31",
        reset: noop,
        version: "2.5.35",
    });
    a.readOnly("BetterJsPop", obj);
};
*/
