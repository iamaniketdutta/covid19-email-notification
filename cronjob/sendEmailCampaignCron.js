const CronJob = require('cron').CronJob;
const subscribedUserDb = require('../dbHandlers/subscribedUserDb');
const moment = require('moment');
const app = require('../app');
const sendEmail = require('../utils/sendEmail');
const statusCode = require('../common/statusCode.json');
const config = require('../configs/config');


const sendEmailCampaign = new CronJob(config.sendEmailCampaignCronTime,
    function() {
    console.log('sendEmailCampaign cron starts at: ' + moment.now());
    try{
        subscribedUserDb.get({}, function (err, subscribedUserDbResponse) {
            if (err){
                console.log('sendEmailCampaign cron ends at: ' + moment.now());
            }
            if (subscribedUserDbResponse.length < 1){
                console.log('sendEmailCampaign cron ends at: ' + moment.now());
            } else {
                let subscribedUserDbData = JSON.parse(JSON.stringify(subscribedUserDbResponse));
                if (subscribedUserDbData.length > 0)
                {
                    app.start(function (response) {
                        if (response.statusCode === statusCode.success){
                            let bccEmailList = [];
                            subscribedUserDbData.forEach((item, index) => {
                                if (item.emailId){
                                    bccEmailList.push(item.emailId);
                                }
                            });

                            const mailOptions = {
                                from: config.emailAccountName,
                                to: [],
                                cc: [],
                                bcc: bccEmailList,
                                subject: 'COVID-19 | Updates',
                                html: response.emailTemplate
                            };
                            sendEmail.sendEmail(mailOptions, function (sendEmailResponse) {
                                if (sendEmailResponse.statusCode === statusCode.success){
                                    console.log('sendEmailCampaign cron ends at: ' + moment.now());
                                    console.log('sendEmailCampaign sent successfully to : ' + bccEmailList);
                                } else {
                                    console.log('sendEmailCampaign cron ends at: ' + moment.now());
                                    console.log(sendEmailResponse.message);
                                }
                            });
                        } else {
                            console.log('sendEmailCampaign cron ends at: ' + moment.now());
                        }
                    });

                }
                else {
                    console.log('sendEmailCampaign cron ends at: ' + moment.now());
                }
            }
        });
    } catch (e) {
        console.log('sendEmailCampaign cron ends at: ' + moment.now());
        console.log(e.message);
    }

}, null, true, config.cronTimeZoneName);

sendEmailCampaign.start();
