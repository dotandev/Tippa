"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventDiscriminator = void 0;
var crypto_1 = require("crypto");
var getEventDiscriminator = function (eventName) {
    var hash = crypto_1.createHash('sha256').update("event:".concat(eventName)).digest();
    return hash.slice(0, 8);
};
exports.getEventDiscriminator = getEventDiscriminator;
