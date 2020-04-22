const cheerio = require("cheerio");
const _ = require('lodash');
const statusCode = require('../common/statusCode.json');


exports.formatRawData = function (data, callback) {
    let $ = cheerio.load(data);
    const table = $('div.data-table table');
    const tableHead = $(table).find('thead');
    let stateData  = [];
    let allPdfLinksOnPage  = [];

    $('a').each((index ,link) => {
        const linkAttr = $(link).attr('href');
        if(linkAttr.includes('.pdf') || linkAttr.includes('.PDF')) {
            let linkTitle = $(link).text().trim();
            linkTitle = linkTitle.replace(/^\d+\.\s*/, '');
            if(linkTitle.length >= 120) {
                linkTitle = linkTitle.slice(0, 120) + '...'
            }

            allPdfLinksOnPage.push({
                link: linkAttr,
                title: linkTitle
            })
        }
    });

    let distinctPdfLinksOnPage = _.uniqBy(allPdfLinksOnPage, 'link');
    distinctPdfLinksOnPage = _.uniqBy(distinctPdfLinksOnPage, 'title');

    tableHead.children().each((_, elem) => {
        const titles = [];
        const rows = $(elem).find('th');
        rows.each((i, row) => {
            if(i !== 0) {
                titles.push($(row).text().trim())
            }
        });
        stateData.push(titles)
    });

    const tableBody = $(table).find('tbody');
    tableBody.children().each((index, element) => {
        const rows = $(element).find('td');
        if (rows.length === 5 ) {
            const perStateData = [];
            rows.each((i, row) => {
                if(i !== 0) {
                    perStateData.push($(row).text().replace(/[^\w\s]/gi, ''));
                }
            });

            if(perStateData.length !== 0) {
                stateData.push(perStateData)
            }
        }
    });

    if (stateData.length && distinctPdfLinksOnPage.length) {
        return callback(
            {
                statusCode: statusCode.success,
                stateData: stateData,
                distinctPdfLinksOnPage: distinctPdfLinksOnPage
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
