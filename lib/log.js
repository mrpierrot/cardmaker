"use strict"

const chalk = require('chalk');

exports.title = function title(msg){
    console.info(chalk.bold(msg));
}

exports.strong = function strong(msg){
    console.info(chalk.bold(msg));
}

exports.small = function small(msg){
    console.info(chalk.italic.blueBright(msg));
}

exports.error = function error(msg){
    console.error(chalk.bold.red(msg));
}

exports.warn = function warning(msg){
    console.error(chalk.bold.yellow(msg));
}

exports.log = function warning(msg){
    console.log(msg);
}

exports.info = function info(msg){
    console.info(msg);
}