const assert = require('assert');

const build = require('../../../lib/commands/build');
const setup = require('../../../lib/commands/setup');
const {getConf} = require('../../../lib/utils');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const {CONF_FILE_NAME} = require('../../../lib/constants');

const MOCK_PROJECT_NAME = "mockup";

describe('build', function () {
    this.timeout(10000);
    let tmpobj;
    let conf;
    let projectPath;

    before(function (done) {
        tmpobj = tmp.dirSync();
        setup({
            target: MOCK_PROJECT_NAME,
            currentPath: tmpobj.name
        }).then(() => {
            projectPath = path.join(tmpobj.name,MOCK_PROJECT_NAME);
            getConf(projectPath).then((data) => {
                conf = data;
                done();
            })
        });
    });

    it('generate printable files', function (done) {
        const { template, output, gsheet } = conf;
        build({
             template, output, gsheet, currentPath:projectPath, openInBrowser: false
        }).then(()=> {
            const outpuDir = path.join(projectPath,output);
            assert.ok(fs.existsSync(outpuDir));
            assert.ok(fs.readdirSync(outpuDir).length > 0);
            done();
        });
        
    });

    after(function () {
        tmp.setGracefulCleanup({unsafeCleanup:true});
    });

});