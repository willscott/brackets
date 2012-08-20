/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, localStorage */

/**
 * PreferencesManager
 *
 */
define(function (require, exports, module) {
    "use strict";
    
    var PreferenceStorage = require("preferences/PreferenceStorage").PreferenceStorage;
    
    var PREFERENCES_KEY = "com.adobe.brackets.preferences";

    // Private Properties
    this.preferencesKey = false;
    this.prefStorage = false;
    this.doLoadPreferences   = false;

    /**
     * Retreive preferences data for the given clientID.
     *
     * @param {string} clientID Unique identifier
     * @param {string} defaults Default preferences stored as JSON
     * @return {PreferenceStorage} 
     */
    function getPreferenceStorage(clientID, defaults) {
        if ((clientID === undefined) || (clientID === null)) {
            throw new Error("Invalid clientID");
        }

        var prefs = this.prefStorage[clientID];

        if (prefs === undefined) {
            // create a new empty preferences object
            prefs = (defaults && JSON.stringify(defaults)) ? defaults : {};
            this.prefStorage[clientID] = prefs;
        }

        return new PreferenceStorage(clientID, prefs);
    }

    /**
     * Save all preference clients.
     */
    function savePreferences() {
        // save all preferences
		var key = this.preferencesKey || PREFERENCES_KEY;
		chrome.storage.sync.set({key: JSON.stringify(this.prefStorage)}, function() {});
    }

    /**
     * @private
     * Reset preferences and callbacks
     */
    function _reset() {
        this.prefStorage = {};

		chrome.storage.sync.remove(this.preferencesKey, function() {});
    }

    /**
     * @private
     * Initialize persistent storage implementation
     */
    this._initStorage = function() {
        if (this.doLoadPreferences) {
			chrome.storage.sync.get(this.preferencesKey, function(data) {
				try {
					this.prefStorage = JSON.parse(data[this.preferencesKey]);
				} catch(e) {
					this.prefStorage = false;
				}

		        // initialize empty preferences if none were found in storage
		        if (!this.prefStorage) {
		            this._reset();
		        }
			}.bind(this));
        } else if(!this.prefStorage) {
        	this._reset();
        }
    }

    // Check localStorage for a preferencesKey. Production and unit test keys
    // are used to keep preferences separate within the same storage implementation.
	var that = this;
	chrome.storage.local.get('preferencesKey', function(key) {
		that.preferencesKey = key['preferencesKey'];
	    if (!that.preferencesKey) {
	        // use default key if none is found
	        that.preferencesKey = PREFERENCES_KEY;
	        that.doLoadPreferences = true;
			that._initStorage();
		} else {
			chrome.storage.local.get('doLoadPreferences', function(load) {
				that.doLoadPreferences = !!load['doLoadPreferences'];		
				that._initStorage();
			});
		}
	}.bind(this));

    // Public API
    exports.getPreferenceStorage    = getPreferenceStorage.bind(this);
    exports.savePreferences         = savePreferences.bind(this);

    // Unit test use only
    exports._reset                  = _reset.bind(this);
});