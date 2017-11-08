#! /usr/bin/env node

"use strict"

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const pkg = require('../package.json');

const {readFile,parseJSON,readSpreadsheet} = require('./utils');
const log = require('./log');
const cli = require('./cli');
const {build} = require('./commands/build');
const {setup} = require('./commands/setup');

const CONF_FILE_NAME = 'deckcards.json';

const currentPath = process.cwd();

/**
 * Read the conf file to the "dir" path.
 * @param {string} dir 
 * @return {Promise}
 */
function getConf(dir) {
    const confFilePath = path.join(dir, CONF_FILE_NAME);
    return readFile(confFilePath).then(parseJSON);
}

log.title(`${pkg.name} ${pkg.version}`);

if(cli.command == "setup"){
    setup({currentPath}).then(() => console.info(`setup over`));
}else{
    getConf(currentPath)
    .catch(() => {
        log.error(`"${CONF_FILE_NAME}" not found at ${currentPath}`);
        log.info(`Try to execute command "deckcards setup".`);
    })
    .then(conf => {
        
        if(!cli.command){
            log.warn(`No command founded`);
        }else{
            log.info(`try to execute "${cli.command}" command`);
            const {template, output, gsheet} = conf;
            switch(cli.command){
                case 'build': 
                    build({template, output, gsheet,currentPath,openInBrowser:!cli.getArgument('headless')})
                    .catch( err => log.error(`Error: ${err.message}`))
                    .then(() => log.strong(`build over`)); 
                    break;
                default: log.warn(`"${cli.command}" unknown command`);break;
            }
        }
        
    })
}

