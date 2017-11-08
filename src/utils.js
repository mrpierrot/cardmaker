"use strict"

const fs = require('fs');

exports.readFile = function readFile(file,encoding='utf8') {
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

exports.parseJSON = function parseJSON(data){
    return new Promise((resolve, reject) => {
        try {
            const conf = JSON.parse(data);
            resolve(conf);
        } catch (e) {
            reject(e);
        }

    });
}