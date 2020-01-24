const assert = require('assert');
const GoogleSpreadsheet = require("google-spreadsheet");

const gsheet = require('../../../lib/utils/gsheet');

const PUBLIC_SHEET_ID = '1QJm95kTdpR9XT6fC7sirsPRVFjOOri74-jH3mSd1gf8';

describe('gsheet', function () {
    this.timeout(20000);
    describe('#getSpreadSheetAccess()', function () {
        const sheet = new GoogleSpreadsheet(PUBLIC_SHEET_ID);
        it('get public access', function (done) {
            gsheet.getSpreadSheetAccess(sheet)
                .then(data => {
                    assert.ok(true);
                    done();
                });
        });
    });
    describe('#readSpreadsheet()', function () {
        it('get public sheet content with 2 worksheets', function (done) {
            gsheet.readSpreadsheet(null,PUBLIC_SHEET_ID)
                .then(data => {
                    assert.equal(data.length,2);
                    done();
                });
        });
    });
});