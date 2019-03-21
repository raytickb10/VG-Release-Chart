'use strict';
exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    `mongodb://tester:poolshark7%@cluster0-tbga6.mongodb.net/test?retryWrites=true`;
exports.PORT = process.env.PORT || 8080;
