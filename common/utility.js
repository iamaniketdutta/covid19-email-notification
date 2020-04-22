const nodeMailer = require('nodemailer');
const config = require('../configs/config');


exports.transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: config.emailAccountName,
        pass: config.emailAccountPassword
    }
});

exports.renderObject = function (submitType, messageClassType, submitClassType, message, emailId) {
    return {
        submitType: submitType,
        messageClassType: messageClassType,
        submitClassType: submitClassType,
        message: message,
        emailId: emailId
    };
};


