"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var dotenv_1 = require("dotenv");
var buffer_1 = require("buffer");
var util_1 = require("./util");
dotenv_1.config();
var connection = new web3_js_1.Connection(process.env.RPC_URL || (0, web3_js_1.clusterApiUrl)('devnet'), 'confirmed');
var PROGRAM_ID = new web3_js_1.PublicKey(process.env.PROGRAM_ID);
var USER_REGISTERED_DISCRIMINATOR = (0, util_1.getEventDiscriminator)('UserRegisteredEvent');
var listenForUserRegisteredEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Listening to Tippa program @ ".concat(PROGRAM_ID.toBase58()));
        connection.onLogs(PROGRAM_ID, function (logInfo) { return __awaiter(void 0, void 0, void 0, function () {
            var logs, _i, logs_1, log, b64, buffer, discriminator, usernameLen, username, pubkeyOffset, pubkeyBytes, solanaAddress, timestampOffset, timestamp, userEvent;
            return __generator(this, function (_a) {
                logs = logInfo.logs;
                for (_i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
                    log = logs_1[_i];
                    if (!log.startsWith('Program data:'))
                        continue;
                    try {
                        b64 = log.slice('Program data: '.length);
                        buffer = buffer_1.Buffer.from(b64, 'base64');
                        discriminator = buffer.slice(0, 8);
                        if (!discriminator.equals(USER_REGISTERED_DISCRIMINATOR))
                            return [2 /*return*/];
                        usernameLen = buffer.readUInt32LE(8);
                        username = buffer.slice(12, 12 + usernameLen).toString('utf-8');
                        pubkeyOffset = 12 + usernameLen;
                        pubkeyBytes = buffer.slice(pubkeyOffset, pubkeyOffset + 32);
                        solanaAddress = new web3_js_1.PublicKey(pubkeyBytes).toBase58();
                        timestampOffset = pubkeyOffset + 32;
                        timestamp = buffer.readBigInt64LE(timestampOffset);
                        userEvent = {
                            username: username,
                            solanaAddress: solanaAddress,
                            timestamp: timestamp,
                        };
                        console.log('🟢 New Tippa Registration:', userEvent);
                        // TODO: store in MongoDB here or emit to another system
                    }
                    catch (err) {
                        console.error('❌ Failed to parse event:', err);
                    }
                }
                return [2 /*return*/];
            });
        }); }, 'confirmed');
        return [2 /*return*/];
    });
}); };
listenForUserRegisteredEvents().catch(console.error);
