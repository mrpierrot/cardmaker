
const fs = require('fs');
const path = require('path');
const {readFile,parseJSON} = require('../../utils');
const {readSpreadsheet} = require('./gsheet');
const _ = require('lodash');
const Handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const log = require('../../log');
const opn = require('opn');

const metaIndic = '__';
const metaVariables = {
    "COUNT": (value,card,cards) => {
        let val = parseInt(value);
        if(val < 0)val=0;
        const start = cards.length;
        cards.length = cards.length+val-1;
        _.fill(cards,card,start);
    }
}

Handlebars.registerHelper('modulo', function(options) {
    const index = options.data.index + 1,
        gap = options.hash.gap;

    if (index % gap === 0)
        return options.fn(this);
    else
        return options.inverse(this);
});

/**
 * Format GSheet cells to a readable template format.
 * @param {array} cells 
 * @return {object} a key/value object
 */
function formatCells(cells){
    if(cells.length==0)return {}
    const varNames = _.head(cells);
    const varValuesByLine = _.tail(cells);
    return varValuesByLine.map( 
        line => _.reduce(line,(res,value,index) => {
            res[varNames[index]] = value
            return  res;
        },{}) 
    )
}

/**
 * Format Google SpreadSheet sheets to an array of templates object dictionary. 
 * @param {array} sheets an array of Sheet Object
 * @return {array}
 */
function formatGSheetToTemplateFiller(sheets){
    return sheets.map( o => {
        return {
            id:_.kebabCase(o.sheet.title),
            name:o.sheet.title,
            cards: formatCells(o.cells)
        }
    })
}

/**
 * Read a GSheet from Google Drive and parse it to a list of templates dictionnary.
 * @param {string} crendentials the crendentials file path 
 * @param {string} sheetId the Google SpreadSheet ID in Google Drive
 */
function readGSheet(credentials,sheetId) {
    return readSpreadsheet(credentials,sheetId).then(formatGSheetToTemplateFiller);
}

/**
 * Prepare the template to compile.
 * @param {string} file the template file path
 */
function prepareTemplate(file){
    return readFile(file).then( template => Handlebars.compile(template))
}

/**
 * Prepare the template to compile.
 * @param {string} dirPath the base directory path
 * @param {object} templates the template dictionnary
 */
function prepareTemplates(dirPath,templates){
    return Promise.all(_.map(templates, 
            (file,k) => 
                readFile(path.join(dirPath,file))
                .then( template => ({id:k,template:Handlebars.compile(template)})) 
                
            )).then( list => _.chain(list)
                .keyBy('id')
                .mapValues('template')
                .value()
            )
}

function applyMetaVariableEffects(cards){
    return _.reduce(cards, 
            (result,card) => {
                result.push(card);
                const metaKeys = _.chain(card)
                    .pickBy((value,key) => key.startsWith(metaIndic))
                    .mapKeys( (value,key) => key.slice(2))
                    .each( (value,key) => {
                        const action = metaVariables[key];
                        if(action)action(value,card,result);
                    })
                    .value()
                    

                return result;
            },
            []
    );
}

module.exports = function build({templates, output, gsheet,currentPath, openInBrowser=true}){
    const absOutputDir = path.join(currentPath,output);
    const relBase = path.relative(absOutputDir,currentPath);
    const globals = {
        base: relBase
    }
    
    return Promise.all([
        readGSheet(gsheet.credentials?path.join(currentPath,gsheet.credentials):null,gsheet.sheetId),
        prepareTemplates(currentPath,templates)
    ]).then( ([sheets,templates]) => {
        mkdirp.sync(absOutputDir);
        return Promise.all(sheets.map(sheet => {
            console.log(sheet);
            const template = templates[sheet.id] || templates["default"];
            const cards = applyMetaVariableEffects(sheet.cards);
            const rendering = template(Object.assign({},Object.assign({},sheet,{cards}),globals));
            const filePath = path.join(absOutputDir,`${sheet.id}`);
            log.small(`Cards generated at ${filePath}`)
            fs.writeFileSync(filePath,rendering);
            if(openInBrowser)return opn(filePath,{wait:false});
            return true;
        }));
    });
}
