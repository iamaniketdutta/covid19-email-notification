const sendEmail = require('../utils/sendEmail');
const config = require('../configs/config');
const statusCode = require('../common/statusCode.json');


const acknowledgingToSubscribe = '<html><head>\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <style>\n' +
    '  p {\n' +
    '  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;\n' +
    '  }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<p style="margin: 2em 1em!important;">You have been subscribed to our COVID-19 Updates Notification feed\n' +
    ' <img goomoji="1f603" data-goomoji="1f603" style="margin:0 0.2ex;vertical-align:middle;max-height:24px" alt="😃" src="https://mail.google.com/mail/e/1f603">\n' +
    ' <br>\n' +
    ' <br>\n' +
    ' Now you will get daily updates of COVID-19 statewide status & important PDFs links at 10:00 AM & 07:00 PM (IST)\n' +
    ' <br>\n' +
    ' <br>\n' +
    ' Keep supporting !!!\n' +
    ' <br><br>\n' +
    ' *Updates - <a href="https://t.me/aniket_covid19_bot" target="_blank">COVID-19 Info Telegram Bot Helper</a> \n' +
    ' </p>\n' +
    '</body>\n' +
    '</html>';

const acknowledgingToUnsubscribe = '<html><head>\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <style>\n' +
    '  p {\n' +
    '  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;\n' +
    '  }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<p style="margin: 2em 1em!important;">You have been Unsubscribed from our COVID-19 Updates Notification feed\n' +
    ' <br>\n' +
    ' <br>\n' +
    ' See you again !!!\n' +
    ' <br><br>\n' +
    ' *Updates - <a href="https://t.me/aniket_covid19_bot" target="_blank">COVID-19 Info Telegram Bot Helper</a> \n' +
    ' </p>\n' +
    '</body>\n' +
    '</html>';

exports.sendAcknowledgementEmail = function (acknowledgementType, sendEmailToData, callback) {
    if (!sendEmailToData){
        return callback(
            {
                statusCode: statusCode.unknown_error,
                message: 'No Email Provided'
            }
        );
    }
    let mailOptions = {
        from: config.emailAccountName,
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        html: ''
    };
    mailOptions.to.push(sendEmailToData);
    mailOptions.subject = 'COVID-19 | Updates | ' + acknowledgementType;
    if (acknowledgementType === 'Subscribe'){
        mailOptions.html = acknowledgingToSubscribe;
    } else {
        mailOptions.html = acknowledgingToUnsubscribe;
    }
    sendEmail.sendEmail(mailOptions, function (sendEmailResponse) {
        return callback(
            {
                statusCode: sendEmailResponse.statusCode,
                message: sendEmailResponse.message
            }
        );
    });
};

