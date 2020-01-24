"use strict"

const { ncp } = require('ncp');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const {CONF_FILE_NAME} = require('../constants');


function getTemplatePath(template){
    const paths = [
        path.resolve(__dirname, '../../templates', template),
        template
    ];

    const templatePath = _.find(paths, p => fs.existsSync(p));
    if(!templatePath){
        throw new Error(`Unknown template "${template}"`);
    }

    const validPath = path.join(templatePath,CONF_FILE_NAME);
    if(!fs.existsSync(validPath)){
        throw new Error(`Invalid template "${template}" : no "${CONF_FILE_NAME}" found`);
    }

    return templatePath;
}

module.exports = function setup({name, template = "default", currentPath }) {

    return new Promise((resolve, reject) => {
        if(!name){
            throw new Error(`project name is not valid`);
        }

        const projectPath = path.join(currentPath,name);
        if(fs.existsSync(projectPath)){
            throw new Error(`Directory already exists : ${projectPath}`);
        }
        
        const templatePath = getTemplatePath(template);

        mkdirp.sync(projectPath);
        ncp.limit = 16;
        ncp(templatePath, projectPath,{clobber:false}, function (err) {
            if (err) {
                return reject(err);
            }else{
                return resolve()
            }
            
        });
    });
}