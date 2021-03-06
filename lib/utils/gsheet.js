"use strict"
const GoogleSpreadsheet = require("google-spreadsheet");

/**
 * Read a GSheet worksheet cells and return this to json format
 * @param {Sheet} worksheet a sheet object
 * @return {Promise} a promise
 */
function readWorkSheetCells(worksheet) {
    return new Promise((resolve, reject) =>
        worksheet.getCells(function (err, row_data) {
            if (err) {
                reject(err);
                return;
            }
            var res = [];
            row_data.forEach(function (e) {
                if (!(e.row - 1 in res)) res[e.row - 1] = [];
                res[e.row - 1][e.col - 1] = e.value;
            });
            for (var i = 0; i < res.length; i++) {
                if (res[i] == null) res[i] = [];
            }
            resolve({ sheet: worksheet, cells: res });
        })
    );
}

/**
 * Get authentification if needed.
 * @param {Sheet} sheet 
 * @param {string} credendials 
 * @return {Promise} a promise
 */
function getSpreadSheetAccess(sheet, credendials) {

    return new Promise((resolve, reject) => {
        if (!credendials) resolve();
        else sheet.useServiceAccountAuth(credendials, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });

}
exports.getSpreadSheetAccess = getSpreadSheetAccess;

/**
 * Read a online GSheet and parse this content to json
 * @param {string} crendentials the crendentials file path 
 * @param {string} sheetId the Google SpreadSheet ID in Google Drive
 * @returns {Promise} a promise
 */
exports.readSpreadsheet = function readSpreadsheet(credendials, sheetId) {
    return new Promise((resolve, reject) => {
        const sheet = new GoogleSpreadsheet(sheetId);

        return getSpreadSheetAccess(sheet, credendials).then(() => {
            sheet.getInfo((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const { worksheets } = result;
                    resolve(
                        Promise.all(
                            worksheets.map((worksheet, index) => readWorkSheetCells(worksheet))
                        )
                    )
                }
            });
        })

    })
}