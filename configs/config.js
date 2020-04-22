let env = 'email_notification_app_live';

let path = {
    email_notification_app_live: './email_notification_app_live.json',
}[env];

module.exports = require(path);
