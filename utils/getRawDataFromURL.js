const request = require("request");
const statusCode = require('../common/statusCode.json');


exports.getRawData = function (url, callback) {
    request.get(url, function (err, HttpResponse, Body) {
        if (err) {
            return callback(
                {
                    statusCode: statusCode.unknown_error
                }
            );
        }
        if (Body){
            return callback(
                {
                    statusCode: statusCode.success,
                    body: Body
                }
            );
        }
    });
};
