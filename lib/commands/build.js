
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
        const newLength = cards.length+val-1;
        if(newLength >= 0){
            cards.length = cards.length+val-1;
            _.fill(cards,card,start);
        }
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

module.exports = function build({templates, layouts, currentLayout, output, gsheet,currentPath, openInBrowser=true}){
    const absOutputDir = path.join(currentPath,output || '.cache');
    const relBase = path.relative(absOutputDir,currentPath);
    const globals = {
        base: relBase
    }

    if(!currentLayout) currentLayout = "basic";
    
    return getData({gsheet,currentPath}).then( (sheets) => {
        mkdirp.sync(absOutputDir);

        return Promise.all(sheets.map(sheet => {

            let templateData = templates[sheet.id] || templates["default"];
            // if template data defined as string then we create a correct object
            if( 'string' == typeof(templateData)){
                templateData = {
                    template : templateData,
                    layouts : {}
                }
            }
            
            // we assigne layout to the template
            // general layouts are override by specific layouts
            templateData.layouts = Object.assign({},layouts,templateData.layouts);
            let template = null;

            const templateFile = path.join(currentPath,templateData.template);
            if(!fs.existsSync(templateFile)){
                log.warn(`${templateFile} not found`);
                return Promise.reject(`${templateFile} not found`);
            }

            // if no layout : we use the basic template
            if(_.isEmpty(templateData.layouts)){
                template = Handlebars.compile(fs.readFileSync(templateFile).toString());
            }
            // else we use the layout plus the template
            // the template is use as a partial 'card'
            else{
                const layoutFile = path.join(currentPath,templateData.layouts[currentLayout]);
                
                if(!fs.existsSync(layoutFile)){
                    log.warn(`${layoutFile} not found`);
                    return Promise.reject(`${layoutFile} not found`);
                }

                Handlebars.registerPartial('card',fs.readFileSync(templateFile).toString())
                template = Handlebars.compile(fs.readFileSync(layoutFile).toString());
            }

            const cards = applyMetaVariableEffects(sheet.cards);
            const variables = Object.assign({},Object.assign({},sheet,{cards}),globals);

            const rendering = template(variables);
            const filePath = path.join(absOutputDir,`${sheet.id}.html`);
            log.small(`Cards generated at ${filePath}`)
            fs.writeFileSync(filePath,rendering);
            if(openInBrowser)return open(filePath,{wait:false, app:'chrome'});
            return true;
        }));
    });
}

