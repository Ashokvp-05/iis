"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutOthers = exports.disable2FA = exports.activate2FA = exports.setup2FA = exports.verify2FALogin = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.requestRegistration(req.body);
        res.status(201).json({ message: 'Registration successful', user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.verifyCredentials(req.body);
        res.status(200).json({ message: 'Login successful', user });
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield authService.requestPasswordReset(req.body.email);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        yield authService.resetPassword(token, newPassword);
        res.status(200).json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.resetPassword = resetPassword;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        yield authService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.changePassword = changePassword;
const verify2FALogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, code } = req.body;
        const result = yield authService.verify2FALogin(userId, code);
        res.status(200).json(Object.assign({ message: '2FA verification successful' }, result));
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.verify2FALogin = verify2FALogin;
const setup2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const result = yield authService.setup2FA(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.setup2FA = setup2FA;
const activate2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { code } = req.body;
        const result = yield authService.activate2FA(userId, code);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.activate2FA = activate2FA;
const disable2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const result = yield authService.disable2FA(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.disable2FA = disable2FA;
const logoutOthers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        yield authService.logoutOthers(userId);
        res.status(200).json({ message: 'All other devices logged out successfully. Future requests from those devices will require a fresh login.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.logoutOthers = logoutOthers;
