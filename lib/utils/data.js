
const fs = require('fs');
const path = require('path');
const {readSpreadsheet} = require('./gsheet');
const {applyMetaVariableEffects} = require('./index');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const log = require('../log');

const metaVariables = {
    "SKIP": (value, card, cards) => {
        let val = parseInt(value);
        if(  val >= 1 || value == "TRUE"){
            cards.length--;
        }
    }
}

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
    return _.chain(sheets).map( o => {
        return {
            id:_.kebabCase(o.sheet.title),
            name:o.sheet.title,
            cards: applyMetaVariableEffects(metaVariables,formatCells(o.cells))
        }
    })
    .reject( o => o.cards.length == 0)
    .value()
}

/**
 * Read a GSheet from Google Drive and parse it to a list of templates dictionnary.
 * @param {string} crendentials the crendentials file path 
 * @param {string} sheetId the Google SpreadSheet ID in Google Drive
 */
function readGSheet(credentials,sheetId) {
    return readSpreadsheet(credentials,sheetId).then(formatGSheetToTemplateFiller);
}

function getData({gsheet,currentPath}){
    return new Promise((resolve,reject) => {
        const absOutputDir = path.join(currentPath,'.cache');
        const cacheFile = `${absOutputDir}/${gsheet.sheetId}.json`;
        if(fs.existsSync(cacheFile)){
            log.small('Get data from cache');
            resolve(JSON.parse(fs.readFileSync(cacheFile)));
        }else{
            log.small('No cache found : fetch from distant');
            resolve(fetchData({gsheet,currentPath}));
        }
    })
}

function getDataCachePath({gsheet,currentPath}){
    const absOutputDir = path.join(currentPath,'.cache');
    return `${absOutputDir}/${gsheet.sheetId}.json`;
}

function fetchData({gsheet,currentPath}){
    const absOutputDir = path.join(currentPath,'.cache');
    const cacheFile = `${absOutputDir}/${gsheet.sheetId}.json`;

    return readGSheet(gsheet.credentials?path.join(currentPath,gsheet.credentials):null,gsheet.sheetId).then( sheets => {
        mkdirp.sync(absOutputDir);
        fs.writeFileSync(cacheFile,JSON.stringify(sheets,null,4));
        return sheets;
    });
}

module.exports = {
    getData,
    fetchData,
    getDataCachePath
}