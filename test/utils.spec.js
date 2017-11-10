const assert = require('assert');
const GoogleSpreadsheet = require("google-spreadsheet");

const utils = require('../lib/utils');

const PUBLIC_SHEET_ID = '1QJm95kTdpR9XT6fC7sirsPRVFjOOri74-jH3mSd1gf8';

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
    describe('#getSpreadSheetAccess()', function () {
        const sheet = new GoogleSpreadsheet(PUBLIC_SHEET_ID);
        it('get public access', function (done) {
            utils.getSpreadSheetAccess(sheet)
                .then(data => {
                    assert.ok(true);
                    done();
                });
        });
    });
    describe('#readSpreadsheet()', function () {
        it('get public sheet content with 2 worksheets', function (done) {
            utils.readSpreadsheet(null,PUBLIC_SHEET_ID)
                .then(data => {
                    assert.equal(data.length,2);
                    done();
                });
        });
    });
});