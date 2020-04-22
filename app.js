const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const morgan = require('morgan');
const config = require('./configs/config');
const subscribedUserDb = require('./dbHandlers/subscribedUserDb');
const getRawDataFromURL = require('./utils/getRawDataFromURL');
const formatRawData = require('./utils/formatRawData');
const createEmailTemplate = require('./utils/createEmailTemplate');
const acknowledgementEmail = require('./utils/acknowledgementEmail');
const utility = require('./common/utility');
const statusCode = require('./common/statusCode.json');


const port = config.serverPort || 2000;
const server = app.listen(port, function () {
    console.log("Server is running on port: " + port);
});
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// set the view engine to ejs
app.set('view engine', 'ejs');
const sendEmailCampaignCron = require('./cronjob/sendEmailCampaignCron');


//mongo connection
// Create the database connection
mongoose.connect(config.dbUrl, {useNewUrlParser: true});

//Set MongoDB debug mode
mongoose.set('debug', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + config.dbUrl + ' and time is ' + new Date());
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

exports.start = function (callback) {
    getRawDataFromURL.getRawData(config.url, function (getRawDataResponse) {
        if (getRawDataResponse.statusCode === statusCode.success){
            formatRawData.formatRawData(getRawDataResponse.body, function (formatRawDataResponse) {
                if (formatRawDataResponse.statusCode === statusCode.success){
                    createEmailTemplate.createEmailTemplate(formatRawDataResponse, function (createEmailTemplateResponseResponse) {
                        let emailTemplate = createEmailTemplateResponseResponse.fullEmailTemplate;
                        return callback({
                            statusCode: statusCode.success,
                            emailTemplate: emailTemplate
                        });

                    });
                } else {
                    return callback({
                        statusCode: statusCode.unknown_error,
                        message: 'Something went wrong in formatting the data'
                    });
                }
            });
        } else {
            return callback({
                statusCode: statusCode.unknown_error,
                message: 'Something went wrong in getting raw data'
            });
        }
    });
};

// user page
app.get('/', function(req, res) {
    res.render('user' ,utility.renderObject('Subscribe', '','success', '', '') );
});

app.get('/subscription', function (req, response, next) {
    response.render('user' , utility.renderObject('Subscribe', '','success', '', ''));
    }
);

app.post('/subscription', function (req, response, next) {
    if (req.body.emailId === '' || !req.body && !req.body.emailId){
        return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Please provide Email Id', ''));
    }
    let createUserData = {emailId: req.body.emailId};
    const passwordCheck = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (createUserData.emailId.match(passwordCheck) === null) {
        return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Please provide a valid emailId', createUserData.emailId));
    }

    if (req.body.submit === 'Subscribe'){
        subscribedUserDb.get(createUserData, function (err, getResponse) {
            if (err){
                return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
            }
            if (getResponse.length < 1){
                subscribedUserDb.create(createUserData, function (err, res) {
                    if (err){
                        return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
                    } else {
                        acknowledgementEmail.sendAcknowledgementEmail('Subscribe', createUserData.emailId, function (sendAcknowledgementEmailResponse) {
                            if (sendAcknowledgementEmailResponse.statusCode === statusCode.success){
                                return response.render('user' ,
                                    utility.renderObject('Subscribe', 'success','success', createUserData.emailId + " has successfully SUBSCRIBED to our notification feeds !!! Now You will get a custom curated COVID-19 statewide status & important PDFs links email notification twice a day daily." + "Kindly Check your Email", ''));
                            } else {
                                return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
                            }
                        } );
                    }
                });
            } else {
                return response.render('user' ,
                    utility.renderObject('Unsubscribe', 'danger','danger', 'Already subscribed !!! Are You Sure You Want to Unsubscribe From our Mailings?', createUserData.emailId));
            }
        });
    } else if(req.body.submit === 'Unsubscribe'){
        subscribedUserDb.delete(createUserData, function (err, deleteUserResponse) {
            if (err){
                return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
            } if(deleteUserResponse.deletedCount < 1) {
                return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
            } else {
                acknowledgementEmail.sendAcknowledgementEmail('Unsubscribe', createUserData.emailId, function (sendAcknowledgementEmailResponse) {
                    if (sendAcknowledgementEmailResponse.statusCode === statusCode.success){
                        return response.render('user' , utility.renderObject('Subscribe', 'success','success', createUserData.emailId + ' has successfully UNSUBSCRIBED from our notification feeds !!!', ''));
                    } else {
                        return response.render('user' , utility.renderObject('Subscribe', 'danger','success', 'Oops!!! Something went wrong, Please try again by refreshing this page!', createUserData.emailId));
                    }
                } );
            }
        });
    } else if (req.body.submit === 'default'){
        response.render('user' ,
            utility.renderObject('Subscribe', '','success', '', ''));
    }
});

