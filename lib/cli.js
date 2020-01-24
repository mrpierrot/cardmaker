#! /usr/bin/env node

"use strict"

const _ = require('lodash');
const pkg = require('../package.json');

const { getConf } = require('./utils');
const log = require('./log');
const { build, fetch, setup, watch } = require('./index');


const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage');

const currentPath = process.cwd();

function getCommandLine(validCommands) {
    return new Promise((resolve, reject) => {
        resolve(commandLineCommands(validCommands));
    });
}

function helpCmd(options = {}) {
    const { name: target } = options;
    const sections = {
        undefined: [
            {
                header: 'Description',
                content: 'Generates game cards printable html from a Google SpreadSheet.'
            },
            {
                header: 'Synopsis',
                content: 'cardmaker <command> <options>'
            },
            {
                header: 'Command List',
                content: [
                    { name: 'help', summary: 'Display help information about Cardmaker.' },
                    { name: 'setup', summary: 'Setup a new project width a default template.' },
                    { name: 'fetch', summary: 'Import data from Google SpreadSheet.' },
                    { name: 'build', summary: 'Create cards with the template.' },
                    { name: 'watch', summary: 'build when data and templates files are modified.' }
                ]
            }
        ],
        fetch: [
            {
                header: 'fetch',
                content: 'Import data from Google SpreadSheet.'
            },
            {
                header: 'Synopsis',
                content: 'cardmaker fetch'
            },
            {
                header: 'Options',
                content: 'No options'
            }
        ],
        build: [
            {
                header: 'build',
                content: 'Import data from Google SpreadSheet and create cards with the template.'
            },
            {
                header: 'Synopsis',
                content: 'cardmaker build <options>'
            },
            {
                header: 'Options',
                optionList: [
                    {
                        name: 'layout -l',
                        description: "Select the current layout (default : basic)"
                    },
                    {
                        name: 'nobrowser -n',
                        description: "Skip opening generated of files in the browser"
                    }
                ]
            }
        ],
        watch: [
            {
                header: 'watch',
                content: 'Generate cards when files data en templates files are modified.'
            },
            {
                header: 'Synopsis',
                content: 'cardmaker watch <options>'
            },
            {
                header: 'Options',
                optionList: [
                    {
                        name: 'layout -l',
                        description: "Select the current layout (default : basic)"
                    },
                    {
                        name: 'nobrowser -n',
                        description: "Skip opening generated of files in the browser"
                    }
                ]
            }
        ],
        setup: [
            {
                header: 'setup',
                content: 'Setup a new project width a default template.'
            },
            {
                header: 'Synopsis',
                content: 'cardmaker setup <project_name> <options>'
            },
            {
                header: 'Options',
                optionList: [
                    {
                        name: 'name -n (default)',
                        description: "The name of the project"
                    },
                    {
                        name: 'template -t',
                        description: "Use a specific template"
                    }
                ]
            }
        ]
    }

    const conf = sections[target];
    if (conf) {
        log.info(commandLineUsage(conf));
    } else {
        log.warn(`No help found for ${target}`)
    }
}

function setupCmd(options) {
    return setup(Object.assign({}, options, { currentPath }))
        .then(() => log.info(`Project "${options.name}" created `))
        .catch(e => log.error(e.message));
}

function fetchCmd(options) {
    return getConf(currentPath)
        .then(conf => {
            log.info(`try to execute "fetch" command`);
            const { gsheet } = conf;

            fetch({ gsheet, currentPath })
                .catch(err => log.error(`Error: ${err.message}`))
                .then(() => log.strong(`fetch over`));

        });
}

function buildCmd(options) {
    return getConf(currentPath)
        .then(conf => {
            log.info(`try to execute "build" command`);
            const { templates, layouts, output, gsheet } = conf;

            build({ templates, layouts, currentLayout: options.layout, output, gsheet, currentPath, openInBrowser: !options.nobrowser })
                .catch(err => log.error(`Error: ${err.message}`))
                .then(() => log.strong(`build over`));

        });
}

function watchCmd(options) {
    return getConf(currentPath)
        .then(conf => {
            log.info(`try to execute "watch" command`);
            const { templates, layouts, output, gsheet } = conf;

            watch({ templates, layouts, currentLayout: options.layout, output, gsheet, currentPath, openInBrowser: !options.nobrowser })
                .catch(err => log.error(`Error: ${err.message}`));

        });
}

log.title(`${pkg.name} ${pkg.version}`);

const validCommands = ['build', 'setup', 'help', 'fetch', 'watch'];

getCommandLine(validCommands).then(({ command, argv }) => {

    const optionDefinitions = {
        setup: [
            { name: 'name', alias: 'n', type: String, defaultOption: true },
            { name: 'template', alias: 't', type: String }
        ],
        build: [
            { name: 'layout', alias: 'l', type: String },
            { name: 'nobrowser', alias: 'n', type: Boolean }
        ],
        watch: [
            { name: 'layout', alias: 'l', type: String },
            { name: 'nobrowser', alias: 'n', type: Boolean }
        ],
        help: [
            { name: 'name', alias: 'n', type: String, defaultOption: true }
        ]
    }

    const options = commandLineArgs(optionDefinitions[command], { argv });
    switch (command) {
        case 'help': helpCmd(options); break;
        case 'setup': setupCmd(options); break;
        case 'build': buildCmd(options); break;
        case 'fetch': fetchCmd(options); break;
        case 'watch': watchCmd(options); break;
        default:
            log.warn(`No command founded`);
            helpCmd();
            break;
    }

}).catch((e) => {
    log.warn(e.message);
    helpCmd();
});
