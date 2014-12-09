'use strict';


var CONFIG = {
    STATE_VERSION: 0
}


/**
 * Note: the "envify" browserify transform is necessary to ensure that we don't
 * leak the settings for environments other than the one we're building.
 */
if (process.env.NODE_ENV === 'development') {
    CONFIG.API_ROOT = 'http://localhost:8080/api/'
}
else if (process.env.NODE_ENV === 'production') {
    CONFIG.API_ROOT = 'http://www.monthstuff.com/api/'
}


module.exports = CONFIG
