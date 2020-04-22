const utility = require('../common/utility');
const config = require('../configs/config');
const statusCode = require('../common/statusCode.json');

exports.sendEmail = function (mailOptions, callback) {
    utility.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return callback({
                    statusCode: statusCode.unknown_error,
                    message: 'Email not sent'
                });
            } else {
                return callback({
                    statusCode: statusCode.success,
                    message: 'sent successfully'
                });
            }
        });
};
