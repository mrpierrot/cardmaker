
const fs = require('fs');
const path = require('path');
const {readFile} = require('../utils');
const {getData} = require('../utils/data');
const _ = require('lodash');
const Handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const log = require('../log');
const open = require('open');

const metaIndic = '__';
const metaVariables = {
    "COUNT": (value,card,cards) => {
        let val = parseInt(value);
        if(val < 0)val=0;
        const start = cards.length;
        cards.length = cards.length+val-1;
        _.fill(cards,card,start);
    },
    "SKIP": (value, card, cards) => {
        let val = parseInt(value);
        if(  val >= 1 || value == "TRUE"){
            cards.length--;
        }
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
    const absOutputDir = path.join(currentPath,output || '.cache');
    const relBase = path.relative(absOutputDir,currentPath);
    const globals = {
        base: relBase
    }
    
    return Promise.all([
        getData({gsheet,currentPath}),
        prepareTemplates(currentPath,templates)
    ]).then( ([sheets,tpls]) => {
        mkdirp.sync(absOutputDir);
        return Promise.all(sheets.map(sheet => {
            const template = tpls[sheet.id] || tpls["default"];
            const templateFile = templates[sheet.id] || templates["default"];
            const cards = applyMetaVariableEffects(sheet.cards);
            const rendering = template(Object.assign({},Object.assign({},sheet,{cards}),globals));
            const filePath = path.join(absOutputDir,`${sheet.id}${path.extname(templateFile)}`);
            log.small(`Cards generated at ${filePath}`)
            fs.writeFileSync(filePath,rendering);
            if(openInBrowser)return open(filePath,{wait:false, app:'chrome'});
            return true;
        }));
    });
}

