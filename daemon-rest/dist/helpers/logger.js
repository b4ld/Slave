'use strict';
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
  };
Object.defineProperty(exports, '__esModule', { value: true });
var Winston = require('winston');
var Dotenv = require('dotenv');
Dotenv.config();
var ApiLogger = /** @class */ (function() {
  function ApiLogger() {}
  ApiLogger.newInstance = function() {
    var consoleTransport = new Winston.transports.Console({
      format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.timestamp(),
        Winston.format.align(),
        Winston.format.printf(function(info) {
          var timestamp = info.timestamp,
            level = info.level,
            message = info.message,
            args = __rest(info, ['timestamp', 'level', 'message']);
          var ts = timestamp.slice(0, 19).replace('T', ' ');
          return (
            ts +
            ' [' +
            level +
            ']: ' +
            message +
            ' ' +
            (Object.keys(args).length ? JSON.stringify(args, null, 2) : '')
          );
        })
      ),
      level: process.env.LOG_LEVEL,
    });
    return Winston.createLogger({
      transports: [consoleTransport],
    });
  };
  return ApiLogger;
})();
exports.ApiLogger = ApiLogger;
exports.default = ApiLogger.newInstance();
