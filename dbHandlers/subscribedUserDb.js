const mongoose = require('mongoose');
const moment = require('moment');


let subscribedUserSchema = new mongoose.Schema(
    {
                emailId: {type: String, default: null},
                subscribedAt: {type: Number, default: moment.now()},
                subscribedAtFormatedDate: {type: String, default: moment().format()}
    }
);

let subscribedUser = new mongoose.model('subscribedUser', subscribedUserSchema);

exports.get = function (condition, callback) {
    subscribedUser.find(condition).exec(callback);
};

exports.create = function (data, callback) {
subscribedUser(data).save(callback);
};

exports.delete = function (condition, callback) {
subscribedUser.deleteOne(condition).exec(callback);
};
