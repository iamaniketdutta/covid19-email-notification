const moment = require('moment');
const statusCode = require('../common/statusCode.json');


const emailTemplateBodyStarting = '<html><head>\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <style>\n' +
    '  \n' +
    '  .text-center{\n' +
    '  display: block;\n' +
    '  text-align: center;\n' +
    '  margin-top: 5%;\n' +
    '  }\n' +
    '  \n' +
    '  .text-end{\n' +
    '    display: block;\n' +
    '\ttext-align: right;\n' +
    '\t}\n' +
    '  \n' +
    '  th {\n' +
    '\tbackground-color: #9E9E9E;\n' +
    '\tcolor:white;\n' +
    '\tpadding: 5px;\n' +
    '  }\n' +
    '  tr td {\n' +
    '\tpadding:5px;\n' +
    '\ttext-align: center;\n' +
    '  }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '\n' +
    '<div >\n' +
    '\n' +
    '  <div style="text-align: center;\n' +
    '    margin: 0;\n' +
    '    padding: 0;">\n' +
    '\t<h2 style="display: inline-block;">\n' +
    '\tCorona Statewise Status\n' +
    '\t</h2>\n' +
    '\t<span style="display: inline-block;color: #9e9e9e;">';

const emailBodyStartingAfterLastUpdated = '</span>\n' +
    '\t\n' +
    '  </div>    \n' +
    '  <table border="1" cellpadding="0" cellspacing="0" style="width: 100%;">';

const pdfTableStaring = '</table>\n' +
    '  \n' +
    '</div>\n' +
    '<div style="margin-top: 5%;">\n' +
    '\n' +
    '  <h2 style="text-align: center;">IMPORTANT PDF\'s</h2>    \n' +
    '  <table border="1" cellpadding="0" cellspacing="0" style="width: 100%;">';

const emailTemplateBodyEnding = '</table>\n' +
    '  <div style="margin-top: 2%;">\n' +
    '  <div>\n' +
    '  <div class="text-end">\n' +
    '  @Curated by \n' +
    '  <a style="color: coral;" target="__blank" title="Open my LinkedIn" href="https://www.linkedin.com/in/iamaniketdutta/">Aniket Dutta</a>\n' +
    '  </div>\n' +
    ' \n' +
    '  </div>\n' +
    '  <div class="text-center">\n' +
    '  <span>*Updates - <a href="https://t.me/aniket_covid19_bot" target="_blank">COVID-19 Info Telegram Bot Helper</a></span></div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '</body></html>';

exports.createEmailTemplate = function (data, callback) {
    let distinctPdfLinksOnPage = data.distinctPdfLinksOnPage;
    let stateData = data.stateData;

    let PdfTableHeaderData = '<thead>\n' +
        '      <tr>\n' +
        '        <th>Title</th>\n' +
        '      </tr>\n' +
        '    </thead>';
    let iteratedPdfTr = '';
    distinctPdfLinksOnPage.forEach((item, index)=>{
        let pdfTr = '<tr>\n' +
            '        <td>\n' +
            '<a target="__blank" href="' +item.link +'">'
            + item.title + '</a>\n' +
            '\t\t</td>\n' +
            '      </tr>';
        iteratedPdfTr += pdfTr;
    });
    let createPdfTableBodyData = '<tbody>' + iteratedPdfTr + '</tbody>';

    if (stateData.length > 0){
        let createTableHeaderData = '<thead>\n' +
            '      <tr>\n' +
            '        <th>#</th>';
        let headerTh = '';
        stateData[0].forEach((item, index) => {
            headerTh += '<th>' + item.trim() + '</th>';
        });
        createTableHeaderData += headerTh + '</tr>\n' +
            '    </thead>';

        let createTableBodyData = '<tbody>';
        let trIterate = '';
        let totalConfirmedCases = 0;
        let totalCuredCases = 0;
        let totalDeathCases = 0;
        for (let i = 1; i < stateData.length; i++){
            let td = '';
            let td1st = '<td>' + i + '</td>';
            let tdIterate = '';
            totalConfirmedCases += Number(stateData[i][1]);
            totalCuredCases += Number(stateData[i][2]);
            totalDeathCases += Number(stateData[i][3]);
            stateData[i].forEach((currentItem, index) => {
                tdIterate += '<td>' +currentItem + '</td>';
            });
            td = td1st + tdIterate;
            if (i%2 !== 0)
            {
                trIterate += '<tr style="background-color: #efefef;">' + td + '</tr>';
            } else {
                trIterate += '<tr>' + td + '</tr>';
            }
        }
        trIterate += '<tr style="background-color: #efefef;">\n' +
            '                <td colSpan="2"><strong>Total number of cases in India</strong></td>\n' +
            '                <td><strong>'
            + totalConfirmedCases + '</strong></td>\n' +
            '                <td>\n' +
            '                    <strong>'
            + totalCuredCases + '</strong>\n' +
            '                </td>\n' +
            '                <td>\n' +
            '                    <strong>'
            + totalDeathCases + '</strong>\n' +
            '                </td>\n' +
            '            </tr>';
        createTableBodyData += trIterate + '</tbody>';
        let fullEmailTemplate = emailTemplateBodyStarting + '( Last updated at: ' +
            moment().format('MMMM Do YYYY, h:mm a')
            + ' )' + emailBodyStartingAfterLastUpdated + createTableHeaderData + createTableBodyData + pdfTableStaring +
            PdfTableHeaderData + createPdfTableBodyData + emailTemplateBodyEnding;

            return callback(
                {
                    statusCode: statusCode.success,
                    fullEmailTemplate: fullEmailTemplate,
                }
            );
    } else {
        return callback(
            {
                statusCode: statusCode.unknown_error,
            }
        );
    }
};
