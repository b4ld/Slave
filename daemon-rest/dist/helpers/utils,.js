'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Utils = /** @class */ (function() {
  function Utils() {}
  Utils.getUrl = function(request) {
    return (
      request.server.info.protocol +
      '://' +
      process.env.HOST +
      ':' +
      process.env.PORT +
      request.url.path
    );
  };
  return Utils;
})();
exports.default = Utils;
