"use strict"

const fs = require('fs');
const path = require('path');
const { CONF_FILE_NAME } = require('../constants');
const log = require('../log');

/**
 * Read a file from disk
 * @param {string} file the file path
 * @param {string} encoding the encoding system
 * @return {Promise} a promise
 */
function readFile(file, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        fs.access(file, fs.constants.R_OK, (err) => {
            if (err) {
                reject(`No access to file "${file}"`, err)
            } else {
                fs.readFile(file, encoding, function (err, data) {
                    if (err)
                        reject(err);
                    else
                        resolve(data);
                });
            }
        });
    });
}
exports.readFile = readFile;

/**
 * Parse a string to JSON
 * @param {string} data the json string
 * @return {Promise} a promise
 */
function parseJSON(data) {
    return new Promise((resolve, reject) => {
        try {
            const conf = JSON.parse(data);
            resolve(conf);
        } catch (e) {
            reject(e);
        }

    });
}
exports.parseJSON = parseJSON;

/**
 * Read the conf file to the "dir" path.
 * @param {string} dir 
 * @return {Promise}
 */
exports.getConf = function getConf(dir) {
    const confFilePath = path.join(dir, CONF_FILE_NAME);
    return readFile(confFilePath).then(parseJSON)
        .catch(() => {
            log.error(`"${CONF_FILE_NAME}" not found at ${dir}`);
            log.info(`Try to execute command "deckcards setup".`);
        });
}


exports.getTemplateData = function (name, templates, layouts) {
    let templateData = templates[name] || templates["default"];
    // if template data defined as string then we create a correct object
    if ('string' == typeof (templateData)) {
        templateData = {
            template: templateData,
            layouts: {}
        }
    }

    // we assigne layout to the template
    // general layouts are override by specific layouts
    templateData.layouts = Object.assign({}, layouts, templateData.layouts);
    return templateData;
}