"use strict"

const { ncp } = require('ncp');
const path = require('path');

exports.setup = function setup({ templateName = "default", currentPath }) {

    return new Promise((resolve, reject) => {
        ncp.limit = 16;

        const templatePath = path.join(__dirname, '../../templates', templateName);

        ncp(templatePath, currentPath, function (err) {
            if (err) {
                return reject(err);
            }else{
                return resolve()
            }
            
        });
    });
}