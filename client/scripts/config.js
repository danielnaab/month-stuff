'use strict';


/**
 * Note: the "envify" browserify transform is necessary to ensure that we don't
 * leak the settings for environments other than the one we're building.
 */
if (process.env.NODE_ENV === 'development') {
    module.exports = {
        API_ROOT: 'http://localhost:8080/'
    }
}
else if (process.env.NODE_ENV === 'production') {
    module.exports = {
        API_ROOT: 'http://www.monthstuff.com/'
    }
}
