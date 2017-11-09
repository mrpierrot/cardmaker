#! /usr/bin/env node

"use strict"

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const pkg = require('../package.json');

const { readFile, parseJSON, readSpreadsheet } = require('./utils');
const log = require('./log');
const build = require('./commands/build');
const setup = require('./commands/setup');

const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage')

const CONF_FILE_NAME = 'deckcards.json';

const currentPath = process.cwd();

/**
 * Read the conf file to the "dir" path.
 * @param {string} dir 
 * @return {Promise}
 */
function getConf(dir) {
    const confFilePath = path.join(dir, CONF_FILE_NAME);
    return readFile(confFilePath).then(parseJSON)
        .catch(() => {
            log.error(`"${CONF_FILE_NAME}" not found at ${currentPath}`);
            log.info(`Try to execute command "deckcards setup".`);
        });
}

function getCommandLine(validCommands) {
    return new Promise((resolve, reject) => {
        resolve(commandLineCommands(validCommands));
    });
}

function helpCmd() {
    const cmd = validCommands[validCommands.indexOf(process.argv[3])];
    const sections = {
        undefined: [
            {
                header: 'Description',
                content: 'Generates game cards printable html from a Google SpreadSheet.'
            },
            {
                header: 'Synopsis',
                content: 'deckcards <command> <options>'
            },
            {
                header: 'Command List',
                content: [
                    { name: 'help', summary: 'Display help information about Deckcards.' },
                    { name: 'setup', summary: 'Setup a new project width a default template.' },
                    { name: 'build', summary: 'Import data from Google SpreadSheet and create cards with the template.' }
                ]
            }
        ],
        build:[
            {
                header: 'build',
                content: 'Import data from Google SpreadSheet and create cards with the template.'
            },
            {
                header: 'Options',
                optionList: [
                    {
                      name: 'nobrowser',
                      description: "Don't open generated files in browser"
                    }
                  ]
            }
        ],
        setup: [
            {
                header: 'setup',
                content: 'Setup a new project width a default template.'
            },
        ]
    }
    const usage = commandLineUsage(sections[cmd]);
    log.info(usage);
}

function setupCmd(options) {
    return setup({ currentPath }).then(() => console.info(`setup over`));
}

function buildCmd(options) {
    return getConf(currentPath)
        .then(conf => {
            log.info(`try to execute "build" command`);
            const { template, output, gsheet } = conf;

            build({ template, output, gsheet, currentPath, openInBrowser: !options.nobrowser })
                .catch(err => log.error(`Error: ${err.message}`))
                .then(() => log.strong(`build over`));

        });
}

log.title(`${pkg.name} ${pkg.version}`);

const validCommands = ['build', 'setup', 'help'];

getCommandLine(validCommands).then(({ command, argv }) => {
    const optionDefinitions = {
        build: [
            { name: 'nobrowser', alias: 'n', type: Boolean }
        ],
        help: validCommands.map(cmd => ({ name: cmd, type: Boolean }))
    }

    const options = commandLineArgs(optionDefinitions[command], { argv });
    switch (command) {
        case 'help': helpCmd(); break;
        case 'setup': setupCmd(options); break;
        case 'build': buildCmd(options); break;
        default: 
            log.warn(`No command founded`);
            helpCmd();
            break;
    }

}).catch((e) => {
    log.warn(e.message);
    helpCmd();
});
