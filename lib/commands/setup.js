"use strict"

const { ncp } = require('ncp');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

module.exports = function setup({target, templateName = "default", currentPath }) {

    return new Promise((resolve, reject) => {
        if(!target){
            throw new Error(`project name is not valid`);
        }

        const projectPath = path.join(currentPath,target);
        if(fs.existsSync(projectPath)){
            throw new Error(`Directory already exists : ${projectPath}`);
        }

        mkdirp.sync(projectPath);

        ncp.limit = 16;

        const templatePath = path.join(__dirname, '../../templates', templateName);

        ncp(templatePath, projectPath,{clobber:false}, function (err) {
            if (err) {
                return reject(err);
            }else{
                return resolve()
            }
            
        });
    });
}