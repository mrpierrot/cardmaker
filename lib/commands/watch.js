
const build = require('./build');
const { getDataCachePath } = require('../utils/data');
const { getTemplateData } = require('../utils');
const chokidar = require('chokidar');
const _ = require('lodash');
const log = require('../log');

/**
 * @latency : duration before the build launch after a file are updated (usefull to skip multiple builds at the same time)
 */
module.exports = function watch({ templates, currentLayout, layouts, output, gsheet, currentPath, latency = 100, openInBrowser = true }) {

    const tpls = _.chain(templates)
        .map( (t,k) => getTemplateData(k, templates, layouts))
        .reduce((ret,o,k) => {
            ret[o.template] = true;
            _.each(o.layouts, l => ret[l]=true);
            return ret;
        },{})
        .keys()
        .value();

    tpls.push(getDataCachePath({ gsheet, currentPath }));

    let firstBuildPassed = false;

    let timerId;
    chokidar.watch(tpls).on('all', (event, path) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            build({ templates, currentLayout, layouts, output, gsheet, currentPath, openInBrowser: firstBuildPassed ? false : openInBrowser })
                .then(() => log.strong('Build cards'))
            firstBuildPassed = true;
        }, latency)

    });

    return Promise.resolve();
}