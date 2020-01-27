const puppeteer = require('puppeteer');
const path = require('path');
const mkdirp = require('mkdirp');
const build = require('./build');
const log = require('../log');

module.exports = async function exportToPdf({templates, layouts, currentLayout='basic', output, gsheet,currentPath}){

    const files = await build({ templates, currentLayout, layouts, output, gsheet, currentPath, openInBrowser: false })

    const absOutputDir = path.join(currentPath,output || 'export',currentLayout);
    mkdirp.sync(absOutputDir);

    const browser = await puppeteer.launch();
    for(var i=0,c=files.length;i<c;i++){
        const file = files[i];
        const page = await browser.newPage();
        const outputPath = `export/${currentLayout}/${file.id}.pdf`;
        await page.goto(file.path, {waitUntil: 'networkidle2'});
        await page.pdf({path: outputPath, printBackground : true, preferCSSPageSize : true});
        log.info(`${outputPath} file created`);
    }
    await browser.close();
    return true;
}