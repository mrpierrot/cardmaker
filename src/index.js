"use strict"

const path = require('path');
const {readFile,parseJSON} = require('./utils');

const CONF_FILE_NAME = 'deckcards.json';

const currentPath = process.cwd();

function getConf(dir) {
    const confFilePath = path.join(dir, CONF_FILE_NAME);
    return readFile(confFilePath).then(parseJSON);
}

function parseGSheet(credentials) {

}

getConf(currentPath).then(conf => {
    console.log(conf);
});