const assert = require('assert');

const setup = require('../../lib/commands/setup');
const fs = require('fs');
const path = require('path')
const tmp = require('tmp');
const {CONF_FILE_NAME} = require('../../lib/constants');

const MOCK_PROJECT_NAME = "mockup";

describe('setup', function () {
    this.timeout(20000);
    let tmpobj;

    before(function () {
        tmpobj = tmp.dirSync();
    });

    it('setup a default project', function (done) {
        setup({
            target: MOCK_PROJECT_NAME,
            currentPath: tmpobj.name
        }).then(()=> {
            const projectPath = path.join(tmpobj.name,MOCK_PROJECT_NAME);
            const confFilePath = path.join(projectPath,CONF_FILE_NAME);
            assert.ok(fs.existsSync(projectPath));
            assert.ok(fs.existsSync(confFilePath));
            done();
        });
        
    });

    after(function () {
        tmp.setGracefulCleanup({unsafeCleanup:true});
    });

});