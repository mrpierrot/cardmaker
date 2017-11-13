const assert = require('assert');
const utils = require('../lib/utils');



describe('utils', function () {
    describe('#readFile()', function () {
        it('read a file with content "mox"', function (done) {
            utils.readFile(__dirname + '/assets/file.txt')
                .then(data => {
                    assert.equal('mox', data);
                    done();
                });
        });
    });
    describe('#parseJSON()', function () {
        it('parse a JSON string', function (done) {
            utils.parseJSON('{"foo":1}')
                .then(data => {
                    assert.equal(1, data.foo);
                    done();
                });
        });
    });
});